import main
import cv2
import numpy as np
from fastapi.testclient import TestClient
from main import LANDMARK, PROFILES, Landmark, _visible, calculate_metrics


def landmarks(names: tuple[str, ...], hidden: tuple[str, ...] = ()) -> list[Landmark]:
    return [
        Landmark(index=LANDMARK[name], x=0.1 + i * 0.05, y=0.1 + i * 0.04, z=0, visibility=0.1 if name in hidden else 0.9)
        for i, name in enumerate(names)
    ]


def test_all_demo_exercises_have_profiles() -> None:
    assert set(PROFILES) == {"squat", "lunge", "chin_tuck", "shoulder_roll", "chest_opener", "side_bend"}


def test_chin_tuck_needs_only_one_visible_ear() -> None:
    names = ("NOSE", "LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_EAR", "RIGHT_EAR")
    assert _visible(landmarks(names, ("RIGHT_EAR",)), PROFILES["chin_tuck"])
    assert not _visible(landmarks(names, ("LEFT_EAR", "RIGHT_EAR")), PROFILES["chin_tuck"])


def test_squat_accepts_one_complete_visible_leg() -> None:
    profile = PROFILES["squat"]
    left_side = (*profile.required, "LEFT_KNEE", "LEFT_ANKLE")
    assert _visible(landmarks(left_side), profile)
    assert not _visible(landmarks(profile.required), profile)


def test_each_metric_shape_matches_frontend_contract() -> None:
    for exercise_type, profile in PROFILES.items():
        names = profile.display_names
        result = calculate_metrics(landmarks(names), exercise_type)
        assert len(result) == (4 if exercise_type in ("squat", "lunge") else 1)


def test_detector_is_reused(monkeypatch) -> None:
    created = []

    class FakeDetector:
        def __init__(self) -> None:
            created.append(self)

    monkeypatch.setattr(main, "Detector", FakeDetector)
    monkeypatch.setattr(main, "_detector", None)
    assert main.get_detector() is main.get_detector()
    assert len(created) == 1


def test_partial_pose_returns_overlay_without_angles(monkeypatch) -> None:
    partial = landmarks(("LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW"))

    class PartialDetector:
        def detect(self, _rgb):
            return partial

    image = np.zeros((20, 20, 3), dtype=np.uint8)
    ok, encoded = cv2.imencode(".jpg", image)
    assert ok
    import base64
    payload = base64.b64encode(encoded.tobytes()).decode()
    monkeypatch.setattr(main, "get_detector", lambda: PartialDetector())
    response = TestClient(main.app).post(
        "/api/v1/pose", json={"image": payload, "exercise_type": "squat"}
    )
    body = response.json()
    assert body["success"] is True
    assert body["landmarks"]
    assert body["angles"] is None
