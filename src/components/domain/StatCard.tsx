import { StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';

/** 통계 숫자 카드. 기록 화면들이 전부 이 형태를 쓴다. */
export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
    </View>
  );
}

/** 카드 여러 개를 한 줄에 나란히 */
export function StatRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
  },
  value: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 30,
    color: colors.textMain,
    marginTop: 6,
  },
  valueAccent: {
    color: colors.main,
  },
});
