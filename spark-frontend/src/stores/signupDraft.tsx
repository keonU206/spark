import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * 회원가입 2단계 사이에 값을 들고 있는 곳.
 *
 * 1단계에서 이메일·비밀번호를, 2단계에서 이름을 받아 **마지막에 한 번만** 계정을 만든다.
 * 비밀번호를 라우터 파라미터로 넘기면 URL에 노출되므로 여기에 담는다.
 * 인증 플로우(`app/(auth)`)를 벗어나면 자연스럽게 사라진다.
 */
type Draft = {
  email: string;
  password: string;
};

type SignupDraftValue = {
  draft: Draft | null;
  setAccount: (draft: Draft) => void;
  clear: () => void;
};

const SignupDraftContext = createContext<SignupDraftValue | null>(null);

export function SignupDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft | null>(null);

  const value = useMemo<SignupDraftValue>(
    () => ({
      draft,
      setAccount: setDraft,
      clear: () => setDraft(null),
    }),
    [draft],
  );

  return <SignupDraftContext.Provider value={value}>{children}</SignupDraftContext.Provider>;
}

export function useSignupDraft() {
  const context = useContext(SignupDraftContext);
  if (!context) throw new Error('useSignupDraft는 SignupDraftProvider 안에서만 쓸 수 있어요.');
  return context;
}
