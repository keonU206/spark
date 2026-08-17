import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, fontFamily, layout, radius, typography } from '@/theme/tokens';

/**
 * 시안의 CTA 버튼(모든 화면 공통 350×71, radius 35.5).
 *
 * - `dark`    스플래쉬 — 배경 #1F2937 / 글자·화살표 메인 컬러
 * - `primary` 온보딩·회원가입 — 배경 메인 컬러 / 흰 글자
 * - `outline` 로그인의 구글 버튼 — 흰 배경 + 테두리
 * - `light`   홈 히어로 — 주황 배경 위 흰 버튼 / 메인 컬러 글자
 */
export type PillButtonVariant = 'dark' | 'primary' | 'outline' | 'light';

type Props = {
  label: string;
  onPress: () => void;
  variant?: PillButtonVariant;
  /** 버튼 오른쪽 끝에 붙는 요소 (스플래쉬 화살표) */
  trailing?: ReactNode;
  /** 라벨 왼쪽에 붙는 요소 (구글 아이콘) */
  leading?: ReactNode;
  disabled?: boolean;
  height?: number;
  width?: number;
  style?: StyleProp<ViewStyle>;
};

export function PillButton({
  label,
  onPress,
  variant = 'primary',
  trailing,
  leading,
  disabled = false,
  height = layout.cta.height,
  width,
  style,
}: Props) {
  const isOutline = variant === 'outline';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        { height, borderRadius: height / 2 },
        width !== undefined && { width },
        variant === 'dark' && styles.dark,
        variant === 'primary' && styles.primary,
        variant === 'light' && styles.light,
        isOutline && styles.outline,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <Text
        style={[
          styles.label,
          isOutline ? typography.buttonSmall : typography.button,
          variant === 'dark' && { color: colors.main },
          variant === 'primary' && { color: colors.white },
          variant === 'light' && { color: colors.main },
          isOutline && { color: colors.textMain },
        ]}
      >
        {label}
      </Text>

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: layout.cta.width,
    maxWidth: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dark: {
    backgroundColor: colors.textMain,
  },
  primary: {
    backgroundColor: colors.main,
  },
  light: {
    backgroundColor: colors.white,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.input,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    textAlign: 'center',
  },
  leading: {
    marginRight: 8,
  },
  trailing: {
    position: 'absolute',
    right: 23,
  },
});
