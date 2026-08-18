import { useEffect, useRef, useState } from 'react';

import { KEYPOINT_NAMES, type Keypoint, type Pose } from '@/types/pose';

/**
 * 자세 인식 엔진.
 *
 * 실제 추론은 `CameraStage`의 프레임 프로세서에서 일어나고, 이 훅은 그 결과를
 * 화면이 쓰기 좋은 `Pose`로 들고 있는 역할만 한다.
 *
 * 모델 파일(`assets/models/movenet.tflite`)이 없거나 웹에서 실행 중이면
 * mock 골격으로 대체한다 — 화면 레이아웃과 진행 흐름은 그대로 확인할 수 있다.
 */

const MOCK_BASE: Record<(typeof KEYPOINT_NAMES)[number], [number, number]> = {
  nose: [0.5, 0.16],
  leftEye: [0.47, 0.14],
  rightEye: [0.53, 0.14],
  leftEar: [0.44, 0.15],
  rightEar: [0.56, 0.15],
  leftShoulder: [0.4, 0.3],
  rightShoulder: [0.6, 0.3],
  leftElbow: [0.32, 0.44],
  rightElbow: [0.68, 0.44],
  leftWrist: [0.26, 0.56],
  rightWrist: [0.74, 0.56],
  leftHip: [0.44, 0.58],
  rightHip: [0.56, 0.58],
  leftKnee: [0.42, 0.74],
  rightKnee: [0.58, 0.74],
  leftAnkle: [0.41, 0.9],
  rightAnkle: [0.59, 0.9],
};

export type PoseEngineState = {
  pose: Pose | null;
  /** 카메라·모델로 얻은 값인지, mock인지 */
  isReal: boolean;
  /** 외부(프레임 프로세서)에서 결과를 밀어넣는 통로 */
  setPose: (pose: Pose) => void;
};

/**
 * mock 골격을 흔들어 보여준다.
 * 실제 카메라가 없는 환경(웹 미리보기)에서 오버레이 렌더링을 확인하기 위한 것.
 */
function useMockPose(enabled: boolean) {
  const [pose, setPose] = useState<Pose | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setPose(null);
      return;
    }

    const id = setInterval(() => {
      frame.current += 1;
      const wobble = Math.sin(frame.current / 8) * 0.012;

      const keypoints: Keypoint[] = KEYPOINT_NAMES.map((name) => {
        const base = MOCK_BASE[name];
        return { name, x: base[0] + wobble, y: base[1] + wobble * 0.4, score: 0.9 };
      });

      setPose({ keypoints, timestamp: Date.now() });
    }, 100);

    return () => clearInterval(id);
  }, [enabled]);

  return pose;
}

export function usePoseEngine({
  enabled,
  /** 실제 카메라 추론이 가능한 환경인지 — `CameraStage`가 판단해서 알려준다 */
  hasRealSource = false,
}: {
  enabled: boolean;
  hasRealSource?: boolean;
}): PoseEngineState {
  const [realPose, setRealPose] = useState<Pose | null>(null);
  const mockPose = useMockPose(enabled && !hasRealSource);

  useEffect(() => {
    if (!enabled) setRealPose(null);
  }, [enabled]);

  return {
    pose: hasRealSource ? realPose : mockPose,
    isReal: hasRealSource,
    setPose: setRealPose,
  };
}
