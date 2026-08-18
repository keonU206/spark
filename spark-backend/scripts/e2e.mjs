/**
 * 스파크 E2E 검증 — 프론트의 모든 버튼/상호작용이 호출하는 API를 사용자 시나리오 순서로 실행한다.
 * 화면 기준 매핑: docs/screens.md · services/api/*.ts
 */
const BASE = 'http://localhost:4000';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    failures.push(`${name} ${detail}`);
    console.log(`  ❌ ${name} ${detail}`);
  }
}

async function api(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data };
}

async function signup(email, name) {
  const r = await api('POST', '/auth/signup/email', {
    body: { email, password: 'password1234', name },
  });
  check(`회원가입 (${name})`, r.status === 200 && r.data.accessToken && r.data.isNewUser === true, JSON.stringify(r.data));
  return r.data;
}

function decodeSub(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub;
}

console.log('\n━━━ 1. 인증·온보딩 (스플래쉬→회원가입→설문) ━━━');
const jiho = await signup('jiho@spark.app', '지호');
check('가입 직후 설문 미완료', jiho.surveyCompleted === false);

{
  const dup = await api('POST', '/auth/signup/email', { body: { email: 'jiho@spark.app', password: 'password1234', name: '지호' } });
  check('중복 이메일 가입 거절(409)', dup.status === 409 && dup.data.code === 'EMAIL_ALREADY_EXISTS');

  const badLogin = await api('POST', '/auth/login/email', { body: { email: 'jiho@spark.app', password: 'wrong!' } });
  check('잘못된 비밀번호(400, 메시지 노출)', badLogin.status === 400 && badLogin.data.code === 'INVALID_CREDENTIALS' && badLogin.data.message.length > 0);

  const badInput = await api('POST', '/auth/signup/email', { body: { email: 'not-an-email', password: '123', name: '' } });
  check('입력 검증 메시지(400)', badInput.status === 400 && typeof badInput.data.message === 'string');

  const survey = await api('POST', '/onboarding/survey', {
    token: jiho.accessToken,
    body: { fitnessLevel: '보통', activityLevel: '주 1~2회', availableTime: '10~20분', intensity: '가볍게', painAreas: ['neckShoulder'] },
  });
  check('설문 제출(204)', survey.status === 204);

  const surveyDup = await api('POST', '/onboarding/survey', {
    token: jiho.accessToken,
    body: { fitnessLevel: '보통', activityLevel: '주 1~2회', availableTime: '10~20분', intensity: '가볍게', painAreas: ['none'] },
  });
  check('설문 재제출 거절(409)', surveyDup.status === 409);

  const badSurvey = await api('POST', '/onboarding/survey', {
    token: (await api('POST', '/auth/signup/email', { body: { email: 'tmp@spark.app', password: 'password1234', name: '임시' } })).data.accessToken,
    body: { fitnessLevel: '보통', activityLevel: '주 1~2회', availableTime: '10~20분', intensity: '가볍게', painAreas: ['none', 'kneeLeg'] },
  });
  check('통증없음 배타 검증(400)', badSurvey.status === 400);

  const relogin = await api('POST', '/auth/login/email', { body: { email: 'jiho@spark.app', password: 'password1234' } });
  check('재로그인 시 설문 완료 상태', relogin.status === 200 && relogin.data.surveyCompleted === true && relogin.data.isNewUser === false);

  const refreshed = await api('POST', '/auth/refresh', { body: { refreshToken: jiho.refreshToken } });
  check('refresh 토큰 회전', refreshed.status === 200 && refreshed.data.refreshToken !== jiho.refreshToken);
  const reuse = await api('POST', '/auth/refresh', { body: { refreshToken: jiho.refreshToken } });
  check('쓴 refresh 재사용 거절(401)', reuse.status === 401);

  const noToken = await api('GET', '/home');
  check('토큰 없이 401 + 규약 본문', noToken.status === 401 && noToken.data.message === '로그인이 필요해요.');

  const social = await api('POST', '/auth/login/social', { body: { provider: 'google', idToken: 'fake' } });
  check('구글 로그인 미설정 시 501 안내', social.status === 501 && social.data.code === 'SOCIAL_LOGIN_NOT_CONFIGURED');
}
const T = jiho.accessToken;
const jihoId = decodeSub(T);

