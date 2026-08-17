import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamily, typography } from '@/theme/tokens';

/**
 * 설문조사 통증 부위 체크박스 — Figma `75:3079`
 * 시안: 18×18 박스(x=20), 라벨 x=48, 행 간격 29.
 * 선택 시 박스가 메인 컬러로 채워지고 라벨도 메인 컬러가 된다.
 */
export function Checkbox({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={onToggle}
      hitSlop={6}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.boxChecked]} />
      <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 29,
  },
  pressed: {
    opacity: 0.6,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.gray6,
    backgroundColor: colors.white,
  },
  boxChecked: {
    backgroundColor: colors.main,
    borderColor: colors.main,
  },
  label: {
    ...typography.label,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    color: colors.textSub,
    marginLeft: 10,
  },
  labelChecked: {
    color: colors.main,
    fontWeight: '700',
  },
});
