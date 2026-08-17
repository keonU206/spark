import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  loginWithEmail,
  loginWithSocial,
  signUpWithEmail,
  type AuthSession,
} from '@/services/api/auth';
import { setAccessTokenProvider } from '@/services/http';
import { tokenStorage } from '@/services/tokenStorage';

/**
 * 인증 상태.
 *
 * 앱이 시작하면 저장된 토큰을 복원하는 동안 `loading`이고,
 * 그 결과에 따라 `authenticated` / `unauthenticated`가 된다.
 * 라우트 가드(`app/_layout.tsx`)가 이 상태를 보고 진입을 막는다.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  status: AuthStatus;
  /** 계정 생성 직후 한 번만 설문을 거치게 하는 플래그 */
  surveyCompleted: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (input: { email: string; password: string; name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  markSurveyCompleted: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 구글 ID 토큰을 받아온다.
 *
 * 실제 구현은 `expo-auth-session`으로 구글 로그인 창을 띄우고 `id_token`을 꺼내는 것인데,
 * **구글 클라우드 콘솔에서 OAuth 클라이언트 ID를 발급받아야** 시작할 수 있다.
 * 발급 후 이 함수만 채우면 나머지 흐름(서버 검증 → 회원 생성 → 토큰 발급)은 그대로 동작한다.
 */
async function getGoogleIdToken(): Promise<string> {
  return 'mock-google-id-token';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(true);

  // http 인터셉터가 토큰을 읽어갈 수 있게 공급자를 연결한다
  useEffect(() => {
    setAccessTokenProvider(() => accessToken);
  }, [accessToken]);

  // 앱 시작 시 저장된 토큰 복원
  useEffect(() => {
    let alive = true;
    tokenStorage
      .load()
      .then((tokens) => {
        if (!alive) return;
        if (tokens) {
          setAccessToken(tokens.accessToken);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      })
      .catch(() => alive && setStatus('unauthenticated'));
    return () => {
      alive = false;
    };
  }, []);

  const apply = useCallback(async (session: AuthSession) => {
    await tokenStorage.save(session);
    setAccessToken(session.accessToken);
    setSurveyCompleted(session.surveyCompleted);
    setStatus('authenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      surveyCompleted,

      signInWithEmail: async (email, password) => {
        await apply(await loginWithEmail(email, password));
      },

      /**
       * 구글 로그인.
       *
       * `idToken`은 구글에서 받아 그대로 서버에 넘긴다 — 회원 레코드를 만들지 판단하고
       * DB에 쓰는 것은 서버 몫이다. 앱은 발급받은 자체 토큰만 저장한다.
       *
       * 아직 구글 클라이언트 ID가 없어 실제 OAuth를 띄우지 못한다.
       * 발급되면 `getGoogleIdToken()`만 채우면 되고 아래 흐름은 그대로다.
       */
      signInWithGoogle: async () => {
        const idToken = await getGoogleIdToken();
        await apply(await loginWithSocial({ provider: 'google', idToken }));
      },

      signUp: async (input) => {
        await apply(await signUpWithEmail(input));
      },

      signOut: async () => {
        await tokenStorage.clear();
        setAccessToken(null);
        setSurveyCompleted(true);
        setStatus('unauthenticated');
        // 이전 사용자 데이터가 남지 않도록 캐시를 비운다
        queryClient.clear();
      },

      markSurveyCompleted: () => setSurveyCompleted(true),
    }),
    [status, surveyCompleted, apply, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있어요.');
  return context;
}
