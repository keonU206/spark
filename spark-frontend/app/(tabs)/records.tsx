import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatCard, StatRow } from '@/components/domain/StatCard';
import { WeekStrip } from '@/components/domain/WeekStrip';
import { ChevronRightIcon } from '@/components/illustrations/tabIcons';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useWorkoutStats } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';
import type { RecentSession } from '@/types/api';

/**
 * 운동 기록/통계 — Figma `69:1437`
 *
 * 시안은 뒤로가기 헤더가 달린 형태지만, 기록은 하단 탭 중 하나라 여기서는 탭 루트로 둔다.
 * (연속 출석 현황·배지 목록은 이 화면에서 들어간다)
 */
export default function RecordsScreen() {
  const insets = useSafeAreaInsets();
  const { data: stats, error, isPending, refetch } = useWorkoutStats();

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !stats) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <Text style={styles.headerTitle}>운동 기록/통계</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Section title="운동 기록">
          <StatRow>
            <StatCard label="총 운동 횟수" value={`${stats.totalSessions}회`} />
            <StatCard label="총 운동 시간" value={`${stats.totalHours}시간`} />
          </StatRow>
        </Section>

        <Section
          title="연속 출석"
          onPress={() => router.push('/stats/streak')}
        >
          <View style={styles.streakCard}>
            <Text style={styles.streakValue}>{`🔥 ${stats.streakDays}일 연속`}</Text>
            <Text style={styles.streakSub}>
              {`이번 달 최장 기록 ${stats.monthBestStreak}일`}
            </Text>
          </View>
        </Section>

        <Section title="주간 운동 현황">
          <WeekStrip days={stats.weeklyAttendance} />
        </Section>

        <Section title="이번 달 통계">
          <StatRow>
            <StatCard label="완료 루틴" value={`${stats.monthly.completedRoutines}회`} accent />
            <StatCard label="건너뛴 운동" value={`${stats.monthly.skippedExercises}회`} />
            <StatCard label="평균 운동 시간" value={`${stats.monthly.averageMinutes}분`} />
          </StatRow>
        </Section>

        <Section title="배지" onPress={() => router.push('/stats/badges')}>
          <Text style={styles.badgeHint}>획득한 배지와 도전 중인 배지를 확인해봐요</Text>
        </Section>

        <Section title="최근 운동 기록">
          <View style={styles.recentList}>
            {stats.recent.map((session) => (
              <RecentRow key={session.id} session={session} />
            ))}
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  onPress,
  children,
}: {
  title: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole={onPress ? 'button' : undefined}
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.sectionHeader, pressed && onPress ? styles.pressed : null]}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        {onPress ? <ChevronRightIcon /> : null}
      </Pressable>
      {children}
    </View>
  );
}

function RecentRow({ session }: { session: RecentSession }) {
  const parts = [
    session.whenLabel,
    `${session.minutes}분`,
    session.skippedCount > 0
      ? `${session.completedCount}개 완료, ${session.skippedCount}개 건너뜀`
      : `${session.completedCount}개 운동 완료`,
  ];

  return (
    <View style={styles.recentRow}>
      <View style={styles.recentTexts}>
        <Text style={styles.recentName} numberOfLines={1}>
          {session.routineName}
        </Text>
        <Text style={styles.recentMeta} numberOfLines={1}>
          {parts.join(' · ')}
        </Text>
      </View>
      <Text style={styles.recentStatus}>{session.skippedCount > 0 ? '⚡' : '✅'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
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
  section: {
    paddingHorizontal: 20,
    marginTop: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.6,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
  },
  streakCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  streakValue: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 30,
    color: colors.textMain,
  },
  streakSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    marginTop: 6,
  },
  badgeHint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
  },
  recentList: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  recentTexts: {
    flex: 1,
  },
  recentName: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMain,
  },
  recentMeta: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSub,
    marginTop: 3,
  },
  recentStatus: {
    fontSize: 15,
    marginLeft: 10,
  },
});
