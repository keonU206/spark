/**
 * 자세 인식 결과 타입.
 *
 * **여기가 자세 인식 엔진의 경계다.** 화면은 `Pose`만 알고, 좌표가 어디서 오는지
 * (실제 카메라 + 모델인지, mock인지) 신경 쓰지 않는다.
 * 엔진을 붙일 때 `usePoseEngine`의 구현만 교체하면 화면 코드는 그대로다.
 *
 * 관절 이름은 MoveNet / BlazePose가 공통으로 쓰는 COCO 17포인트를 따른다.
 */

export type KeypointName =
  | 'nose'
  | 'leftEye'
  | 'rightEye'
  | 'leftEar'
  | 'rightEar'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftWrist'
  | 'rightWrist'
  | 'leftHip'
  | 'rightHip'
  | 'leftKnee'
  | 'rightKnee'
  | 'leftAnkle'
  | 'rightAnkle';

/**
 * MoveNet 출력 순서 그대로다. 모델이 뱉는 배열의 i번째가 이 배열의 i번째 관절이다.
 * 순서를 바꾸면 골격이 어긋나므로 건드리지 말 것.
 */
export const KEYPOINT_NAMES = [
  'nose',
  'leftEye',
  'rightEye',
  'leftEar',
  'rightEar',
  'leftShoulder',
  'rightShoulder',
  'leftElbow',
  'rightElbow',
  'leftWrist',
  'rightWrist',
  'leftHip',
  'rightHip',
  'leftKnee',
  'rightKnee',
  'leftAnkle',
  'rightAnkle',
] as const satisfies readonly KeypointName[];

export type Keypoint = {
  name: KeypointName;
  /** 0~1로 정규화된 좌표 (프리뷰 크기와 무관하게 쓰기 위함) */
  x: number;
  y: number;
  /** 0~1 신뢰도. 임계값 미만은 그리지 않는다 */
  score: number;
};

export type Pose = {
  keypoints: Keypoint[];
  /** 프레임 타임스탬프 (ms) */
  timestamp: number;
};

/** 골격을 그릴 때 이을 관절 쌍 */
export const POSE_EDGES: [KeypointName, KeypointName][] = [
  ['leftShoulder', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'],
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightWrist'],
  ['leftShoulder', 'leftHip'],
  ['rightShoulder', 'rightHip'],
  ['leftHip', 'rightHip'],
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
];

/** 이 값 미만의 관절은 그리지 않는다 */
export const KEYPOINT_SCORE_THRESHOLD = 0.3;
