# API 계약서 — 스파크

> 작성일: 2026-08-17 · 프론트엔드 → 백엔드 인계용
> 근거 코드: [`src/types/api.ts`](../spark-frontend/src/types/api.ts) (응답 타입) · [`src/services/api/`](../spark-frontend/src/services/api) (엔드포인트별 호출)

> ✅ **2026-08-19 백엔드 구현 완료.** 이 문서의 §9 미정 항목들이 확정된 내용은
> [`spark-backend/README.md`](../spark-backend/README.md)의 "구현 노트"를 보세요.
> 특히: refresh 스펙 확정 · 설문은 코드값 기준 · `POST /sessions`(시작)/abort **구현됨** ·
> complete의 선택 body `skippedExerciseIds` · 피드 작성/댓글 확장 API · 에러 코드 목록.

---

## 0. 읽는 법

**이 문서는 프론트엔드가 이미 구현한 것을 그대로 옮긴 것입니다.**
화면 28개가 여기 적힌 응답 형태를 전제로 동작하고 있고, 지금은 mock이 같은 모양을 돌려주고 있습니다.
서버가 이 형태로 응답하면 프론트는 `USE_MOCK` 상수만 끄면 붙습니다.

**타입 표기** — TypeScript 문법입니다. `?`는 optional, `| null`은 null 허용.
실제 타입 정의는 `src/types/api.ts` 한 파일에 전부 있으니 그걸 보시는 게 정확합니다.

---

## 1. 공통 규약

### 인증
```
Authorization: Bearer <accessToken>
```
`/auth/*` 를 제외한 모든 요청에 붙습니다.

### 에러 응답
프론트는 아래 형태를 기대합니다 (`src/services/http.ts`).

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
| 네트워크 실패 | "네트워크에 연결할 수 없어요." |
| 타임아웃(10초) | "응답이 너무 오래 걸려요." |

### 시각·표기 문자열

**주의 — 표기용 문자열은 서버가 만들어 내려주세요.**
프론트에서 조립하지 않는 것을 전제로 타입을 짰습니다.

| 필드 예 | 값 예 | 이유 |
|---------|-------|------|
| `whenLabel` | `"오늘"` `"어제"` `"3일 전"` | 상대 시각 계산 기준(서버 시각)이 서버에 있음 |
| `statusLabel` | `"3일째 운동 완료 ✅"` | 문구 변경을 배포 없이 하기 위함 |
| `lastActivityLabel` | `"2일전"` | 위와 같음 |
| `repsLabel` | `"좌우 8~10회"` | 운동마다 표기 규칙이 달라 서버 데이터에 종속 |

### 파생값은 서버 계산 — **합의 필요**

아래는 **서버가 계산해서 내려주는 것을 전제**로 타입을 만들었습니다.
프론트가 전체 기록을 받아 계산하면 데이터량과 정합성 문제가 생깁니다.

- `streakDays` — 연속 출석일
- `weeklyAttendance` — 월~일 7개 완료 여부
- `monthly` — 완료 루틴 / 건너뛴 운동 / 평균 시간
- `monthBestStreak` — 이번 달 최장 기록

**이 전제가 서버 구현과 맞는지 확인 부탁드립니다.**

---

## 2. 인증 · 온보딩

### `POST /auth/signup/email`
```ts
요청  { email: string; password: string; name: string }
응답  AuthSession
```
> 프론트는 회원가입 1단계(이메일·비밀번호)와 2단계(이름)를 모아 **마지막에 한 번만** 호출합니다.

### `POST /auth/login/email`
```ts
요청  { email: string; password: string }
응답  AuthSession
```

### `POST /auth/login/social`
```ts
요청  { provider: 'google'; idToken: string }
응답  AuthSession
```

**소셜 로그인은 가입과 로그인이 같은 요청입니다.** 서버가 할 일:

