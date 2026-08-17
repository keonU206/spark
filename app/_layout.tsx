import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ScreenLoading } from '@/components/ui/ScreenState';
import { AuthProvider, useAuth } from '@/stores/auth';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  // 앱 수명 동안 하나만 유지한다 (렌더마다 새로 만들면 캐시가 날아간다)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 화면을 오갈 때마다 다시 부르지 않도록
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

/**
 * 라우트 가드.
 *
 * - 로그인 안 했는데 앱 화면에 있으면 → 스플래쉬로
 * - 로그인했는데 인증 화면에 있으면 → 홈으로 (설문이 남았으면 설문으로)
 */
function RootNavigator() {
  const { status, surveyCompleted } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    // `useSegments`가 좁은 튜플 타입을 주므로 문자열 배열로 다룬다
    const path: string[] = segments;
    const inAuthFlow = path[0] === '(auth)';

    if (status === 'unauthenticated' && !inAuthFlow) {
      router.replace('/splash');
      return;
    }

    if (status === 'authenticated' && inAuthFlow) {
      // 계정을 막 만든 경우엔 설문을 먼저 거친다
      const onSurveyStep = path[1] === 'survey' || path[1] === 'ready';
      if (!surveyCompleted && !onSurveyStep) {
        router.replace('/survey');
        return;
      }
      if (surveyCompleted) router.replace('/home');
    }
  }, [status, surveyCompleted, segments, router]);

  if (status === 'loading') return <ScreenLoading />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
