/**
 * 자세 인식 모델 설정.
 *
 * MoveNet SinglePose 기준이다. 모델을 바꾸면 여기만 고치면 된다.
 */

/**
 * 모델 입력 한 변의 크기.
 * Lightning = 192, Thunder = 256
 */
export const MODEL_INPUT_SIZE = 192;

/** 출력 관절 수 (COCO 17포인트) */
export const MODEL_KEYPOINT_COUNT = 17;

/**
 * 추론 주기 (ms).
 *
 * 매 프레임 돌리면 발열·배터리 소모가 크다. 자세 교정은 30fps가 필요 없고,
 * 10fps 정도면 사람이 보기에 충분히 부드럽다.
 */
export const INFERENCE_INTERVAL_MS = 100;