1. `idToken`을 **구글에 검증** (서명·만료·audience). 앱의 말을 믿으면 안 됩니다
2. `(provider, providerUserId)`로 사용자 조회
3. 없으면 사용자 레코드 생성 → `isNewUser: true`
4. 자체 accessToken/refreshToken 발급

> 식별자는 **이메일이 아니라 `providerUserId`** 를 쓰는 편이 안전합니다. 구글 계정 이메일은 바뀔 수 있습니다.

### `AuthSession` (공통 응답)
```ts
{
  accessToken: string;
  refreshToken: string;
  surveyCompleted: boolean;  // false면 앱이 설문 화면으로 강제 이동
  isNewUser: boolean;
}
```
> `surveyCompleted`로 초기 설문 1회 제한을 판단합니다. 이메일 가입은 항상 `false`,
> 기존 계정 로그인은 `true`입니다.

### `POST /onboarding/survey`
```ts
요청  {
  fitnessLevel: string;    // "매우 낮음" | "낮음" | "보통" | "높음" | "매우 높음"
  activityLevel: string;   // "거의 없음" | "주 1~2회" | "주 3~4회" | "주 5회 이상"
  availableTime: string;   // "10분 이내" | "10~20분" | "20~30분" | "30분 이상"
  intensity: string;       // "가볍게" | "보통" | "강하게"
  painAreas: string[];     // neckShoulder | lowerBack | kneeLeg | wristElbow | none
}
응답  204
```
> ⚠️ 선택지 문자열은 **시안에 첫 값만 있어 프론트가 추정한 것**입니다. 확정 목록이 있으면 알려주세요.
> `painAreas`의 `none`("통증 없음")은 다른 값과 함께 올 수 없습니다.

### `POST /auth/refresh` *(미구현 — 서버 스펙 필요)*
프론트에 401 정규화까지는 되어 있으나, refresh 흐름은 엔드포인트 확정 후 붙입니다.

---

## 3. 홈

### `GET /home`
화면 하나를 1회 요청으로 완성합니다.
```ts
{
  streakDays: number;
  recommendedRoutine: {
    id: string;
    name: string;              // "목/어깨 스트레칭 + 코어강화"
    exerciseCount: number;
    estimatedMinutes: number;
  };
  friendActivities: FriendActivity[];
  weeklyAttendance: { weekday: '월'|'화'|'수'|'목'|'금'|'토'|'일'; completed: boolean }[];  // 7개 고정
}
```

```ts
type FriendActivity = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  statusLabel: string;   // "3일째 운동 완료 ✅"
  isMe: boolean;         // true면 "나" 배지 + 재촉 버튼 없음
  canNudge: boolean;
}
```

---

## 4. 운동 · 루틴

### `GET /exercise-categories`
```ts
[{ id: string; name: string }]   // 첫 항목은 "전체"(id: "all")
```

### `GET /exercises?categoryId={id}&cursor={cursor}`
커서 기반 무한 스크롤입니다.
```ts
{
  items: Exercise[];
  nextCursor: string | null;   // null이면 마지막 페이지
}
```

```ts
type Exercise = {
  id: string;
  categoryId: string;
  categoryName: string;      // 조인 결과 (목록에 표시)
  name: string;
  thumbnailUrl: string | null;
  repsLabel: string;         // "좌우 8~10회"
  sets: number;
  durationMinutes: number;
}
```
> `categoryId=all`이면 전체를 돌려주세요.

### `GET /exercises/{id}`
```ts
Exercise
```

### `GET /routines/recommended`
```ts
Routine[]   // 홈·운동 탭 캐러셀
```

### `GET /routines/{id}`
```ts
type Routine = {
  id: string;
  name: string;
  exerciseCount: number;
  estimatedMinutes: number;
  thumbnailUrl: string | null;
  exercises: Exercise[];     // 진행 화면이 순서대로 소비합니다
}
```

---

## 5. 운동 세션

