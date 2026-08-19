"""Standalone MediaPipe HTTP server for Spark's camera feature."""

from __future__ import annotations

import base64
import math
import os
import subprocess
import tempfile
import threading
from contextlib import asynccontextmanager
from dataclasses import dataclass

import cv2
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


LANDMARK = {
    "NOSE": 0, "LEFT_EAR": 7, "RIGHT_EAR": 8,
    "LEFT_SHOULDER": 11, "RIGHT_SHOULDER": 12,
    "LEFT_ELBOW": 13, "RIGHT_ELBOW": 14,
    "LEFT_WRIST": 15, "RIGHT_WRIST": 16,
    "LEFT_HIP": 23, "RIGHT_HIP": 24,
    "LEFT_KNEE": 25, "RIGHT_KNEE": 26,
    "LEFT_ANKLE": 27, "RIGHT_ANKLE": 28,
}


@dataclass(frozen=True)
class Profile:
    required: tuple[str, ...]
    required_any: tuple[tuple[str, ...], ...] = ()
    required_one_set: tuple[tuple[str, ...], ...] = ()
    display_only: tuple[str, ...] = ()
    visibility: float = 0.5

    @property
    def display_names(self) -> tuple[str, ...]:
        names = [*self.required, *self.display_only]
        for group in self.required_any:
            names.extend(group)
        for group in self.required_one_set:
            names.extend(group)
        return tuple(dict.fromkeys(names))


LOWER_BODY = (
    "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_HIP", "RIGHT_HIP",
    "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE",
)

PROFILES = {
    # A slightly angled camera can hide the far ankle. One complete leg chain is
    # enough; the less reliable side is repaired from the visible side below.
    "squat": Profile(
        ("LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_HIP", "RIGHT_HIP"),
        required_one_set=(
            ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"),
            ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"),
        ),
        display_only=LOWER_BODY,
        visibility=0.45,
    ),
    "lunge": Profile(
        ("LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_HIP", "RIGHT_HIP"),
        required_one_set=(
            ("LEFT_HIP", "LEFT_KNEE", "LEFT_ANKLE"),
            ("RIGHT_HIP", "RIGHT_KNEE", "RIGHT_ANKLE"),
        ),
        display_only=LOWER_BODY,
        visibility=0.45,
    ),
    "chin_tuck": Profile(
        ("NOSE", "LEFT_SHOULDER", "RIGHT_SHOULDER"),
        required_any=(("LEFT_EAR", "RIGHT_EAR"),),
    ),
    "shoulder_roll": Profile(
        ("LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW"),
        display_only=("LEFT_WRIST", "RIGHT_WRIST"),
    ),
    "chest_opener": Profile(
        ("LEFT_ELBOW", "RIGHT_ELBOW", "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_HIP", "RIGHT_HIP"),
        display_only=("LEFT_WRIST", "RIGHT_WRIST"),
    ),
    "side_bend": Profile(
        ("LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_HIP", "RIGHT_HIP"),
        display_only=("NOSE",),
    ),
}


class Landmark(BaseModel):
    index: int
    x: float
    y: float
    z: float
    visibility: float


class PoseRequest(BaseModel):
    image: str
    exercise_type: str = "squat"
    timestamp_sec: float | None = None


class PoseResponse(BaseModel):
    success: bool
    landmarks: list[Landmark] | None = None
    angles: list[float] | None = None
    message: str | None = None


def _ensure_ascii_mediapipe_path() -> None:
    """Work around MediaPipe model loading failures under Korean Windows paths."""
    import mediapipe.python.solution_base as solution_base

    try:
        os.path.abspath(solution_base.__file__).encode("ascii")
        return
    except UnicodeEncodeError:
        pass

    import mediapipe as mp

    parent = os.path.join(tempfile.gettempdir(), "spark_mp_root")
    junction = os.path.join(parent, "mediapipe")
    os.makedirs(parent, exist_ok=True)
    if not os.path.exists(junction):
        subprocess.run(
            ["cmd", "/c", "mklink", "/J", junction, os.path.dirname(mp.__file__)],
            capture_output=True,
            check=False,
        )
    if not os.path.exists(junction):
        raise RuntimeError("MediaPipe 모델 경로를 만들지 못했습니다. 프로젝트를 영문 경로로 이동하세요.")
    solution_base.__file__ = os.path.join(junction, "python", "solution_base.py")


_ensure_ascii_mediapipe_path()
import mediapipe as mp  # noqa: E402


class Detector:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self.pose = mp.solutions.pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.45,
            min_tracking_confidence=0.45,
        )

    def detect(self, rgb: np.ndarray) -> list[Landmark]:
        # MediaPipe Pose is stateful and not thread-safe. Serializing its short
        # inference section prevents corrupted tracking state under concurrent calls.
        with self._lock:
            result = self.pose.process(rgb)
        if not result.pose_landmarks:
            return []
        return [
            Landmark(index=i, x=item.x, y=item.y, z=item.z, visibility=item.visibility)
            for i, item in enumerate(result.pose_landmarks.landmark)
        ]


_detector: Detector | None = None
_detector_creation_lock = threading.Lock()


def get_detector() -> Detector:
    global _detector
    if _detector is None:
        with _detector_creation_lock:
            if _detector is None:
                _detector = Detector()
    return _detector


