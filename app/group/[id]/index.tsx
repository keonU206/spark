import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedPostCard } from '@/components/domain/FeedPostCard';
import { GroupCard } from '@/components/domain/GroupCard';
import { BackButton } from '@/components/ui/BackButton';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useCheerPost, useGroup } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 모임 상세 — Figma `87:813`
 * 시안: 모임 카드 / 모임 멤버(가로 스크롤 + 추가) / 모임 피드
 */
export default function GroupDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data, error, isPending, refetch } = useGroup(id);
  const cheer = useCheerPost(id);

  if (!id) return <ScreenError error={new Error('모임이 지정되지 않았어요.')} />;
  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => router.back()} />
        </View>
        <Text style={styles.headerTitle}>모임</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.block}>
          {/* 모임 카드를 누르면 출석 캘린더 + 구성원 현황(`81:1817`)으로 간다 */}
          <GroupCard
            group={data.summary}
            onPress={() => router.push(`/group/${data.summary.id}/status`)}
          />
        </View>

        <Text style={styles.sectionTitle}>모임 멤버</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.memberRow}
        >
          {data.members.map((member) => (
            <View key={member.userId} style={styles.memberCard}>
              <View style={styles.memberAvatar} />
              <Text style={styles.memberName} numberOfLines={1}>
                {member.nickname}
              </Text>
            </View>
          ))}

          <View style={[styles.memberCard, styles.memberAdd]}>
            <Text style={styles.memberAddGlyph}>+</Text>
          </View>
        </ScrollView>

        <Text style={styles.sectionTitle}>모임 피드</Text>
        <View style={styles.feed}>
          {data.feed.map((post) => (
            <FeedPostCard key={post.id} post={post} onCheer={() => cheer.mutate(post.id)} />
          ))}
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
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
    paddingHorizontal: 19,
    marginTop: 28,
    marginBottom: 14,
  },
  memberRow: {
    paddingHorizontal: 19,
    gap: 10,
  },
  memberCard: {
    width: 82,
    height: 96,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.cardBorder,
  },
  memberName: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMain,
    marginTop: 8,
    maxWidth: 70,
  },
  memberAdd: {
    justifyContent: 'center',
  },
  memberAddGlyph: {
    fontSize: 26,
    lineHeight: 30,
    color: colors.textSub,
  },
  feed: {
    paddingHorizontal: 19,
    gap: 14,
  },
});