### `POST /sessions` *(미구현 — 필요 여부 확인)*
현재 프론트는 세션 시작을 서버에 알리지 않고, 완료 시점에만 호출합니다.
중도 이탈 통계가 필요하면 시작 API가 있어야 합니다.

### `POST /sessions/{id}/complete`
```ts
응답  {
  sessionId: string;
  exercises: { exerciseId: string; name: string; status: 'pending'|'completed'|'skipped' }[];
  monthly: {
    completedRoutines: number;   // "완료 루틴 12일"
    abortedCount: number;        // "중단 횟수 10번"
    averageMinutes: number;      // "평균 시간 31분"
  };
}
```
> 이 응답이 루틴 완료 모달에 **그대로** 표시됩니다.

---

## 6. 기록 · 통계

### `GET /stats/summary`
```ts
{
  totalSessions: number;      // 124
  totalHours: number;         // 61
  streakDays: number;         // 14
  monthBestStreak: number;    // 20
  weeklyAttendance: DayAttendance[];
  monthly: { completedRoutines: number; skippedExercises: number; averageMinutes: number };
  recent: {
    id: string;
    routineName: string;
    whenLabel: string;        // "오늘" "어제" "3일 전"
    minutes: number;
    completedCount: number;
    skippedCount: number;     // 0보다 크면 ⚡, 0이면 ✅ 로 표시
  }[];
}
```

### `GET /stats/streak`
```ts
{
  currentStreakDays: number;
  monthCompletedCount: number;
  message: string;                       // 카드 하단 격려 문구
  attendance: { month: string; days: { day: number; intensity: number }[] };
  achievements: { id: string; title: string; subtitle: string }[];
}
```

### `GET /stats/my-status`
```ts
{
  streakDays: number;
  monthCompletedDays: number;
  attendance: { month: string; completedDays: number[] };   // month: "2026-07"
}
```

### `GET /badges`
```ts
{
  earned: Badge[];
  inProgress: Badge[];
  locked: Badge[];
}

type Badge = {
  id: string;
  name: string;                                // "21일 연속"
  state: 'earned' | 'inProgress' | 'locked';
  statusLabel: string;                         // "획득 완료" | "14/21일" | "조건 미충족"
  iconUrl: string | null;
}
```

---

## 7. 친구 · 모임

### `GET /friends/activities`
```ts
FriendActivity[]
```

### `POST /nudges`
```ts
요청  { targetUserId: string; groupId?: string }
응답  204
```
> UI 라벨은 화면마다 다릅니다(`재촉하기` / `잡도리` / `깨우기`). **API는 하나입니다.**

### `GET /groups/mine`
```ts
GroupSummary[]

type GroupSummary = {
  id: string;
  title: string;                // 멤버 이름 나열 "유승연,김채린,고예원,김…"
  description: string;          // "우리 진짜 거북목 되지 말자"
  coverUrl: string | null;
  memberCount: number;
  lastActivityLabel: string;    // "2일전"
}
```
> 시안상 카드 제목이 **모임명이 아니라 멤버 이름 나열**입니다(단톡방식).
> 모임명이 있으면 그것을, 없으면 멤버 이름을 조합해 `title`로 내려주세요.

### `POST /groups`
```ts
요청  { name: string }        // 최대 20자
응답  GroupSummary
```

### `POST /groups/join`
```ts
요청  { inviteCode: string }  // 8자리 고정
응답  GroupSummary
```

### `GET /groups/{id}`
```ts
{
  summary: GroupSummary;
  members: { userId: string; nickname: string; avatarUrl: string | null }[];
  feed: FeedPost[];
}

type FeedPost = {
  id: string;
  author: GroupMember;
  createdAtLabel: string;      // "2026.08.23 · 오후 6:30"
  imageUrl: string | null;
  body: string;
  reactions: { emoji: string; count: number }[];
  comments: { userId: string; nickname: string; body: string }[];
  canCheer: boolean;           // 본인 글이면 false
}
```

