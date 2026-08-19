import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthCalendar } from '@/components/domain/MonthCalendar';
import { StatCard, StatRow } from '@/components/domain/StatCard';
import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { PillButton } from '@/components/ui/PillButton';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useStreakDetail } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';

function formatMonth(month: string) {
  const [year, m] = month.split('-');
  return `${(year ?? '').slice(2)}년 ${Number(m)}월`;
}

/**
 * 연속 출석 현황 — Figma `69:727`
 *
 * 시안의 「출석 기록」 그리드는 요일 헤더가 3줄로 줄바꿈되는 등 배치가 깨져 있어
 * 그대로 옮기지 않고, 다른 화면에서 쓰는 `MonthCalendar`로 통일했다.
 */
export default function StreakScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, isPending, refetch } = useStreakDetail();

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/home')} />
        </View>
        <Text style={styles.headerTitle}>연속 출석 현황</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <StatRow>
            <StatCard label="현재 연속일" value={`${data.currentStreakDays}일`} />
            <StatCard label="이번 달 완료" value={`${data.monthCompletedCount}회`} accent />
          </StatRow>
          <Text style={styles.message}>{data.message}</Text>
        </View>

        <Text style={styles.sectionTitle}>출석 기록</Text>
        <Text style={styles.monthLabel}>{formatMonth(data.attendance.month)}</Text>
        <MonthCalendar month={data.attendance.month} days={data.attendance.days} />

        <View style={styles.section}>
          <Text style={styles.achievementTitle}>최근 성과</Text>
          <View style={styles.achievementList}>
            {data.achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementRow}>
                <View style={styles.achievementIcon} />
                <View style={styles.achievementTexts}>
                  <Text style={styles.achievementName}>{achievement.title}</Text>
                  <Text style={styles.achievementSub}>{achievement.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.cta}>
          <PillButton label="홈으로 돌아가기" variant="primary" onPress={() => router.replace('/home')} />
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
    paddingBottom: 18,
    justifyContent: 'center',
  },
  headerBack: {
    position: 'absolute',
    left: 0,
    bottom: 14,
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19,
    color: colors.textMain,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSub,
    textAlign: 'center',
    marginTop: 14,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  monthLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSub,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
  },
  achievementTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
  },
  achievementList: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  achievementIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBorder,
  },
  achievementTexts: {
    flex: 1,
    marginLeft: 12,
  },
  achievementName: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMain,
  },
  achievementSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSub,
    marginTop: 2,
  },
  cta: {
    alignItems: 'center',
    marginTop: 30,
  },
});
