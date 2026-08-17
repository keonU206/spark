import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PillButton } from '@/components/ui/PillButton';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 화면 전체를 덮는 로딩/에러 상태.
 * 화면마다 같은 `ActivityIndicator`와 에러 텍스트를 반복하던 것을 모았다.
 */
export function ScreenLoading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.main} />
    </View>
  );
}

export function ScreenError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message =
    error instanceof Error ? error.message : '알 수 없는 문제가 생겼어요.';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>문제가 생겼어요</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <View style={styles.retry}>
          <PillButton label="다시 시도" variant="primary" height={46} width={160} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

/** 목록이 비었을 때 */
export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
    marginBottom: 8,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSub,
    textAlign: 'center',
  },
  retry: {
    marginTop: 20,
  },
});
