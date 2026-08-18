import { Stack } from 'expo-router';

import { SignupDraftProvider } from '@/stores/signupDraft';
import { colors } from '@/theme/tokens';

export default function AuthLayout() {
  return (
    // 회원가입 1·2단계가 값을 나눠 갖는다. 인증 플로우를 벗어나면 사라진다.
    <SignupDraftProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        {/* 스플래쉬는 뒤로 돌아갈 화면이 없으므로 제스처를 막는다 */}
        <Stack.Screen name="splash" options={{ gestureEnabled: false }} />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="signup-name" />
        <Stack.Screen name="survey" options={{ gestureEnabled: false }} />
        {/* 설문을 마친 뒤라 뒤로 돌아갈 수 없다 */}
        <Stack.Screen name="ready" options={{ gestureEnabled: false }} />
      </Stack>
    </SignupDraftProvider>
  );
}
