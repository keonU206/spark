import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FriendRow } from '@/components/domain/FriendRow';
import { NotificationBell } from '@/components/domain/NotificationBell';
import { SectionHeader } from '@/components/domain/SectionHeader';
import { WeekStrip } from '@/components/domain/WeekStrip';
import { TabProfileIcon } from '@/components/illustrations/tabIcons';
import { PillButton } from '@/components/ui/PillButton';
import { ScreenError } from '@/components/ui/ScreenState';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { strings } from '@/constants/strings';
import { useAckNudges, useHome, useReceivedNudges, useSendNudge } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';

const copy = strings.home;

/**
 * 홈 — Figma `64:592`
 *
 * 시안 좌표: 히어로 0~321(주황) / 연속 출석 y=352 / 친구 섹션 y=437 /
 * 친구 카드 y=496.5 350×175 / 내 운동 현황 y=726 / 주간 카드 y=781.5 350×120 /
 * 탭 바 y=946 358×70
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data, error, isPending, refetch } = useHome();
  const nudge = useSendNudge();
  const receivedNudges = useReceivedNudges();
  const ackNudges = useAckNudges();

  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <HomeSkeleton />;

  const { recommendedRoutine: routine } = data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 히어로 */}
      <View style={[styles.hero, { paddingTop: insets.top + 25 }]}>
        {/*
          마이페이지 진입점. 시안에는 그려져 있지 않아 히어로 우측 상단에 두었다
          (하단 탭 4칸은 홈·운동·모임·기록으로 차 있다).
        */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="마이페이지"
          onPress={() => router.push('/my')}
          hitSlop={10}
          style={({ pressed }) => [
            styles.profileButton,
            { top: insets.top + 18 },
            pressed && styles.profileButtonPressed,
          ]}
        >
          <TabProfileIcon size={20} active />
        </Pressable>

        {/* 알림 종 — 미확인 재촉이 있으면 빨간 점이 깜빡인다. 누르면 알림함 */}
        <NotificationBell
          hasUnread={(receivedNudges.data ?? []).length > 0}
          onPress={() => router.push('/alerts')}
          top={insets.top + 18}
        />

        <Text style={styles.heroTitle}>{copy.heroTitle}</Text>
        <Text style={styles.routineName}>{routine.name}</Text>
        <Text style={styles.routineMeta}>
          {copy.routineMeta(routine.exerciseCount, routine.estimatedMinutes)}
        </Text>

        <View style={styles.heroCtaRow}>
          <PillButton
            label={copy.start}
            variant="light"
            height={44}
            width={175}
            onPress={() => router.push(`/workout/session?routineId=${routine.id}`)}
          />
        </View>
      </View>

      {/* 받은 재촉 배너 — 친구가 재촉하면 여기 뜬다 (20초마다 갱신되는 인앱 알림) */}
      {(receivedNudges.data ?? []).length > 0 ? (
        <View style={styles.nudgeBanner}>
          <View style={styles.nudgeTexts}>
            {(receivedNudges.data ?? []).map((n) => (
              <Text key={n.id} style={styles.nudgeMessage}>
                {n.message}
              </Text>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="재촉 알림 닫기"
            onPress={() => ackNudges.mutate()}
            hitSlop={10}
            style={({ pressed }) => pressed && styles.profileButtonPressed}
          >
            <Text style={styles.nudgeClose}>✕</Text>
          </Pressable>
        </View>
      ) : null}

      {/* 연속 출석 */}
      <View style={styles.streak}>
        <Text style={styles.streakLine}>
          {`🔥 ${data.streakDays}일 `}
          <Text style={styles.streakAccent}>{copy.streakLabel}</Text>
          {copy.streakSuffix}
        </Text>
        <Text style={styles.streakSub}>{copy.streakSub}</Text>
      </View>

      {/* 친구의 운동 현황 */}
      <View style={styles.section}>
        <SectionHeader
          title={copy.friends.title}
          subtitle={copy.friends.subtitle}
          onPress={() => router.push('/community')}
        />

        <View style={styles.card}>
          {data.friendActivities.map((friend) => (
            <FriendRow
              key={friend.userId}
              friend={friend}
              onNudge={() => nudge.mutate(friend.userId)}
            />
          ))}
        </View>
      </View>

      {/* 내 운동 현황 */}
      <View style={[styles.section, styles.sectionWide]}>
        <SectionHeader
          title={copy.myStatus.title}
          subtitle={copy.myStatus.subtitle}
          onPress={() => router.push('/stats/my-status')}
        />

        <View style={styles.weekCard}>
          <WeekStrip days={data.weeklyAttendance} />
        </View>
      </View>
    </ScrollView>
  );
}

/** 실제 배치와 같은 자리에 회색 덩어리를 놓아 데이터 도착 시 화면이 덜 튀게 한다 */
function HomeSkeleton() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: insets.top + 25 }]}>
        <Skeleton width="70%" height={28} />
        <Skeleton width="55%" height={28} style={{ marginTop: 8 }} />
        <Skeleton width="60%" height={16} style={{ marginTop: 20 }} />
        <Skeleton width="35%" height={11} style={{ marginTop: 8 }} />
        <View style={styles.heroCtaRow}>
          <Skeleton width={175} height={44} radius={22} />
        </View>
      </View>

      <View style={styles.streak}>
        <Skeleton width="50%" height={20} />
        <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.section}>
        <Skeleton width="40%" height={20} />
        <View style={{ marginTop: 14 }}>
          <SkeletonCard rows={3} />
        </View>
      </View>

      <View style={[styles.section, styles.sectionWide]}>
        <Skeleton width="35%" height={20} />
        <View style={{ marginTop: 14 }}>
          <Skeleton width="100%" height={120} radius={9.5} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.bg,
  },
  hero: {
    backgroundColor: colors.main,
    paddingHorizontal: 16,
    paddingBottom: 29,
  },
  profileButton: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonPressed: {
    opacity: 0.8,
  },
  heroTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 35,
    color: colors.white,
  },
  routineName: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 21,
    color: colors.white,
    marginTop: 20,
  },
  routineMeta: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 14,
    color: colors.white,
    marginTop: 8,
  },
  heroCtaRow: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  nudgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.main,
  },
  nudgeTexts: {
    flex: 1,
    gap: 4,
  },
  nudgeMessage: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    color: colors.white,
  },
  nudgeClose: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
    paddingLeft: 12,
  },
  streak: {
    paddingHorizontal: 16,
    marginTop: 31,
  },
  streakLine: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
  },
  streakAccent: {
    color: colors.main,
  },
  streakSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMain,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 19,
    // 시안: 연속 출석 문구가 끝나는 343 → 친구 섹션 제목 377
    marginTop: 34,
  },
  sectionWide: {
    // 시안: 친구 카드가 끝나는 611.5 → 내 운동 현황 제목 666
    marginTop: 54.5,
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
  weekCard: {
    marginTop: 10,
  },
});
