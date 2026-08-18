# 스파크 백엔드 (Spring Boot)

[API 계약서](../docs/api-contract.md)의 엔드포인트 전체 + 확장 API를 구현한 서버입니다.

## 실행

```bash
# 사전 조건: JDK 17, MariaDB(3306)에 spark 데이터베이스
#   CREATE DATABASE spark CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
# XAMPP를 쓰면 컨트롤 패널에서 MySQL을 켜두세요.

./gradlew bootRun        # http://localhost:4000 (프론트 기본 baseURL과 일치)
./gradlew test           # 통합 테스트 50개 (H2 사용 — DB 없이 실행 가능)
```

DB 접속 정보는 [src/main/resources/application.yml](src/main/resources/application.yml)에 있고,
배포 시 환경변수로 덮어씁니다: `DB_URL` `DB_USERNAME` `DB_PASSWORD` `JWT_SECRET` `GOOGLE_CLIENT_ID` `UPLOAD_DIR`

## E2E 검증

서버를 켠 상태에서 전 엔드포인트를 사용자 시나리오 순서로 검증합니다 (76개 체크):

```bash
node scripts/e2e.mjs
```

> 주의: 실제 DB에 검증용 데이터(jiho@spark.app 등)를 만듭니다. 깨끗한 DB에서 실행하세요.

## 구조

```
src/main/java/com/spark/backend/
  auth/      JWT 발급·검증, 이메일/소셜 로그인, refresh 회전
  survey/    초기 설문 (코드값·한국어 라벨 모두 수용)
  exercise/  운동·루틴 마스터 + 시드 (mock 값 그대로)
  session/   세션 시작/완료/중단 + 3시간 미완료 정리 스케줄러
  stats/     습관 엔진 (스트릭·주간/월간 집계) + 기록 화면 API
  badge/     배지 11종 — 원본 테이블 재계산 방식
  group/     모임·초대코드·피드·응원·댓글·넛지(쿨다운)
  home/      GET /home 화면 조립
  me/        프로필·알림 설정·AI PT 동의·탈퇴
  upload/    이미지 업로드 (/uploads 정적 서빙)
  common/    에러 규약 { message, code }, 표기 문자열 포매터
```

## 계약서와 다르게 확정한 것 (구현 노트)

계약서 §9의 미정 항목들을 이렇게 확정했습니다:

| 항목 | 확정 내용 |
|------|-----------|
| `POST /auth/refresh` | 요청 `{ refreshToken }` → 응답 AuthSession. **회전 방식** — 쓴 토큰은 폐기, 재사용 시 401 |
| 로그인 실패 | **400** `INVALID_CREDENTIALS` (401을 쓰면 프론트가 메시지를 치환해버리므로) |
| 설문 값 | 프론트 SelectField가 보내는 **코드값**(VERY_LOW, WEEK_1_2 …) 기준. 한국어 라벨도 수용 |
| 세션 시작 | `POST /sessions { routineId }` — 값은 루틴 id / 운동 id / `single-{운동id}` 순서로 해석 (프론트 session.tsx가 `routineId ?? exerciseId`를 보내기 때문) |
| 세션 완료 | body 선택: `{ skippedExerciseIds?: string[] }` — 없으면 전부 완료 처리 |
| 완료 루틴 집계 | 루틴 세션만 집계 (단일 운동은 스트릭·출석에는 포함, 루틴 수에는 미포함) |
| 이미지 업로드 | `POST /uploads` multipart(file) → `{ url }`. presigned URL 대신 로컬 저장+정적 서빙 |
| 피드 작성·댓글 | 확장 API: `POST /groups/{id}/feed` `{ body, imageUrl? }` · `POST .../feed/{postId}/comments` `{ body }` |
| 응원(cheer) | 토글 방식 (다시 누르면 취소), 본인 글 금지 |
| 넛지 쿨다운 | 같은 대상에게 하루 1회 → 초과 시 409 `NUDGE_COOLDOWN` |
| 초대코드 노출 | `GroupSummary.inviteCode` 추가 필드 — 공유 UI가 생기면 사용 |
| 모임 권한 | OWNER/MEMBER 저장만 해둠 (삭제·강퇴 API는 미구현) |

**에러 코드 목록**: `INVALID_INPUT` `INVALID_CREDENTIALS` `EMAIL_ALREADY_EXISTS` `UNAUTHORIZED`
`INVALID_REFRESH_TOKEN` `SOCIAL_LOGIN_NOT_CONFIGURED` `INVALID_SOCIAL_TOKEN` `UNSUPPORTED_PROVIDER`
`SURVEY_ALREADY_SUBMITTED` `EXERCISE_NOT_FOUND` `ROUTINE_NOT_FOUND` `SESSION_NOT_FOUND` `SESSION_ALREADY_CLOSED`
`INVALID_CURSOR` `GROUP_NOT_FOUND` `NOT_GROUP_MEMBER` `INVALID_INVITE_CODE` `ALREADY_JOINED` `POST_NOT_FOUND`
`CANNOT_CHEER_OWN_POST` `CANNOT_NUDGE_SELF` `NOT_GROUP_MATE` `NUDGE_COOLDOWN` `USER_NOT_FOUND`
`EMPTY_FILE` `UNSUPPORTED_FILE_TYPE` `UPLOAD_FAILED` `INTERNAL_ERROR`

## 남은 일 (배포 시)

- [ ] 클라우드 배포 (Cloudtype/Railway 등) + HTTPS — 프론트 `.env`의 `EXPO_PUBLIC_API_BASE_URL` 교체
- [ ] `JWT_SECRET` 운영값 설정, `ddl-auto: update → validate`
- [ ] 구글 OAuth 클라이언트 ID 발급 → `GOOGLE_CLIENT_ID` 설정 (소셜 로그인 활성화)
- [ ] CORS 도메인 좁히기 (지금은 개발 편의로 전면 허용)
