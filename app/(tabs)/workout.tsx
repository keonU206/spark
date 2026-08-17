import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryChips } from '@/components/domain/CategoryChips';
import { ExerciseRow } from '@/components/domain/ExerciseRow';
import { RoutineCarousel } from '@/components/domain/RoutineCarousel';
import { PillButton } from '@/components/ui/PillButton';
import { EmptyState, ScreenError } from '@/components/ui/ScreenState';
import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';
import { useExerciseCategories, useExercises, useRecommendedRoutines } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 운동 목록 — Figma `61:768`
 * 시안: 헤더 "운동" / 오늘의 추천 운동 캐러셀(y=222) / 카테고리 칩(y=449) / 운동 리스트(y=487~, 행 100)
 */
export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const routinesQuery = useRecommendedRoutines();
  const categoriesQuery = useExerciseCategories();
  const exercisesQuery = useExercises(selectedCategory);

  const error = routinesQuery.error ?? categoriesQuery.error ?? exercisesQuery.error;
  if (error) {
    return (
      <ScreenError
        error={error}
        onRetry={() => {
          void routinesQuery.refetch();
          void categoriesQuery.refetch();
          void exercisesQuery.refetch();
        }}
      />
    );
  }

  // 무한 스크롤 페이지들을 한 배열로 편다
  const exercises = exercisesQuery.data?.pages.flatMap((page) => page.items);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <Text style={styles.headerTitle}>운동</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.recommendHeader}>
          <Text style={styles.sectionTitle}>오늘의 추천 운동</Text>
          <Text style={styles.sectionSubtitle}>오늘의 운동 루틴을 추천드려요</Text>
        </View>

        {routinesQuery.data ? (
          <RoutineCarousel
            routines={routinesQuery.data}
            onStart={(routine) => router.push(`/workout/session?routineId=${routine.id}`)}
          />
        ) : (
          <View style={styles.carouselSkeleton}>
            <Skeleton width="100%" height={125} radius={12} />
          </View>
        )}

        <Text style={styles.listTitle}>운동</Text>

        {categoriesQuery.data ? (
          <CategoryChips
            categories={categoriesQuery.data}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        ) : null}

        <View style={styles.list}>
          {exercises ? (
            exercises.length > 0 ? (
              exercises.map((exercise) => (
                <ExerciseRow
                  key={exercise.id}
                  exercise={exercise}
                  onPress={() => router.push(`/workout/${exercise.id}`)}
                />
              ))
            ) : (
              <EmptyState message="이 카테고리에는 아직 운동이 없어요." />
            )
          ) : (
            <View style={styles.listSkeleton}>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </View>
          )}

          {exercisesQuery.hasNextPage ? (
            <View style={styles.more}>
              <PillButton
                label={exercisesQuery.isFetchingNextPage ? '불러오는 중…' : '더 보기'}
                variant="outline"
                height={44}
                width={160}
                disabled={exercisesQuery.isFetchingNextPage}
                onPress={() => void exercisesQuery.fetchNextPage()}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
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
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19,
    color: colors.textMain,
  },
  recommendHeader: {
    paddingHorizontal: 20,
    marginTop: 43,
    marginBottom: 33,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 26,
    color: colors.textMain,
  },
  sectionSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    marginTop: 3,
  },
  listTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 21,
    color: colors.textMain,
    paddingHorizontal: 23,
    marginTop: 45,
    marginBottom: 17,
  },
  list: {
    marginTop: 21,
  },
  carouselSkeleton: {
    paddingHorizontal: 20,
  },
  listSkeleton: {
    paddingHorizontal: 22.5,
  },
  more: {
    alignItems: 'center',
    marginVertical: 24,
  },
});