def _visible(landmarks: list[Landmark], profile: Profile) -> bool:
    by_index = {item.index: item for item in landmarks}

    def valid(name: str) -> bool:
        item = by_index.get(LANDMARK[name])
        return item is not None and item.visibility >= profile.visibility

    return all(valid(name) for name in profile.required) and all(
        any(valid(name) for name in group) for group in profile.required_any
    ) and (
        not profile.required_one_set
        or any(all(valid(name) for name in group) for group in profile.required_one_set)
    )


def _point(by_index: dict[int, Landmark], name: str) -> tuple[float, float]:
    item = by_index[LANDMARK[name]]
    return item.x, item.y


def _distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    return math.hypot(a[0] - b[0], a[1] - b[1])


def _angle(a: Landmark, b: Landmark, c: Landmark) -> float:
    radians = math.atan2(c.y - b.y, c.x - b.x) - math.atan2(a.y - b.y, a.x - b.x)
    degrees = abs(math.degrees(radians))
    return 360 - degrees if degrees > 180 else degrees


def calculate_metrics(landmarks: list[Landmark], exercise_type: str) -> list[float]:
    by_index = {item.index: item for item in landmarks}
    point = lambda name: by_index[LANDMARK[name]]

    if exercise_type in ("squat", "lunge"):
        left_reliability = min(
            point("LEFT_HIP").visibility,
            point("LEFT_KNEE").visibility,
            point("LEFT_ANKLE").visibility,
        )
        right_reliability = min(
            point("RIGHT_HIP").visibility,
            point("RIGHT_KNEE").visibility,
            point("RIGHT_ANKLE").visibility,
        )
        left_knee = _angle(point("LEFT_HIP"), point("LEFT_KNEE"), point("LEFT_ANKLE"))
        right_knee = _angle(point("RIGHT_HIP"), point("RIGHT_KNEE"), point("RIGHT_ANKLE"))
        left_hip = _angle(point("LEFT_SHOULDER"), point("LEFT_HIP"), point("LEFT_KNEE"))
        right_hip = _angle(point("RIGHT_SHOULDER"), point("RIGHT_HIP"), point("RIGHT_KNEE"))
        # Prevent a hallucinated far-side ankle from creating a false repetition.
        if left_reliability < 0.45 <= right_reliability:
            left_knee, left_hip = right_knee, right_hip
        elif right_reliability < 0.45 <= left_reliability:
            right_knee, right_hip = left_knee, left_hip
        return [round(left_knee, 2), round(right_knee, 2), round(left_hip, 2), round(right_hip, 2)]

    left_shoulder, right_shoulder = _point(by_index, "LEFT_SHOULDER"), _point(by_index, "RIGHT_SHOULDER")
    shoulder_mid = ((left_shoulder[0] + right_shoulder[0]) / 2, (left_shoulder[1] + right_shoulder[1]) / 2)
    width = max(_distance(left_shoulder, right_shoulder), 0.01)

    if exercise_type == "chin_tuck":
        ears = [point("LEFT_EAR"), point("RIGHT_EAR")]
        ear = max(ears, key=lambda item: item.visibility)
        return [round(abs(point("NOSE").x - ear.x) / width, 3)]
    if exercise_type == "shoulder_roll":
        elbow_y = (point("LEFT_ELBOW").y + point("RIGHT_ELBOW").y) / 2
        return [round((elbow_y - shoulder_mid[1]) / width, 3)]
    if exercise_type == "chest_opener":
        left = _angle(point("LEFT_ELBOW"), point("LEFT_SHOULDER"), point("LEFT_HIP"))
        right = _angle(point("RIGHT_ELBOW"), point("RIGHT_SHOULDER"), point("RIGHT_HIP"))
        return [round((left + right) / 2, 2)]

    left_hip, right_hip = _point(by_index, "LEFT_HIP"), _point(by_index, "RIGHT_HIP")
    hip_mid = ((left_hip[0] + right_hip[0]) / 2, (left_hip[1] + right_hip[1]) / 2)
    tilt = math.degrees(math.atan2(shoulder_mid[0] - hip_mid[0], hip_mid[1] - shoulder_mid[1]))
    return [round(tilt, 2)]


def _decode_image(value: str) -> np.ndarray | None:
    payload = value.split(",", 1)[1] if "," in value else value
    try:
        data = np.frombuffer(base64.b64decode(payload, validate=True), dtype=np.uint8)
    except (ValueError, TypeError):
        return None
    return cv2.imdecode(data, cv2.IMREAD_COLOR)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Load the model before health checks pass so the first demo frame is not slow.
    get_detector()
    yield


app = FastAPI(title="Spark Pose Server", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "spark-pose-server"}


@app.post("/api/v1/pose", response_model=PoseResponse)
def detect_pose(request: PoseRequest) -> PoseResponse:
    profile = PROFILES.get(request.exercise_type)
    if profile is None:
        return PoseResponse(success=False, message=f"지원하지 않는 운동: {request.exercise_type}")
    image = _decode_image(request.image)
    if image is None:
        return PoseResponse(success=False, message="카메라 이미지를 읽지 못했습니다.")
    landmarks = get_detector().detect(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    if not landmarks:
        return PoseResponse(success=False, message="전신이 카메라에 보이도록 위치를 조정해 주세요.")
    if not _visible(landmarks, profile):
        return PoseResponse(success=False, message="분석에 필요한 관절이 모두 보이도록 위치를 조정해 주세요.")
    display_indices = {LANDMARK[name] for name in profile.display_names}
    display = [item for item in landmarks if item.index in display_indices]
    return PoseResponse(
        success=True,
        landmarks=display,
        angles=calculate_metrics(landmarks, request.exercise_type),
    )
