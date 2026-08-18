/**
 * 브라우저 E2E — 실제 사용자가 클릭하듯 화면을 조작한다.
 * expo web(localhost:8090) + 실서버(localhost:4000, EXPO_PUBLIC_USE_MOCK=false)
 */
import { chromium } from 'playwright';

const APP = 'http://localhost:8090';
let passed = 0;
let failed = 0;
const failures = [];

function ok(name) {
  passed++;
  console.log(`  [PASS] ${name}`);
}
function fail(name, detail) {
  failed++;
  failures.push(name);
  console.log(`  [FAIL] ${name} — ${detail}`);
}

async function step(name, fn) {
  try {
    await fn();
    ok(name);
  } catch (e) {
    fail(name, String(e).split('\n')[0]);
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(20000);

console.log('== 로그인 화면 ==');
await step('로그인 화면 진입', async () => {
  await page.goto(APP + '/login', { waitUntil: 'networkidle' });
  await page.getByPlaceholder('Your email').waitFor();
});

await step('이메일·비밀번호 입력 후 로그인 버튼 클릭', async () => {
  await page.getByPlaceholder('Your email').fill('jiho@spark.app');
  await page.getByPlaceholder('Password').fill('password1234');
  await page.getByText('로그인', { exact: true }).click();
});

console.log('== 홈 화면 (실서버 데이터) ==');
await step('홈 진입 — 연속 출석 카드', async () => {
  await page.getByText(/연속 출석/).first().waitFor();
});
await step('추천 루틴 카드(설문 기반: 목/어깨)', async () => {
  await page.getByText('목/어깨 스트레칭 + 코어강화').first().waitFor();
});
await step('친구의 운동 현황 — 서버가 만든 상태 라벨', async () => {
  await page.getByText(/운동 완료 ✅|운동 중 🔥|기록이 없어요/).first().waitFor();
});

console.log('== 운동 탭 ==');
await step('운동 탭 이동 — 목록 로드', async () => {
  await page.goto(APP + '/workout', { waitUntil: 'networkidle' });
  await page.getByText('기본 스쿼트').first().waitFor();
});
await step('카테고리 칩 클릭(스쿼트 필터)', async () => {
  await page.getByText('스쿼트', { exact: true }).first().click();
  await page.getByText('와이드 스쿼트').first().waitFor();
});

console.log('== 기록 탭 ==');
await step('기록 탭 — 서버 통계 표시', async () => {
  await page.goto(APP + '/records', { waitUntil: 'networkidle' });
  await page.getByText(/완료 루틴|평균 시간|건너뛴 운동/).first().waitFor();
});
await step('최근 운동 목록(오늘 완료한 루틴)', async () => {
  await page.getByText('목/어깨 스트레칭 + 코어강화').first().waitFor();
});

console.log('== 모임 탭 ==');
await step('모임 탭 — 내 모임 카드', async () => {
  await page.goto(APP + '/community', { waitUntil: 'networkidle' });
  await page.getByText('거북목 탈출단').first().waitFor();
});
await step('모임 상세 진입 — 피드 글', async () => {
  await page.getByText('거북목 탈출단').first().click();
  await page.getByText('오늘 스쿼트 20개 3세트 완료!').first().waitFor();
});
await step('피드 댓글 표시', async () => {
  await page.getByText('다음에 같이 운동하자').first().waitFor();
});

console.log('== 마이페이지 ==');
await step('마이페이지 — 서버 프로필(닉네임 지호2)', async () => {
  await page.goto(APP + '/my', { waitUntil: 'networkidle' });
  await page.getByText('지호2').first().waitFor();
});

console.log('== 신규 가입 → 설문 → 홈 (새 사용자 전체 여정) ==');
const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
const p2 = await ctx2.newPage();
p2.setDefaultTimeout(20000);
const email = `browser${Date.now()}@spark.app`;

await step('회원가입 1단계: 이메일·비밀번호', async () => {
  await p2.goto(APP + '/signup', { waitUntil: 'networkidle' });
  // 가입 화면은 label 방식이라 placeholder가 없다 — input 순서로 채운다
  await p2.locator('input').nth(0).fill(email);
  await p2.locator('input').nth(1).fill('password1234');
  await p2.locator('input').nth(2).fill('password1234');
  await p2.getByText('생성하기', { exact: true }).click();
});

// RN-web은 이전 화면을 DOM에 남겨두므로, 현재 화면 요소는 ':visible' + last()로 잡는다
await step('회원가입 2단계: 이름 → 계정 생성', async () => {
  await p2.waitForURL(/signup-name/);
  await p2.locator('input:visible').last().fill('브라우저');
  await p2.getByText('생성하기', { exact: true }).last().click();
});

await step('설문 화면 진입(가입 직후 강제 이동)', async () => {
  await p2.waitForURL(/survey/);
  await p2.locator('text=선택해주세요.').first().waitFor();
});

await step('드롭다운 4개 선택(체력·활동량·시간·강도)', async () => {
  const options = ['매우 낮음', '거의 없음', '10분 이내', '강하게'];
  for (let i = 0; i < 4; i++) {
    await p2.locator('text=선택해주세요.').first().click();
    await p2.getByText(options[i], { exact: true }).last().click();
    await p2.waitForTimeout(300);
  }
});

await step('통증 부위 체크(목/어깨) 후 제출', async () => {
  await p2.getByText('목 / 어깨', { exact: true }).last().click();
  await p2.getByText('시작하기', { exact: true }).last().click();
});

await step('준비 완료 화면 → 홈 진입', async () => {
  // 웹에서는 라우트 가드가 ready를 건너뛰고 바로 홈으로 보낼 수 있다 — 둘 다 허용
  await p2.waitForURL(/ready|home/);
  if (p2.url().includes('ready')) {
    await p2.getByText('시작하기', { exact: true }).last().click();
  }
  await p2.waitForURL(/home/);
  await p2.getByText(/연속 출석/).last().waitFor();
});

await step('새 계정 홈에도 추천 루틴(목/어깨 설문 반영)', async () => {
  await p2.getByText('목/어깨 스트레칭 + 코어강화').last().waitFor();
});

await ctx2.close();
await browser.close();

console.log('==============================');
console.log(`브라우저 검증: ${passed}개 통과 / ${failed}개 실패`);
if (failed > 0) {
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
