import type { TokenPair } from '@/services/tokenStorage';

/** mock ↔ 실서버 전환 스위치. 백엔드가 붙으면 false로 바꾼다. */
const USE_MOCK = true;

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function notConnected(endpoint: string): never {
  throw new Error(`${endpoint} 아직 연결되지 않음 — services/api/auth.ts 참고`);
}

export type AuthSession = TokenPair & {
  /** 계정 생성 직후에만 설문을 거치게 하려고 서버가 내려준다 */
  surveyCompleted: boolean;
  /** 이번 요청으로 계정이 새로 만들어졌는지 (소셜 로그인은 가입과 로그인이 같은 요청이다) */
  isNewUser: boolean;
};

const mockSession: AuthSession = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  surveyCompleted: true,
  isNewUser: false,
};

/** `POST /auth/login/email` */
export async function loginWithEmail(email: string, password: string): Promise<AuthSession> {
  if (!USE_MOCK) notConnected('POST /auth/login/email');
  void email;
  void password;
  // 기존 계정으로 들어오는 것이므로 설문은 이미 마친 상태로 본다
  return delay(mockSession);
}

/**
 * `POST /auth/signup/email` 응답과 구분하기 위한 메모.
 * 이메일 가입은 `isNewUser`가 항상 true, `surveyCompleted`가 항상 false다.
 */

export type SocialProvider = 'google';

/**
 * `POST /auth/login/social`
 *
 * 소셜 로그인은 **가입과 로그인이 같은 요청**이다. 앱은 구글에서 받은 `idToken`을
 * 그대로 넘기기만 하고, 회원 레코드를 만들지 판단하는 것은 서버다.
 *
 * 서버가 해야 할 일:
 *   1. `idToken`을 구글에 검증한다 (서명·만료·audience). 앱의 말을 믿으면 안 된다
 *   2. `(provider, providerUserId)`로 사용자를 찾는다
 *   3. 없으면 사용자 레코드를 만든다 — 이때 `isNewUser: true`로 응답
 *   4. 자체 accessToken/refreshToken을 발급해 내려준다
 *
 * 이메일은 구글 계정마다 바뀔 수 있으므로 식별자는 `providerUserId`를 쓰는 편이 안전하다.
 */
export async function loginWithSocial(input: {
  provider: SocialProvider;
  /** 구글이 발급한 ID 토큰. 서버가 이 값을 검증한다 */
  idToken: string;
}): Promise<AuthSession> {
  if (!USE_MOCK) notConnected('POST /auth/login/social');
  void input;
  // 실제 서버는 신규 가입이면 isNewUser·surveyCompleted를 다르게 내려준다
  return delay(mockSession);
}

/** `POST /auth/signup/email` — 이메일·비밀번호·이름을 한 번에 보낸다 */
export async function signUpWithEmail(input: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthSession> {
  if (!USE_MOCK) notConnected('POST /auth/signup/email');
  void input;
  // 새 계정이므로 설문을 거쳐야 한다
  return delay({ ...mockSession, surveyCompleted: false, isNewUser: true });
}

/** `POST /onboarding/survey` */
export async function submitSurvey(answers: Record<string, unknown>): Promise<void> {
  if (!USE_MOCK) notConnected('POST /onboarding/survey');
  void answers;
  await delay(undefined);
}
