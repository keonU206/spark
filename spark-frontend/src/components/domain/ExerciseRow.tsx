import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/components/illustrations/tabIcons';
import { colors, fontFamily } from '@/theme/tokens';
import type { Exercise } from '@/types/api';

/**
 * 운동 목록의 한 줄 — Figma `61:768`
 * 시안: 행 높이 100, 썸네일 66×66(x=22.5), 텍스트 x=101.5,
 * 카테고리(주황) / 이름(굵게) / "좌우 8~10회 · 2세트 · 4분", 우측 화살표.
 */
export function ExerciseRow({
  exercise,
  onPress,
}: {
  exercise: Exercise;
  onPress: () => void;
}) {
  const meta = `${exercise.repsLabel} · ${exercise.sets}세트 · ${exercise.durationMinutes}분`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${exercise.name}, ${meta}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {exercise.thumbnailUrl ? (
        <Image source={{ uri: exercise.thumbnailUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}

      <View style={styles.texts}>
        <Text style={styles.category}>{exercise.categoryName}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {exercise.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>

      <ChevronRightIcon size={14} color={colors.gray6} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22.5,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  pressed: {
    opacity: 0.7,
  },
  thumb: {
    width: 66,
    height: 66,
    borderRadius: 8,
  },
  thumbPlaceholder: {
    backgroundColor: colors.gray2,
  },
  texts: {
    flex: 1,
    marginLeft: 13,
  },
  category: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 17,
    color: colors.main,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 25,
    color: colors.textMain,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
  },
});