### `GET /groups/{id}/status`
```ts
{
  summary: GroupSummary;
  attendance: {
    month: string;                                    // "2026-07"
    days: { day: number; intensity: number }[];       // intensity 0~1
  };
  members: {
    userId: string;
    nickname: string;
    avatarUrl: string | null;
    statusLabel: string;
    canNudge: boolean;
  }[];
}
```
> `intensity`는 **그날 운동한 멤버 비율**로 해석합니다.
> 시안에서 캘린더 칸마다 주황 농도가 다른 것을 그대로 옮긴 값입니다. 0이면 칠하지 않습니다.

### `POST /groups/{groupId}/feed/{postId}/cheer`
```ts
응답  204
```

---

## 8. 마이

### `GET /me`
```ts
{
  nickname: string;
  statusMessage: string;      // "오늘도 건강하게 운동 중 🔥"
  avatarUrl: string | null;
  streakDays: number;
  monthCompletedCount: number;
  badgeCount: number;
  joinedGroupCount: number;
}
```

### `PATCH /me`
```ts
요청  { nickname?: string; avatarUri?: string }
응답  MyProfile
```
> ⚠️ `avatarUri`는 현재 **기기 로컬 경로**를 보냅니다.
> 실제로는 이미지 업로드 엔드포인트가 따로 필요합니다 — **업로드 방식 합의 필요**
> (presigned URL 발급 → 직접 업로드 → URL 전달 방식을 권합니다).

### `DELETE /me`
```ts
응답  204
```
> 되돌릴 수 없는 동작입니다. 프론트는 확인 다이얼로그 → 성공 응답 → 로그아웃 순서로 처리합니다.

### `GET` / `PATCH /me/notification-settings`
```ts
{
  reminderEnabled: boolean;
  reminderTime: string;              // "오전 8:00"
  friendNudgeEnabled: boolean;
  groupActivityEnabled: boolean;
  devicePermissionGranted: boolean;  // 읽기 전용 (기기 설정)
}
```

### `GET` / `PATCH /me/consents`
```ts
{
  cameraPermissionGranted: boolean;  // 읽기 전용 (기기 설정)
  poseAnalysisAgreed: boolean;
}
```

---

## 9. 백엔드에서 확인·결정해야 할 것

| # | 항목 |
|---|------|
| 1 | **파생값 서버 계산** — `streakDays`, 주간/월간 집계를 서버가 내려주는 전제 |
| 2 | **토큰 갱신** — `/auth/refresh` 스펙 (요청/응답/만료 정책) |
| 3 | **이미지 업로드** — 프로필 사진, 피드 사진. presigned URL 권장 |
| 4 | **설문 선택지 확정** — 프론트가 추정한 목록 |
| 5 | **세션 시작 API 필요 여부** — 중도 이탈 통계를 잡을지 |
| 6 | **표기 문자열 서버 생성** — `whenLabel`, `statusLabel` 등 |
| 7 | **에러 코드 목록** — `code` 필드에 들어갈 값들 |
| 8 | **피드 작성·댓글 API** — 시안에 입력 UI가 없어 아직 정의하지 않음 |

---

## 10. 연결 절차

서버가 준비되면 프론트는 이 순서로 붙입니다.

1. `.env`에 `EXPO_PUBLIC_API_BASE_URL` 설정
2. `src/services/api/*.ts` **7개 파일**의 `const USE_MOCK = true` → `false`
3. 각 함수의 mock 분기를 `http.get/post/patch/delete` 호출로 교체

화면 코드는 수정하지 않습니다. 타입이 맞으면 그대로 동작합니다.

| 파일 | 담당 |
|------|------|
| `auth.ts` | 인증·온보딩 |
| `home.ts` | 홈 |
| `workout.ts` | 운동·루틴·세션 |
| `stats.ts` | 기록·통계·배지 |
| `group.ts` | 친구·모임·넛지 |
| `me.ts` | 마이·설정 |
