import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthCalendar } from '@/components/domain/MonthCalendar';
import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useMyStatus } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';

function shiftMonth(month: string, delta: number) {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year ?? 2026, (m ?? 1) - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(month: string) {
  const [year, m] = month.split('-');
  return `${(year ?? '').slice(2)}년 ${Number(m)}월`;
}

/**
 * 내 운동 현황 — Figma `81:887`
 * 시안: 헤더 / 요약 카드(349×175, y=187.5) / 월 이동 / 출석 캘린더
 * 홈의 「내 운동 현황 >」에서 들어온다.
 */
export default function MyStatusScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, isPending, refetch } = useMyStatus();
  // 사용자가 고른 달. 아직 안 골랐으면 서버가 준 달을 쓴다
  const [pickedMonth, setPickedMonth] = useState<string>();

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <ScreenLoading />;

  const month = pickedMonth ?? data.attendance.month;
  const setMonth = (next: string | ((prev: string) => string)) =>
    setPickedMonth(typeof next === 'function' ? next(month) : next);

  // 다른 달은 아직 서버에서 못 가져온다 — 조회한 달만 출석을 칠한다
  const showingLoadedMonth = month === data.attendance.month;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/home')} />
        </View>
        <Text style={styles.headerTitle}>내 운동 현황</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>내 운동 현황</Text>

        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Summary label="연속 운동일" value={`${data.streakDays}일`} />
            <View style={styles.summaryDivider} />
            <Summary label="이번 달 완료" value={`${data.monthCompletedDays}일`} accent />
          </View>
          <Text style={styles.cardFooter}>오늘의 운동이 기다리고 있어요!</Text>
        </View>

        <View style={styles.monthNav}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이전 달"
            onPress={() => setMonth((m) => shiftMonth(m ?? month, -1))}
            hitSlop={10}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.monthArrow}>‹</Text>
          </Pressable>

          <Text style={styles.monthLabel}>{formatMonth(month)}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다음 달"
            onPress={() => setMonth((m) => shiftMonth(m ?? month, 1))}
            hitSlop={10}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Text style={styles.monthArrow}>›</Text>
          </Pressable>
        </View>

        <MonthCalendar
          month={month}
          days={
            showingLoadedMonth
              ? data.attendance.completedDays.map((day) => ({ day, intensity: 1 }))
              : []
          }
        />
      </ScrollView>
    </View>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, accent && styles.summaryValueAccent]}>{value}</Text>
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
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 26,
    color: colors.textMain,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  card: {
    marginHorizontal: 20,
    height: 175,
    borderRadius: 9.5,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 26,
    justifyContent: 'space-between',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.cardBorder,
  },
  summary: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
  },
  summaryValue: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 36,
    color: colors.textMain,
    marginTop: 10,
  },
  summaryValueAccent: {
    color: colors.main,
  },
  cardFooter: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    textAlign: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 26,
    marginBottom: 14,
    gap: 12,
  },
  monthArrow: {
    fontSize: 20,
    lineHeight: 26,
    color: colors.textMain,
  },
  monthLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMain,
  },
  pressed: {
    opacity: 0.6,
  },
});
