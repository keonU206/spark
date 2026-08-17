import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily } from '@/theme/tokens';

/**
 * 아직 구현하지 않은 탭의 자리표시 화면.
 * 탭 이동이 실제로 동작하는지 확인할 수 있게 두었다.
 */
export function ComingSoon({ title, figmaNode }: { title: string; figmaNode: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>다음 회차에서 구현합니다.</Text>
      <Text style={styles.node}>Figma {figmaNode}</Text>
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
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 26,
    color: colors.textMain,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSub,
    marginTop: 8,
  },
  node: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.gray6,
    marginTop: 4,
  },
});