console.log('\n━━━ 2. 홈 화면 ━━━');
{
  const home = await api('GET', '/home', { token: T });
  check('홈 응답 구조', home.status === 200 && home.data.recommendedRoutine && Array.isArray(home.data.friendActivities) && home.data.weeklyAttendance.length === 7);
  check('설문(목어깨) 기반 추천 루틴', home.data.recommendedRoutine.id === 'routine-1');
  check('친구 현황에 내가 맨 앞', home.data.friendActivities[0].isMe === true && home.data.friendActivities[0].nickname === '지호');
  check('주간 출석 요일 라벨', home.data.weeklyAttendance[0].weekday === '월' && home.data.weeklyAttendance[6].weekday === '일');
}

console.log('\n━━━ 3. 운동 탭 (카테고리 칩·목록·상세) ━━━');
{
  const cats = await api('GET', '/exercise-categories', { token: T });
  check('카테고리: 전체가 첫 항목', cats.data[0].id === 'all' && cats.data.length === 5);

  const page1 = await api('GET', '/exercises?categoryId=all', { token: T });
  check('운동 목록 1페이지(10개+커서)', page1.data.items.length === 10 && page1.data.nextCursor !== null);
  const page2 = await api('GET', `/exercises?categoryId=all&cursor=${page1.data.nextCursor}`, { token: T });
  check('운동 목록 2페이지(5개, 끝)', page2.data.items.length === 5 && page2.data.nextCursor === null);

  const squat = await api('GET', '/exercises?categoryId=squat', { token: T });
  check('카테고리 필터(스쿼트 3개)', squat.data.items.length === 3);

  const detail = await api('GET', '/exercises/e-2', { token: T });
  check('운동 상세', detail.data.name === '기본 스쿼트' && detail.data.repsLabel === '12~15회');

  const notFound = await api('GET', '/exercises/no-such', { token: T });
  check('없는 운동 404', notFound.status === 404 && notFound.data.code === 'EXERCISE_NOT_FOUND');

  const routines = await api('GET', '/routines/recommended', { token: T });
  check('추천 루틴 3개(캐러셀)', routines.data.length === 3 && routines.data[0].exercises.length === 3);

  const routine = await api('GET', '/routines/routine-1', { token: T });
  check('루틴 상세(순서 보존)', routine.data.exercises.map((e) => e.id).join(',') === 'e-2,e-7,e-4');
}

console.log('\n━━━ 4. 운동 진행 (시작→완료/중단, 카메라 화면의 버튼들) ━━━');
{
  const s1 = await api('POST', '/sessions', { token: T, body: { routineId: 'routine-1' } });
  check('루틴 세션 시작', s1.status === 200 && s1.data.sessionId);

  const done1 = await api('POST', '/sessions/' + s1.data.sessionId + '/complete', { token: T });
  check('루틴 완료 모달 데이터', done1.status === 200 && done1.data.exercises.length === 3 && done1.data.monthly.completedRoutines === 1);

  const again = await api('POST', '/sessions/' + s1.data.sessionId + '/complete', { token: T });
  check('이미 닫힌 세션 409', again.status === 409);

  const s2 = await api('POST', '/sessions', { token: T, body: { routineId: 'e-10' } });
  check('단일 운동(플랭크) 시작 — 맨 운동 id', s2.status === 200);
  const done2 = await api('POST', '/sessions/' + s2.data.sessionId + '/complete', { token: T });
  check('단일 운동 완료(루틴 수 안 늘음)', done2.data.exercises[0].name === '플랭크' && done2.data.monthly.completedRoutines === 1);

  const s3 = await api('POST', '/sessions', { token: T, body: { routineId: 'single-e-11' } });
  check('single- 접두사 형식도 동작', s3.status === 200);
  const aborted = await api('POST', '/sessions/' + s3.data.sessionId + '/abort', { token: T });
  check('중단(뒤로가기) 기록', aborted.status === 204);

  const skip = await api('POST', '/sessions', { token: T, body: { routineId: 'routine-2' } });
  const doneSkip = await api('POST', '/sessions/' + skip.data.sessionId + '/complete', { token: T, body: { skippedExerciseIds: ['e-5'] } });
  check('건너뛴 운동 보고', doneSkip.data.exercises.find((e) => e.exerciseId === 'e-5').status === 'skipped');
}

