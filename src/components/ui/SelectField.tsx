import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronDownIcon } from '@/components/illustrations/icons';
import { HighlightText, type TextSegment } from '@/components/ui/HighlightText';
import { colors, fontFamily, radius, typography } from '@/theme/tokens';

/**
 * 설문조사의 선택 필드 — Figma `75:3079`
 * 시안: 라벨 + 46px 높이 필드(placeholder "선택해주세요." + 우측 펼침 표시).
 *
 * 선택지를 고르는 화면은 시안에 없어서 하단 시트로 구현했다.
 * (다른 형태를 원하면 이 컴포넌트만 교체하면 된다)
 */
type Props = {
  label: readonly TextSegment[];
  placeholder: string;
  options: readonly string[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
};

export function SelectField({ label, placeholder, options, value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View>
      <HighlightText segments={label} style={styles.label} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label.map((s) => s.text).join('')}
        accessibilityValue={{ text: value ?? placeholder }}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          error ? styles.fieldError : null,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.value, !value && styles.placeholder]}>{value ?? placeholder}</Text>
        <ChevronDownIcon />
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.handle} />
          <HighlightText segments={label} style={styles.sheetTitle} />

          <ScrollView bounces={false}>
            {options.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    fontWeight: '600',
    marginBottom: 9,
  },
  field: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.input,
    paddingLeft: 18,
    paddingRight: 13,
  },
  fieldError: {
    borderColor: colors.main,
  },
  pressed: {
    opacity: 0.7,
  },
  value: {
    ...typography.input,
    fontFamily: fontFamily.regular,
    color: colors.textMain,
  },
  placeholder: {
    color: colors.gray6,
  },
  error: {
    ...typography.label,
    fontFamily: fontFamily.regular,
    color: colors.main,
    marginTop: 6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '60%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray6,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  option: {
    height: 52,
    justifyContent: 'center',
  },
  optionLabel: {
    ...typography.input,
    fontFamily: fontFamily.regular,
    color: colors.textMain,
  },
  optionLabelSelected: {
    color: colors.main,
    fontWeight: '700',
  },
});
