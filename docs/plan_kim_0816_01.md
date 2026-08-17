# plan_kim_0816_01.md — Spark 프론트엔드 구현 계획

> 작성일: 2026-08-16 · 근거: [`research.md`](research.md)
> 상태: **초안 (미확정)** — 검토 후 확정 전까지 구현 착수 금지
>
> **검토 방법**: 이 파일에 직접 주석(`<!-- 코멘트 -->` 또는 아무 표기)을 달아주세요.
> 반영 요청 시 `plan_kim_0816_02.md`로 갱신합니다.

---

## 0. 이 프로젝트의 정의

| 항목 | 내용 |
|------|------|
| 앱 이름 | `spark` (임시 — 시안상 네이밍 미정, 확정 시 일괄 변경) |
| 위치 | `C:\Users\User\Desktop\spark\` |
| 담당 범위 | **프론트엔드 전량** |
| 백엔드 | 별도 개발자가 담당. 본 작업의 산출물로 **API 계약서를 함께 인계** |
| 스택 | Expo (managed) + TypeScript + expo-router, 필요 시 `expo prebuild` 전환 |
| 타깃 | iOS / Android, 기준 해상도 390×844 |

### 데이터 전략 (확정)

```
화면 ── React Query ── services/api/*.ts  ←── 인터페이스 경계 (여기가 백엔드 인계 지점)
                              │
                    ┌─────────┴─────────┐
                    │                   │
              mock 구현            실제 HTTP 구현
          (지금 개발용)          (백엔드 완성 후 교체)
```

- `services/api/` 의 **함수 시그니처와 타입(`types/api.ts`)이 곧 API 계약서**
- 개발 중엔 `USE_MOCK=true` 로 mock 구현이 응답 (지연·에러 시뮬레이션 포함)
- 백엔드 완성 시 **화면 코드를 한 줄도 고치지 않고** 구현체만 교체
- 산출물: `docs/api-contract.md` — 백엔드 개발자 인계용 명세

---

## 1. ⚠️ 착수 전 반드시 결정해야 할 것 (Blocking)

이게 정해지지 않으면 Phase 1을 시작해도 재작업이 발생합니다.

### B-1. 디자인 방향: 초록 vs 주황 — **가장 중요**

시안에 두 방향이 공존합니다 (`research.md` §2-1).

| | 초록 방향 | 주황 방향 |
|---|---|---|
| 대표 화면 | 홈 `56:636`, 모임 상세 `69:1198` | 운동 `61:768`, 커뮤니티 `77:1506` |
| 배경 | 화이트 | 아이보리 |
| 탭바 | 고정형 | 플로팅 pill |

**→ 하나를 고르거나, "화면별로 어느 쪽이 최종인지" 목록을 주셔야 합니다.**
디자인 토큰 · 공통 컴포넌트 · 탭바 구조가 전부 여기서 갈립니다.

### B-2. 소셜 넛지 기능 UI 라벨 통일

`깨우기` / `재촉하기` / `잡도리` 중 무엇으로 통일할지. (API는 `nudge`로 고정)

### B-3. 홈 화면의 러닝·위치 데이터

홈 `56:636`에 `1.01km / 경기 광명`, `최신 러닝 기록이 없어요` 가 있습니다.
- (a) 실제 기획 → GPS 권한 + 러닝 트래킹이 범위에 추가됨 (**작업량 크게 증가**)
- (b) 레퍼런스 잔재 → 스트레칭 기준 문구로 교체

### B-4. AI PT / 카메라 기능의 범위

`AI PT 동의 관리`, `카메라 동의 안내` 화면이 있습니다.
- (a) 이번 범위 포함 → **Expo managed 이탈, `prebuild` 필요** (자세 인식 네이티브 모듈)
- (b) 동의 화면 UI만 만들고 기능은 보류 ← *권장*

### B-5. 미판독 화면 확인 (`research.md` §6)

초기 설문 문항, 배지 종류, 모임 참여 방식(초대코드 vs 검색), 운동 진행 화면 흐름, 알림 종류.
→ Phase별 착수 직전에 해당 화면만 추가 판독하면 되므로 **지금 전부 필요하지는 않음.**

---

## 2. 기술 스택 상세

| 영역 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Expo SDK (최신 stable) + TypeScript strict | 설치·실기기 확인 최소 비용 |
| 라우팅 | expo-router (파일 기반) | 탭 4개 + 스택 구조에 적합 |
| 서버 상태 | TanStack Query v5 | mock↔실서버 교체 시 화면 코드 불변 |
| 클라이언트 상태 | zustand | 온보딩 진행·운동 세션 진행 등 소량 전역 상태 |
| HTTP | axios (인터셉터로 토큰·에러 일괄 처리) | 백엔드 인계 시 표준적 |
| 스타일 | StyleSheet + 디자인 토큰 상수 | 의존성 최소. 시안 컴포넌트 수가 많지 않음 |
| 폼 | react-hook-form + zod | 회원가입·설문·모임 생성 |
| 차트 | 보류 | 시안의 통계는 숫자 카드·요일 그리드 중심. 차트 라이브러리 불필요 |
| 저장소 | expo-secure-store(토큰) + AsyncStorage(설정) | |

> **차트 라이브러리를 넣지 않는 이유**: 시안의 통계 화면은 전부 숫자 카드와 캘린더 그리드입니다.
> 꺾은선/막대 차트가 없어서 `victory-native` 등을 넣으면 번들만 커집니다.

---

## 3. 폴더 구조

```
spark/
├─ app/                          # expo-router
│  ├─ (auth)/                    # 스플래쉬·온보딩·로그인·회원가입·설문
│  ├─ (tabs)/
│  │  ├─ index.tsx               # 홈
│  │  ├─ workout.tsx             # 운동
│  │  ├─ community.tsx           # 독려(커뮤니티)
│  │  └─ my.tsx                  # 마이
│  ├─ workout/[id].tsx           # 운동 상세
│  ├─ session/                   # 운동 진행 → 루틴 완료
│  ├─ group/[id]/                # 모임 상세·캘린더·피드·운동현황
│  ├─ stats/                     # 기록/통계·연속출석·배지
│  └─ settings/                  # 프로필 편집·알림·AI PT 동의
├─ src/
│  ├─ components/
│  │  ├─ ui/                     # Button, Card, Chip, Avatar, Badge…
│  │  └─ domain/                 # RoutineCard, FriendStatusRow, WeekStrip…
│  ├─ services/
│  │  ├─ api/                    # ★ 백엔드 인계 경계
│  │  ├─ mock/                   # mock 데이터 + 핸들러
│  │  └─ http.ts
│  ├─ types/api.ts               # ★ API 타입 = 계약서
│  ├─ hooks/                     # useHome, useWorkoutList…
│  ├─ theme/                     # tokens.ts (색·타이포·간격·radius)
│  └─ utils/
└─ docs/
   ├─ research.md
   ├─ plan_kim_0816_01.md
   └─ api-contract.md            # ★ 백엔드 인계 산출물
```

---

## 4. API 계약 초안

> 전제: 인증은 Bearer 토큰. 모든 응답은 `{ data, meta? }` 래핑. 시각은 ISO8601 UTC.
> 파생값(streak·주간출석·월간집계)은 **백엔드 계산** — 프론트가 전체 기록을 받아 계산하지 않음.

### 인증 · 온보딩
| Method | Endpoint | 용도 |
|---|---|---|
| POST | `/auth/signup/email` | 이메일 회원가입 |
| POST | `/auth/login/email` | 이메일 로그인 |
| POST | `/auth/login/social` | 카카오·구글 등 (provider, accessToken) |
| POST | `/auth/refresh` | 토큰 갱신 |
| GET | `/onboarding/survey` | 초기 설문 문항 (**문항 구조 미확정 — B-5**) |
| POST | `/onboarding/survey` | 설문 응답 제출 |

### 홈
| Method | Endpoint | 응답 요약 |
|---|---|---|
| GET | `/home` | `{ recommendedRoutines[], friendActivities[], weeklyAttendance[7] }` — 화면 1회 로드로 완성 |

### 운동 · 종목 DB
| Method | Endpoint | 응답 요약 |
|---|---|---|
| GET | `/exercise-categories` | `[{ id, name }]` — 칩 필터용 |
| GET | `/exercises?categoryId&cursor` | `[{ id, name, categoryName, thumbnailUrl, repsLabel, sets, durationMin }]` |
| GET | `/exercises/{id}` | 상세 + 영상/설명 |

### 루틴
| Method | Endpoint | 용도 |
|---|---|---|
| GET | `/routines/recommended` | 오늘의 추천 루틴 (캐러셀) |
| GET | `/routines/mine` | 내 루틴 목록 |
| POST | `/routines` | 루틴 생성 `{ name, exerciseIds[] }` |
| PATCH/DELETE | `/routines/{id}` | 수정·삭제 |

### 운동 세션 (기록의 원천)
| Method | Endpoint | 용도 |
|---|---|---|
| POST | `/sessions` | 운동 시작 → `{ sessionId }` |
| PATCH | `/sessions/{id}/exercises/{exerciseId}` | 개별 동작 `completed` / `skipped` |
| POST | `/sessions/{id}/complete` | 완료 → 루틴 완료 화면 데이터 반환 |
| GET | `/sessions?cursor` | 최근 운동 기록 리스트 |

### 통계
| Method | Endpoint | 응답 요약 |
|---|---|---|
| GET | `/stats/summary` | `{ totalSessions, totalMinutes, streakDays, monthBestStreak }` |
| GET | `/stats/weekly` | `[{ weekday, completed }] × 7` |
| GET | `/stats/monthly?ym` | `{ completedRoutines, skippedExercises, avgMinutes }` |
| GET | `/badges` | `[{ id, name, iconUrl, achieved, achievedAt }]` (**종류 미확정 — B-5**) |

### 친구 · 넛지
| Method | Endpoint | 용도 |
|---|---|---|
| GET | `/friends/activities` | `[{ userId, nickname, avatarUrl, statusLabel, streakDays, lastActiveAt, canNudge }]` |
| POST | `/nudges` | `{ targetUserId, groupId? }` — 깨우기/재촉하기/잡도리 공통 |

### 모임
| Method | Endpoint | 용도 |
|---|---|---|
| GET | `/groups/mine` | `[{ id, name, description, coverUrl, memberCount, lastActivityAt, memberNames[] }]` |
| POST | `/groups` | 모임 생성 |
| POST | `/groups/join` | 참여 (**초대코드 vs 검색 미확정 — B-5**) |
| GET | `/groups/{id}` | 상세 `{ name, memberCount, members[] }` |
| GET | `/groups/{id}/attendance?ym` | 월별 출석 캘린더 |
| GET | `/groups/{id}/members/status` | `[{ nickname, todayStatusLabel, streakDays }]` |
| GET/POST | `/groups/{id}/feed` | 모임 피드 |

### 마이
| Method | Endpoint | 용도 |
|---|---|---|
| GET/PATCH | `/me` | 프로필 조회·편집 |
| GET/PATCH | `/me/notification-settings` | 알림 설정 (**항목 미확정 — B-5**) |
| GET/PATCH | `/me/consents` | AI PT·카메라 동의 |

---

## 5. 구현 Phase

각 Phase 완료 시 **체크리스트 체크 + `tsc --noEmit` 통과**를 조건으로 한다.

### Phase 1 — 기반 (B-1 확정 후 착수)
- [ ] Expo + TypeScript 프로젝트 생성, `git init`
- [ ] 의존성 설치, `tsconfig` strict, ESLint/Prettier
- [ ] `theme/tokens.ts` — 확정된 방향의 색·타이포·간격·radius
- [ ] `components/ui/` — Button, Card, Chip, Avatar, SectionHeader, Divider
- [ ] expo-router 4탭 + 스택 골격 (빈 화면)
- [ ] `services/http.ts`, React Query Provider, mock 스위치
- [ ] `types/api.ts` 초안 작성

### Phase 2 — 운동 · 루틴 · 종목 DB
- [ ] 운동 탭: 추천 캐러셀 + 카테고리 칩 + 운동 리스트(무한스크롤)
- [ ] 운동 상세
- [ ] 루틴 목록 / 생성 / 편집
- [ ] 운동 진행 세션 → 루틴 완료 화면
- [ ] mock 데이터 구축 (종목 30개 내외, 카테고리 5~6개)

### Phase 3 — 기록 · 통계
- [ ] 운동 기록/통계 화면 (숫자 카드 · 주간 그리드 · 최근 기록 리스트)
- [ ] 연속 출석 현황
- [ ] 배지 목록
- [ ] 내 운동 현황

### Phase 4 — 홈
- [ ] 홈 화면 (추천 캐러셀 + 친구 현황 + 주간 체크)
- [ ] Phase 2·3 컴포넌트 재사용 확인 — *홈은 다른 화면의 요약이므로 마지막에 만드는 것이 재사용에 유리*

### Phase 5 — 커뮤니티 · 모임
- [ ] 커뮤니티 탭 (친구 현황 + 내 모임)
- [ ] 모임 목록 / 생성 / 참여
- [ ] 모임 상세 + 출석 캘린더 + 구성원 현황
- [ ] 모임 피드
- [ ] 넛지(깨우기/재촉하기/잡도리) 동작

### Phase 6 — 온보딩 · 인증 · 마이
- [ ] 스플래쉬 · 온보딩 1/2
- [ ] 로그인 / 소셜 로그인 / 이메일 회원가입
- [ ] 초기 설문
- [ ] 마이페이지 · 프로필 편집 · 알림 설정 · 동의 관리

### Phase 7 — 인계 준비
- [ ] `docs/api-contract.md` 완성 (엔드포인트 · 요청/응답 예시 · 에러 코드)
- [ ] mock 데이터를 계약서 예시와 일치시키기
- [ ] 실서버 전환 가이드(`USE_MOCK` 해제 절차) 작성

> **Phase 순서 근거**: 홈(Phase 4)이 운동·기록의 *요약 화면*이라, 하위 화면을 먼저 만들면
> 컴포넌트를 그대로 재사용할 수 있습니다. 홈을 먼저 만들면 같은 UI를 두 번 짓게 됩니다.

---

## 6. 리스크

| 리스크 | 영향 | 대응 |
|---|---|---|
| 디자인 방향 미확정(B-1) | 토큰·공통 컴포넌트 전면 재작업 | **Phase 1 착수 전 확정 필수** |
| 시안 미완성 (로고·네이밍·일부 페이지) | 후반 재작업 | 문자열을 `constants/strings.ts`로 분리해 일괄 변경 가능하게 |
| 백엔드 스펙이 계약서와 달라짐 | 서비스 레이어 수정 | 경계를 `services/api/`로 한정. 화면은 영향 없음 |
| 같은 이름 화면이 3~14개 variant | 잘못된 시안 구현 | Phase 착수 시 해당 화면 node id를 먼저 확정 |
| AI PT 포함 시(B-4) | Expo managed 이탈 | (b) 안 채택 시 회피 |

---

## 7. 다음 단계

1. **B-1 ~ B-4 결정** ← 지금 필요한 것
2. 이 파일에 주석 달아 회신 → `plan_kim_0816_02.md`로 확정
3. 확정 후 Phase 1 착수