console.log('\n━━━ 5. 기록 탭 (통계·스트릭·캘린더·배지) ━━━');
{
  const stats = await api('GET', '/stats/summary', { token: T });
  check('기록 요약', stats.status === 200 && stats.data.totalSessions === 3 && stats.data.streakDays === 1);
  check('월간 통계(완료 루틴2·중단1·건너뜀1)', stats.data.monthly.completedRoutines === 2 && stats.data.monthly.skippedExercises === 1);
  check('최근 기록 whenLabel', stats.data.recent[0].whenLabel === '오늘');
  check('단일 운동은 운동 이름으로 표시', stats.data.recent.some((r) => r.routineName === '플랭크'));

  const streak = await api('GET', '/stats/streak', { token: T });
  check('스트릭 상세+격려 문구', streak.data.currentStreakDays === 1 && streak.data.message.length > 0);
  check('출석 캘린더 오늘 표시', streak.data.attendance.days.some((d) => d.day === new Date().getDate()));

  const my = await api('GET', '/stats/my-status', { token: T });
  check('내 운동 현황(월 캘린더)', my.data.monthCompletedDays === 1 && my.data.attendance.completedDays.length === 1);

  const badges = await api('GET', '/badges', { token: T });
  const earnedNames = badges.data.earned.map((b) => b.name);
  check('배지: 첫 운동·루틴 완성·AI PT 획득', ['첫 운동', '루틴 완성', 'AI PT 도전'].every((n) => earnedNames.includes(n)));
  check('배지 진행 표기(1/7일 형식)', badges.data.inProgress.some((b) => /^\d+\/\d+(일|회)$/.test(b.statusLabel)));
}

console.log('\n━━━ 6. 모임 탭 (생성·초대코드 참여·피드·응원·댓글·잡도리) ━━━');
const chaerin = await signup('chaerin@spark.app', '채린');
const chaerinId = decodeSub(chaerin.accessToken);
let groupId;
{
  const created = await api('POST', '/groups', { token: T, body: { name: '거북목 탈출단' } });
  groupId = created.data.id;
  check('모임 만들기', created.status === 200 && created.data.title === '거북목 탈출단' && created.data.inviteCode.length === 8);

  const badJoin = await api('POST', '/groups/join', { token: chaerin.accessToken, body: { inviteCode: 'WRONGCD1' } });
  check('잘못된 초대코드 404', badJoin.status === 404 && badJoin.data.code === 'INVALID_INVITE_CODE');

  const joined = await api('POST', '/groups/join', { token: chaerin.accessToken, body: { inviteCode: created.data.inviteCode } });
  check('초대코드로 참여', joined.status === 200 && joined.data.memberCount === 2);

  const dupJoin = await api('POST', '/groups/join', { token: chaerin.accessToken, body: { inviteCode: created.data.inviteCode } });
  check('중복 참여 409', dupJoin.status === 409 && dupJoin.data.code === 'ALREADY_JOINED');

  const mine = await api('GET', '/groups/mine', { token: T });
  check('내 모임 목록', mine.data.length === 1 && mine.data[0].memberCount === 2);

  const post = await api('POST', `/groups/${groupId}/feed`, { token: T, body: { body: '오늘 스쿼트 20개 3세트 완료!' } });
  check('피드 글 작성(운동 공유)', post.status === 200 && post.data.canCheer === false);
  const postId = post.data.id;

  const ownCheer = await api('POST', `/groups/${groupId}/feed/${postId}/cheer`, { token: T });
  check('내 글 응원 거절(400)', ownCheer.status === 400);

  const cheer = await api('POST', `/groups/${groupId}/feed/${postId}/cheer`, { token: chaerin.accessToken });
  check('친구가 응원(204)', cheer.status === 204);

  const comment = await api('POST', `/groups/${groupId}/feed/${postId}/comments`, { token: chaerin.accessToken, body: { body: '다음에 같이 운동하자' } });
  check('댓글 작성(204)', comment.status === 204);

  const detail = await api('GET', `/groups/${groupId}`, { token: T });
  const feedPost = detail.data.feed[0];
  check('모임 상세: 피드·반응·댓글', feedPost.reactions[0].count === 1 && feedPost.comments[0].nickname === '채린' && feedPost.createdAtLabel.includes('·'));
  check('모임 상세: 멤버 목록', detail.data.members.length === 2);

  const outsider = await signup('outsider@spark.app', '외부인');
  const forbidden = await api('GET', `/groups/${groupId}`, { token: outsider.accessToken });
  check('비멤버 접근 403', forbidden.status === 403);

  const status = await api('GET', `/groups/${groupId}/status`, { token: T });
  check('모임 현황: 캘린더 intensity(1/2 운동=0.5)', status.data.attendance.days.some((d) => d.intensity === 0.5));
  const me = status.data.members.find((m) => m.userId === String(jihoId));
  const friend = status.data.members.find((m) => m.userId === String(chaerinId));
  check('멤버 상태 라벨', me.statusLabel.includes('운동 완료') && friend.statusLabel === '최신 운동 기록이 없어요 ..');
  check('나에게는 재촉 버튼 없음', me.canNudge === false && friend.canNudge === true);

  const nudge = await api('POST', '/nudges', { token: T, body: { targetUserId: String(chaerinId), groupId } });
  check('잡도리 보내기(204)', nudge.status === 204);
  const cooldown = await api('POST', '/nudges', { token: T, body: { targetUserId: String(chaerinId) } });
  check('하루 1회 쿨다운(409)', cooldown.status === 409 && cooldown.data.code === 'NUDGE_COOLDOWN');

  const strangerNudge = await api('POST', '/nudges', { token: outsider.accessToken, body: { targetUserId: String(jihoId) } });
  check('모임 밖 사람에게 잡도리 거절(403)', strangerNudge.status === 403);

  const friends = await api('GET', '/friends/activities', { token: T });
  check('친구 현황(커뮤니티 탭)', friends.data.length === 2 && friends.data[0].isMe && friends.data[1].canNudge === false);
}

