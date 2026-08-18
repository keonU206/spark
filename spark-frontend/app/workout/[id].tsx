import { router, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { PillButton } from '@/components/ui/PillButton';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useExercise } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 운동 상세.
 *
 * **시안에 없는 화면이다.** 운동 목록(`61:768`)의 행에 화살표가 있는데 대응 화면이
 * 그려져 있지 않아, 목록이 이미 가진 데이터(카테고리·반복·세트·시간)와 기존 토큰으로 구성했다.
 * 시안이 나오면 이 파일만 맞추면 된다.
 */
export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: exercise, error, isPending, refetch } = useExercise(id);

  if (!id) return <ScreenError error={new Error('운동이 지정되지 않았어요.')} />;
  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !exercise) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => router.back()} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {exercise.thumbnailUrl ? (
          <Image source={{ uri: exercise.thumbnailUrl }} style={styles.hero} />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]} />
        )}

        <View style={styles.body}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryLabel}>{exercise.categoryName}</Text>
          </View>

          <Text style={styles.name}>{exercise.name}</Text>

          <View style={styles.statRow}>
            <Stat label="반복" value={exercise.repsLabel} />
            <View style={styles.statDivider} />
            <Stat label="세트" value={`${exercise.sets}세트`} />
            <View style={styles.statDivider} />
            <Stat label="예상 시간" value={`${exercise.durationMinutes}분`} />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 37 }]}>
        <PillButton
          label="운동하기"
          variant="primary"
          onPress={() => router.push(`/workout/session?exerciseId=${exercise.id}`)}
        />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.white,
    paddingBottom: 18,
    justifyContent: 'center',
    paddingHorizontal: 44,
  },
  headerBack: {
    position: 'absolute',
    left: 0,
    bottom: 14,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19,
    color: colors.textMain,
    textAlign: 'center',
  },
  hero: {
    width: '100%',
    aspectRatio: 1,
  },
  heroPlaceholder: {
    backgroundColor: colors.gray2,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    color: colors.main,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 24,
    lineHeight: 32,
    color: colors.textMain,
    marginTop: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 18,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.cardBorder,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMain,
    marginTop: 6,
  },
  bottom: {
    alignItems: 'center',
  },
});
