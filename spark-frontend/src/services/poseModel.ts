import { MODEL_KEYPOINT_COUNT } from '@/constants/pose';
import { KEYPOINT_NAMES, type Keypoint, type Pose } from '@/types/pose';

/**
 * 모델 출력 → `Pose` 변환.
 *
 * MoveNet SinglePose는 `[1, 1, 17, 3]` 을 평탄화한 51개 float를 준다.
 * 관절마다 **(y, x, score) 순서**이고 좌표는 이미 0~1로 정규화되어 있다.
 * x·y 순서가 뒤집혀 있어서 그냥 넣으면 골격이 90도 돌아간다.
 */
export function parseMoveNetOutput(output: ArrayLike<number>): Pose | null {
  const expected = MODEL_KEYPOINT_COUNT * 3;
  if (output.length < expected) return null;

  const keypoints: Keypoint[] = [];

  for (let i = 0; i < MODEL_KEYPOINT_COUNT; i += 1) {
    const name = KEYPOINT_NAMES[i];
    if (!name) continue;

    const base = i * 3;
    keypoints.push({
      name,
      // 순서 주의: 모델은 y를 먼저 준다
      y: output[base] ?? 0,
      x: output[base + 1] ?? 0,
      score: output[base + 2] ?? 0,
    });
  }

  return { keypoints, timestamp: Date.now() };
}

/**
 * 모델 파일을 쓸 수 있는지 확인한다.
 *
 * `assets/models/movenet.tflite`이 없으면 번들에 포함되지 않아 require가 실패한다.
 * 그 경우 mock으로 떨어지도록 null을 돌려준다.
 */
export function loadPoseModelSource(): number | null {
  try {
    // 파일이 없으면 Metro가 번들 시점에 실패시키므로 try로 감싼다
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../assets/models/movenet.tflite') as number;
  } catch {
    return null;
  }
}
