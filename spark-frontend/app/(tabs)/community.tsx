import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FriendRow } from '@/components/domain/FriendRow';
import { GroupCard } from '@/components/domain/GroupCard';
import { SectionHeader } from '@/components/domain/SectionHeader';
import { PillButton } from '@/components/ui/PillButton';
import { ScreenError } from '@/components/ui/ScreenState';
import { Skeleton, SkeletonRow } from '@/components/ui/Skeleton';
import { useFriendActivities, useMyGroups, useSendNudge } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 커뮤니티 — Figma `77:1506`
 * 시안: 헤더 "커뮤니티" / 친구의 운동 현황(카드) / 내 모임(카드 목록)
 */
export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const friendsQuery = useFriendActivities();
  const groupsQuery = useMyGroups();
  const nudge = useSendNudge();

  const error = friendsQuery.error ?? groupsQuery.error;
  if (error) {
    return (
      <ScreenError
        error={error}
        onRetry={() => {
          void friendsQuery.refetch();
          void groupsQuery.refetch();
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          {/* 이 화면이 이미 친구 목록 전체라 더보기 대상이 없다 */}
          <SectionHeader title="친구의 운동 현황" subtitle="내 친구의 운동을 응원해봐요" />

          <View style={styles.card}>
            {friendsQuery.data ? (
              friendsQuery.data.map((friend) => (
                <FriendRow
                  key={friend.userId}
                  friend={friend}
                  onNudge={() => nudge.mutate(friend.userId)}
                />
              ))
            ) : (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="내 모임"
            subtitle="모임의 친구와 함께 응원하며 경쟁해보세요"
          />

          {/* 모임 목록 시안(`69:1123`)에 있던 두 진입점을 주황 스타일로 옮겼다 */}
          <View style={styles.groupActions}>
            <PillButton
              label="모임 만들기"
              variant="primary"
              height={38}
              width={120}
              onPress={() => router.push('/group/create')}
            />
            <PillButton
              label="코드로 참여"
              variant="outline"
              height={38}
              width={120}
              onPress={() => router.push('/group/join')}
            />
          </View>

          <View style={styles.groupList}>
            {groupsQuery.data ? (
              groupsQuery.data.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={() => router.push(`/group/${group.id}`)}
                />
              ))
            ) : (
              <>
                <Skeleton width="100%" height={94} radius={12} />
                <Skeleton width="100%" height={94} radius={12} />
              </>
            )}
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
    paddingHorizontal: 19,
    marginTop: 34,
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
  groupActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  groupList: {
    marginTop: 14,
    gap: 12,
  },
});
