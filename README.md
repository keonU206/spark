# 스파크 (Spark)

카메라 자세 인식으로 홈트레이닝을 돕고, 친구·모임과 함께 습관을 만드는 운동 앱.

- 디자인: Figma `iKS9VJhsIwlFGaK9JAcIFB` — Section 2 (`71:878`)
- 프론트엔드만 이 저장소에 있습니다. 백엔드는 별도이며 [API 계약서](docs/api-contract.md)로 연결합니다.

---

## 시작하기

```bash
npm install
cp .env.example .env
npm run web        # 브라우저에서 확인 (폰트·SafeArea는 실기기와 다름)
```

실기기(Android)에서 확인하려면:

```bash
npx expo start --dev-client
```

> 카메라 자세 인식은 네이티브 모듈이라 **개발 빌드에서만** 동작합니다.
> Expo Go나 웹에서는 mock 골격으로 대체되고, 나머지 화면은 그대로 확인할 수 있습니다.

### 개발 빌드 만들기 (Android)

```bash
npx expo prebuild --platform android
cd android && ./gradlew :app:assembleDebug
```

`ANDROID_HOME` 환경변수가 필요합니다. iOS는 macOS가 필요하며, Windows에서는 EAS Build(`eas.json` 준비됨)를 씁니다.

---

## 구조

```
app/                  화면 (expo-router 파일 기반 라우팅)
  (auth)/             스플래쉬 · 온보딩 · 로그인 · 회원가입 · 설문
  (tabs)/             홈 · 운동 · 모임 · 기록
  workout/            운동 상세 · 진행(카메라)
  group/              모임 상세 · 현황 · 생성 · 참여
  stats/  my/         기록 상세 · 마이

src/
  components/ui/      공통 컴포넌트
  components/domain/  화면 단위 조각
  hooks/queries.ts    서버 상태 (TanStack Query)
  services/api/       ★ 백엔드 경계 — USE_MOCK 스위치
  services/mock/      mock 데이터 (시안에 그려진 값 그대로)
  types/api.ts        ★ API 응답 타입 = 계약서
  types/pose.ts       ★ 자세 인식 경계
  theme/tokens.ts     디자인 토큰 (Figma 변수에서 추출)
```

**★ 표시가 경계입니다.** 실제 백엔드/자세 인식 엔진이 붙어도 화면 코드는 바뀌지 않습니다.

---

## 백엔드 연결

1. `.env`에 `EXPO_PUBLIC_API_BASE_URL` 설정
2. `src/services/api/*.ts` 6개 파일의 `USE_MOCK = true` → `false`
3. 각 함수의 mock 분기를 `http` 호출로 교체

자세한 스펙은 [docs/api-contract.md](docs/api-contract.md).

---

## 자세 인식 연결

`assets/models/movenet.tflite` 를 넣으면 자동으로 실제 추론으로 전환됩니다.
없으면 mock 골격으로 동작합니다. 자세한 내용은 [assets/models/README.md](assets/models/README.md).

---

## 문서

| 문서 | 내용 |
|------|------|
| [research.md](docs/research.md) | 시안 분석 · 화면 인벤토리 |
| [api-contract.md](docs/api-contract.md) | **백엔드 인계용 API 명세** |
| [plan_kim_0817_02.md](docs/plan_kim_0817_02.md) | 남은 작업 |

---

## 확인 명령

```bash
npm run typecheck    # tsc --noEmit
```
