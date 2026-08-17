# 스파크 (Spark)

카메라 자세 인식으로 홈트레이닝을 돕고, 친구·모임과 함께 습관을 만드는 운동 앱.

**이 저장소는 프론트엔드입니다.** 백엔드는 별도이며 [API 계약서](docs/api-contract.md)로 연결합니다.
화면 28개가 이미 계약서에 적힌 응답 형태로 동작 중이고, 지금은 mock이 같은 모양을 돌려주고 있습니다.

- 디자인: Figma `iKS9VJhsIwlFGaK9JAcIFB` — Section 2 (`71:878`)
- 확인: `npm run typecheck`

---

# 백엔드 개발자가 볼 것

## 1. 먼저 읽을 파일 3개

| 파일 | 역할 |
|------|------|
| **[docs/api-contract.md](docs/api-contract.md)** | **본체.** 엔드포인트 31개 · 요청/응답 타입 · 공통 규약 |
| [docs/erd.md](docs/erd.md) | **데이터 모델 제안.** API 계약서에서 역으로 도출했습니다 |
| [src/types/api.ts](src/types/api.ts) | 응답 타입 원본. 복붙해서 쓸 수 있습니다 |
| [src/services/mock/](src/services/mock) | 응답 예시. **시안에 그려진 값 그대로**라 실제 데이터 모양을 바로 볼 수 있습니다 |

계약서만 봐도 충분하지만, 애매한 부분은 `types/api.ts`가 정확합니다. 문서는 그 파일에서 뽑았습니다.

## 2. 구현 전에 합의가 필요한 것

아래는 **먼저 만들면 재작업이 생깁니다.** 구현 전에 얘기해주세요.

### ① 파생값을 서버가 계산하는가 — 가장 먼저 확인

다음 값들을 **서버가 계산해 내려주는 전제**로 타입을 만들었습니다.

- `streakDays` — 연속 출석일
- `weeklyAttendance` — 월~일 7개 완료 여부
- `monthly` — 완료 루틴 / 건너뛴 운동 / 평균 시간
- `monthBestStreak` — 이번 달 최장 기록

프론트가 전체 기록을 받아 계산하면 데이터량·정합성 문제가 생겨 이렇게 잡았습니다.
**서버 설계와 다르면 응답 구조 자체가 바뀌므로 다른 것보다 먼저 확인해주세요.**

### ② 아직 정의되지 않은 것 3가지

| 항목 | 현재 상태 |
|------|-----------|
| 설문 선택지 문자열 | 시안에 첫 값만 있어 **프론트가 추정** — 확정 목록 필요 |
| 이미지 업로드 | 미정의. 지금은 프로필 사진이 **기기 로컬 경로**를 보냅니다. presigned URL 방식 권장 |
| `POST /auth/refresh` | 스펙 없음. 프론트는 401 정규화까지만 되어 있습니다 |

### ③ 나머지 확인 항목

세션 시작 API 필요 여부(중도 이탈 통계) · 에러 코드(`code`) 목록 · 피드 작성/댓글 API

## 3. 놓치기 쉬운 규약 3가지

### 표기 문자열은 서버가 만들어주세요

프론트에서 조립하지 않는 전제입니다.

| 필드 | 값 예 | 이유 |
|------|-------|------|
| `whenLabel` | `"오늘"` `"3일 전"` | 상대 시각 기준(서버 시각)이 서버에 있음 |
| `statusLabel` | `"3일째 운동 완료 ✅"` | 문구 변경을 앱 배포 없이 하기 위함 |
| `repsLabel` | `"좌우 8~10회"` | 운동마다 표기 규칙이 달라 데이터에 종속 |
| `lastActivityLabel` | `"2일전"` | 위와 같음 |

### 소셜 로그인은 가입과 로그인이 같은 요청

`POST /auth/login/social { provider, idToken }` 에서 서버가 할 일:

1. `idToken`을 **구글에 검증** (서명·만료·audience). 앱의 말을 믿으면 안 됩니다
2. `(provider, providerUserId)`로 사용자 조회
3. 없으면 사용자 레코드 생성 → `isNewUser: true`
4. 자체 accessToken/refreshToken 발급

> 식별자는 **이메일이 아니라 `providerUserId`** 를 쓰는 편이 안전합니다. 구글 계정 이메일은 바뀔 수 있습니다.

