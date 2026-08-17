import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FriendRow } from '@/components/domain/FriendRow';
import { GroupCard } from '@/components/domain/GroupCard';
import { MonthCalendar } from '@/components/domain/MonthCalendar';
import { BackButton } from '@/components/ui/BackButton';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useGroupStatus, useSendNudge } from '@/hooks/queries';
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
 * 모임 운동현황 — Figma `81:1817`
 * 시안: 모임 카드 / 출석 캘린더(칸마다 농도 다름) / 구성원 운동 현황(재촉하기)
 */
export default function GroupStatusScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data, error, isPending, refetch } = useGroupStatus(id);
  const nudge = useSendNudge();
  const [pickedMonth, setPickedMonth] = useState<string>();

  if (!id) return <ScreenError error={new Error('모임이 지정되지 않았어요.')} />;
  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <ScreenLoading />;

  const month = pickedMonth ?? data.attendance.month;
  const setMonth = (next: string | ((prev: string) => string)) =>
    setPickedMonth(typeof next === 'function' ? next(month) : next);

  // 다른 달은 아직 서버에서 못 가져온다 — 조회한 달만 칠한다
  const showingLoadedMonth = month === data.attendance.month;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => router.back()} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {data.summary.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.block}>
          {/* 이미 이 모임의 현황 화면이라 눌러서 갈 곳이 없다 */}
          <GroupCard group={data.summary} />
        </View>

        <Text style={styles.sectionTitle}>출석 캘린더</Text>

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

        <MonthCalendar month={month} days={showingLoadedMonth ? data.attendance.days : []} />

        <View style={styles.memberSection}>
          <Text style={styles.memberTitle}>구성원 운동 현황</Text>
          <Text style={styles.memberSubtitle}>내 친구의 운동을 응원해봐요</Text>

          <View style={styles.card}>
            {data.members.map((member) => (
              <FriendRow
                key={member.userId}
                friend={{
                  userId: member.userId,
                  nickname: member.nickname,
                  avatarUrl: member.avatarUrl,
                  statusLabel: member.statusLabel,
                  isMe: false,
                  canNudge: member.canNudge,
                }}
                onNudge={() => nudge.mutate(member.userId)}
              />
            ))}
          </View>
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
  block: {
    paddingHorizontal: 19,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 26,
    color: colors.textMain,
    paddingHorizontal: 19,
    marginTop: 28,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 19,
    marginTop: 14,
    marginBottom: 10,
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
  memberSection: {
    paddingHorizontal: 19,
    marginTop: 34,
  },
  memberTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 26,
    color: colors.textMain,
  },
  memberSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    marginTop: 3,
  },
  card: {
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 9.5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
