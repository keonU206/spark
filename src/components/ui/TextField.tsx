import { forwardRef, useState, type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, fontFamily, radius, typography } from '@/theme/tokens';

type Props = TextInputProps & {
  /** 입력 위에 붙는 라벨 (회원가입 화면) */
  label?: string;
  /** 입력 왼쪽 아이콘 (로그인 화면) */
  icon?: ReactNode;
  /** 유효성 안내 문구 */
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  height?: number;
};

/**
 * 입력 필드.
 *
 * 라벨 색 참고 — 시안에서 회원가입 1단계 라벨은 회색, 2단계 "이름"은 주황이다.
 * 2단계는 필드가 하나뿐이라 포커스 상태를 그린 것으로 보고,
 * "기본 회색 / 포커스 시 메인 컬러"로 구현했다. 두 화면 모두 시안대로 보인다.
 */
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, icon, error, containerStyle, height = 46, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, focused && { color: colors.main }]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.field,
          { height },
          focused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}

        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.textSub}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    color: colors.textSub,
    marginBottom: 9,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.input,
    paddingHorizontal: 14,
  },
  fieldFocused: {
    borderColor: colors.main,
  },
  fieldError: {
    borderColor: colors.main,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    ...typography.input,
    fontFamily: fontFamily.regular,
    color: colors.textMain,
    padding: 0,
  },
  error: {
    ...typography.label,
    fontFamily: fontFamily.regular,
    color: colors.main,
    marginTop: 6,
  },
});