console.log('\n━━━ 7. 마이페이지 (프로필·알림·동의·업로드·탈퇴) ━━━');
{
  const me = await api('GET', '/me', { token: T });
  check('마이 프로필', me.data.nickname === '지호' && me.data.badgeCount === 3 && me.data.joinedGroupCount === 1 && me.data.streakDays === 1);

  const updated = await api('PATCH', '/me', { token: T, body: { nickname: '지호2' } });
  check('닉네임 변경', updated.data.nickname === '지호2');

  const noti = await api('GET', '/me/notification-settings', { token: T });
  check('알림 설정 기본값', noti.data.reminderEnabled === true && noti.data.reminderTime === '오전 8:00');
  const notiOff = await api('PATCH', '/me/notification-settings', { token: T, body: { reminderEnabled: false } });
  check('알림 토글(부분 수정)', notiOff.data.reminderEnabled === false && notiOff.data.reminderTime === '오전 8:00');

  const consent = await api('PATCH', '/me/consents', { token: T, body: { poseAnalysisAgreed: true } });
  check('AI PT 동의 토글', consent.data.poseAnalysisAgreed === true);

  const png = new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], { type: 'image/png' });
  const form = new FormData();
  form.append('file', png, 'avatar.png');
  const upload = await api('POST', '/uploads', { token: T, form });
  check('이미지 업로드 → URL 발급', upload.status === 200 && upload.data.url.startsWith('http'));
  if (upload.status === 200) {
    const img = await fetch(upload.data.url);
    check('업로드된 이미지 서빙', img.status === 200);
    const withAvatar = await api('PATCH', '/me', { token: T, body: { avatarUri: upload.data.url } });
    check('프로필 사진 반영', withAvatar.data.avatarUrl === upload.data.url);
  }

  const bad = new FormData();
  bad.append('file', new Blob(['hello'], { type: 'text/plain' }), 'x.txt');
  const badUpload = await api('POST', '/uploads', { token: T, form: bad });
  check('이미지 아닌 파일 거절(400)', badUpload.status === 400);

  // 탈퇴는 별도 계정으로 (지호 데이터 보존)
  const bye = await signup('bye@spark.app', '탈퇴자');
  const del = await api('DELETE', '/me', { token: bye.accessToken });
  check('회원 탈퇴(204)', del.status === 204);
  const loginAfter = await api('POST', '/auth/login/email', { body: { email: 'bye@spark.app', password: 'password1234' } });
  check('탈퇴 후 로그인 차단', loginAfter.status === 400);
  const refreshAfter = await api('POST', '/auth/refresh', { body: { refreshToken: bye.refreshToken } });
  check('탈퇴 후 refresh 차단(401)', refreshAfter.status === 401);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`결과: ${passed}개 통과 / ${failed}개 실패`);
if (failed > 0) {
  console.log('실패 목록:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('모든 사용자 시나리오 검증 통과 🎉');
