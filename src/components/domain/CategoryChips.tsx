import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';
import type { ExerciseCategory } from '@/types/api';

/**
 * 운동 목록의 카테고리 칩 — Figma `61:768`
 * 시안: 높이 38, 칩 간격 6, 선택된 칩만 메인 컬러 테두리 + 메인 컬러 글자.
 */
export function CategoryChips({
  categories,
  selectedId,
  onSelect,
}: {
  categories: ExerciseCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => onSelect(category.id)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{category.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    gap: 6,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: colors.main,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSub,
  },
  labelSelected: {
    color: colors.main,
    fontWeight: '700',
  },
});
