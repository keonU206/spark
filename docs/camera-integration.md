# 카메라 자세 분석 모듈 연결 가이드

이 문서는 `feature/camera-pose-analysis` 브랜치의 카메라 모듈만 설명한다.
화면·루틴·백엔드 구현은 포함하지 않는다.

## 제공 기능

- 웹 `getUserMedia` 카메라 프리뷰
- 500ms 간격 JPEG base64 프레임 전달
- MediaPipe AI HTTP API 호출
- 골격 오버레이용 `Pose` 변환
- 스쿼트·런지·턱 당기기·어깨돌리기·가슴열기·사이드 밴드 횟수 판정
- 스쿼트·런지 규칙 기반 세션 리포트

## 환경변수

```env
EXPO_PUBLIC_AI_BASE_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_AI_HTTP_TOKEN=AI_HTTP_TOKEN과_동일한_시연용_토큰
```

`INTERNAL_API_TOKEN`은 Spring↔AI 내부 토큰이므로 웹 번들에 넣지 않는다.

## 운동 화면 연결

```tsx
const analysis = useWorkoutAnalysis({
  enabled: consented && !paused,
  exercise: currentExercise,
});

<CameraStage
  pose={analysis.pose}
  paused={paused}
  onSourceReady={setHasCamera}
  onFrame={analysis.onFrame}
/>
```

`exercise`는 다음 최소 형태만 요구한다.

```ts
type AnalyzableExercise = {
  id?: string;
  name?: string;
};
```

## 화면에서 사용할 값

```ts
analysis.pose;       // 골격 오버레이
analysis.repCount;  // 현재 운동 횟수
analysis.feedback;  // 실시간 안내 문구
analysis.error;     // AI 연결 오류
analysis.report;    // 최신 스쿼트·런지 리포트
```

운동 종료 시 최종 리포트를 얻는다.

```ts
const report = analysis.finishAnalysis();
```

다음 운동으로 넘어가거나 세션을 다시 시작할 때 초기화한다.

```ts
analysis.resetAnalysis();
```

## 운동 매핑

| 운동 | AI 타입 | 식별 기준 |
|---|---|---|
| 스쿼트 | `squat` | 이름에 `스쿼트` 또는 기본값 |
| 런지 | `lunge` | 이름에 `런지` |
| 턱 당기기 | `chin_tuck` | `e-6`, `턱 당기기`, `목 스트레칭` |
| 어깨돌리기 | `shoulder_roll` | `e-7`, 이름에 `어깨` |
| 가슴열기 | `chest_opener` | `e-8`, 이름에 `가슴` |
| 사이드 밴드 | `side_bend` | `e-9`, 이름에 `사이드 밴드` |

백엔드 운동 ID가 확정되면 이름 추론 대신 명시적 `analysisType` 필드를 쓰는 것이 안전하다.

## 리포트 계약

```ts
type WorkoutAnalysisReport = {
  exerciseType: 'squat' | 'lunge';
  totalReps: number;
  validReps: number;
  score: number;
  metrics: {
    averageDepthAngle: number;
    averageTorsoTilt: number;
    averageKneeDifference: number;
    leftReps?: number;
    rightReps?: number;
  };
  issues: {
    type: string;
    count: number;
    message: string;
  }[];
  summary: string;
};
```

현재 규칙은 시연용 휴리스틱이다. 의료 진단이나 부상 판단에 사용하지 않는다.

## 시연 체크리스트

1. Chrome에서 `localhost`로 접속한다.
2. 카메라 권한을 허용한다.
3. AI `/health`가 200인지 확인한다.
4. 스쿼트 3회와 런지 좌우 각 2회를 수행한다.
5. `repCount`와 실제 횟수를 비교한다.
6. `finishAnalysis()` 결과를 개발자 콘솔 또는 결과 화면에서 확인한다.

휴대폰의 LAN HTTP 주소는 보안 정책 때문에 카메라가 차단될 수 있다. 최종 시연은 노트북
Chrome의 `localhost` 경로를 우선한다.
