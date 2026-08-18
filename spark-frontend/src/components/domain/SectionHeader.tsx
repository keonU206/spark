import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/illustrations/tabIcons';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 홈의 섹션 제목 — Figma `64:592`
 * 시안: 제목(y=437) + 설명(y=466) + 우측 화살표(x=362).
 */
export function SectionHeader({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
    >
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {onPress ? <ChevronRightIcon /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.6,
  },
  texts: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 26,
    color: colors.textMain,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    marginTop: 3,
  },
});
