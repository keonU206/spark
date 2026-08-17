import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/illustrations/tabIcons';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 설정 목록의 한 줄 — Figma `69:1383` / `69:1650` / `69:1695`
 * 제목 + 설명(선택) + 우측 요소(화살표 / 스위치 / 값 텍스트).
 */
type Props = {
  title: string;
  description?: string;
  /** 누르면 이동 — 우측에 화살표가 붙는다 */
  onPress?: () => void;
  /** 토글 — 우측에 스위치가 붙는다 */
  value?: boolean;
  onValueChange?: (next: boolean) => void;
  /** 우측에 값만 보여준다 (예: "허용됨") */
  trailingText?: string;
  trailingAccent?: boolean;
  danger?: boolean;
  children?: ReactNode;
};

export function SettingRow({
  title,
  description,
  onPress,
  value,
  onValueChange,
  trailingText,
  trailingAccent,
  danger,
}: Props) {
  const isSwitch = value !== undefined && onValueChange !== undefined;

  const content = (
    <>
      <View style={styles.texts}>
        <Text style={[styles.title, danger && styles.danger]}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>

      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.gray6, true: colors.main }}
          thumbColor={colors.white}
        />
      ) : trailingText ? (
        <Text style={[styles.trailing, trailingAccent && styles.trailingAccent]}>
          {trailingText}
        </Text>
      ) : onPress ? (
        <ChevronRightIcon size={14} color={colors.gray6} />
      ) : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

/** 설정 줄을 감싸는 카드 */
export function SettingGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.group}>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    paddingHorizontal: 20,
    marginTop: 26,
  },
  groupTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  pressed: {
    opacity: 0.6,
  },
  texts: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMain,
  },
  danger: {
    color: colors.main,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSub,
    marginTop: 3,
  },
  trailing: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
  },
  trailingAccent: {
    color: colors.main,
  },
});
