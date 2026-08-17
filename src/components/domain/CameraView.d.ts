/**
 * `CameraView`의 공통 타입 선언.
 *
 * 구현은 플랫폼별로 나뉜다 — `CameraView.native.tsx` / `CameraView.web.tsx`.
 * Metro는 확장자를 보고 골라주지만 TypeScript는 그러지 않기 때문에,
 * 양쪽이 지키는 시그니처를 여기에 한 번만 적는다.
 */
export declare function CameraView(props: {
  /** 일시정지 중에는 프리뷰를 멈춰 배터리를 아낀다 */
  isActive: boolean;
  /** 실제 카메라를 쓸 수 있는지 상위에 알린다 */
  onReady?: (ready: boolean) => void;
}): JSX.Element;