### 응답 하나가 화면 하나

`GET /home`, `POST /sessions/{id}/complete`, `GET /groups/{id}/status` 는
**응답 내용이 화면에 그대로 표시**됩니다. 여러 번 호출해 조립하지 않습니다.

## 4. 에러 응답 형태

```jsonc
{
  "message": "사용자에게 보여줄 문장",   // 그대로 화면에 표시됩니다
  "code": "INVALID_CREDENTIALS"        // 선택. 분기 처리용
}
```

| 상태 | 프론트 동작 |
|------|-------------|
| 401 | "로그인이 필요해요."로 치환 → 재로그인 유도 |
| 그 외 4xx/5xx | `message`를 그대로 표시 |
| 네트워크 실패 / 타임아웃(10초) | 고정 문구로 치환 |

## 5. 연결 절차

서버가 준비되면 프론트는 이 3단계로 붙습니다. **화면 코드는 수정하지 않습니다.**

1. `.env`에 `EXPO_PUBLIC_API_BASE_URL` 설정
2. `src/services/api/*.ts` **6개 파일**의 `const USE_MOCK = true` → `false`
3. 각 함수의 mock 분기를 `http.get/post/patch/delete` 호출로 교체

| 파일 | 담당 |
|------|------|
| `auth.ts` | 인증 · 온보딩 |
| `home.ts` | 홈 |
| `workout.ts` | 운동 · 루틴 · 세션 |
| `stats.ts` | 기록 · 통계 · 배지 |
| `group.ts` | 친구 · 모임 · 넛지 |
| `me.ts` | 마이 · 설정 |

---

# 프론트엔드

## 시작하기

```bash
npm install
cp .env.example .env
npm run web        # 브라우저 확인 (폰트·SafeArea는 실기기와 다름)
```

실기기(Android):

```bash
npx expo start --dev-client
```

> 카메라 자세 인식은 네이티브 모듈이라 **개발 빌드에서만** 동작합니다.
> Expo Go나 웹에서는 mock 골격으로 대체되고, 나머지 화면은 그대로 확인됩니다.

### 개발 빌드 (Android)

```bash
npx expo prebuild --platform android
cd android && ./gradlew :app:assembleDebug
```

`ANDROID_HOME` 환경변수가 필요합니다.
iOS는 macOS가 필요하며, Windows에서는 EAS Build를 씁니다 (`eas.json` 준비됨).

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
  services/mock/      mock 데이터 (시안 값 그대로)
  types/api.ts        ★ API 응답 타입 = 계약서
  types/pose.ts       ★ 자세 인식 경계
  theme/tokens.ts     디자인 토큰 (Figma 변수에서 추출)
```

**★ 표시가 경계입니다.** 실제 백엔드나 자세 인식 엔진이 붙어도 화면 코드는 바뀌지 않습니다.

## 기술 선택

| | |
|---|---|
| Expo SDK 54 (RN 0.81.5) | expo-router 6 파일 기반 라우팅 |
| TanStack Query | 서버 상태. 화면에서 데이터 로딩 `useEffect`를 없앴습니다 |
| react-hook-form + zod | 폼 검증. 스키마는 `src/lib/validation.ts`에 모음 |
| expo-secure-store | 토큰 저장 (웹은 localStorage로 대체) |
| vision-camera 4.7.3 + fast-tflite | 자세 인식. SDK 54와 같은 시기 버전을 선택 |

## 자세 인식 연결

`assets/models/movenet.tflite` 를 넣으면 자동으로 실제 추론으로 전환됩니다.
없으면 mock 골격으로 동작합니다. → [assets/models/README.md](assets/models/README.md)

---

## 문서

| 문서 | 내용 |
|------|------|
| [docs/api-contract.md](docs/api-contract.md) | **백엔드 인계용 API 명세** |
| [docs/erd.md](docs/erd.md) | 데이터 모델 제안 (ERD) |
| [docs/screens.md](docs/screens.md) | 화면별 구현 상태 · 시안과 다른 점 |
| [docs/research.md](docs/research.md) | 시안 분석 · 화면 인벤토리 |
| [docs/plan_kim_0817_02.md](docs/plan_kim_0817_02.md) | 남은 작업 |
