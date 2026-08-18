import { http } from '@/services/http';
import type { TokenPair } from '@/services/tokenStorage';

/** mock ↔ 실서버 전환 스위치. `.env`의 `EXPO_PUBLIC_USE_MOCK=false`면 실서버로 붙는다. */
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
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
  if (USE_MOCK) {
    // 기존 계정으로 들어오는 것이므로 설문은 이미 마친 상태로 본다
    return delay(mockSession);
  }
  const { data } = await http.post<AuthSession>('/auth/login/email', { email, password });
  return data;
}

export type SocialProvider = 'google';

/**
 * `POST /auth/login/social`
 *
 * 소셜 로그인은 **가입과 로그인이 같은 요청**이다. 앱은 구글에서 받은 `idToken`을
 * 그대로 넘기기만 하고, 회원 레코드를 만들지 판단하는 것은 서버다.
 * 서버는 idToken을 구글에 검증한 뒤 자체 accessToken/refreshToken을 발급한다.
 */
export async function loginWithSocial(input: {
  provider: SocialProvider;
  /** 구글이 발급한 ID 토큰. 서버가 이 값을 검증한다 */
  idToken: string;
}): Promise<AuthSession> {
  if (USE_MOCK) {
    // 실제 서버는 신규 가입이면 isNewUser·surveyCompleted를 다르게 내려준다
    return delay(mockSession);
  }
  const { data } = await http.post<AuthSession>('/auth/login/social', input);
  return data;
}

/** `POST /auth/signup/email` — 이메일·비밀번호·이름을 한 번에 보낸다 */
export async function signUpWithEmail(input: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthSession> {
  if (USE_MOCK) {
    // 새 계정이므로 설문을 거쳐야 한다
    return delay({ ...mockSession, surveyCompleted: false, isNewUser: true });
  }
  const { data } = await http.post<AuthSession>('/auth/signup/email', input);
  return data;
}

/** `POST /onboarding/survey` */
export async function submitSurvey(answers: Record<string, unknown>): Promise<void> {
  if (USE_MOCK) {
    await delay(undefined);
    return;
  }
  await http.post('/onboarding/survey', answers);
}

/** `POST /auth/refresh` — 쓴 refreshToken은 폐기되고 새 쌍이 발급된다(회전 방식) */
export async function refreshSession(refreshToken: string): Promise<AuthSession> {
  if (USE_MOCK) return delay(mockSession);
  const { data } = await http.post<AuthSession>('/auth/refresh', { refreshToken });
  return data;
}
