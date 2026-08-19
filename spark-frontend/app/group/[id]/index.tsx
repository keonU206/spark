import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheerModal } from '@/components/domain/CheerModal';
import { FeedPostCard } from '@/components/domain/FeedPostCard';
import { GroupCard } from '@/components/domain/GroupCard';
import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useAddComment, useGroup } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';
import type { FeedPost } from '@/types/api';

/**
 * 모임 상세 — Figma `87:813`
 * 시안: 모임 카드 / 모임 멤버(가로 스크롤 + 추가) / 모임 피드
 */
export default function GroupDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data, error, isPending, refetch } = useGroup(id);
  const comment = useAddComment(id);
  const [inviteOpen, setInviteOpen] = useState(false);
  /** 응원 보내기 모달이 열려 있는 대상 글 */
  const [cheerTarget, setCheerTarget] = useState<FeedPost | null>(null);

  if (!id) return <ScreenError error={new Error('모임이 지정되지 않았어요.')} />;
  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <ScreenLoading />;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/community')} />
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

          {/* 멤버 추가 = 초대코드 공유. 별도 친구 요청 없이 코드가 유일한 통로다 */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="멤버 초대"
            onPress={() => setInviteOpen(true)}
            style={({ pressed }) => [styles.memberCard, styles.memberAdd, pressed && styles.pressed]}
          >
            <Text style={styles.memberAddGlyph}>+</Text>
          </Pressable>
        </ScrollView>

        <Text style={styles.sectionTitle}>모임 피드</Text>
        <View style={styles.feed}>
          {data.feed.map((post) => (
            <FeedPostCard key={post.id} post={post} onCheer={() => setCheerTarget(post)} />
          ))}
        </View>
      </ScrollView>

      {/* 응원 보내기 — 프리셋 문구를 고르거나 직접 입력해 글에 단다 (Frame 1000001151) */}
      {cheerTarget ? (
        <CheerModal
          visible
          authorNickname={cheerTarget.author.nickname}
          sending={comment.isPending}
          onClose={() => setCheerTarget(null)}
          onSend={(message) => {
            comment.mutate(
              { postId: cheerTarget.id, body: message },
              { onSuccess: () => setCheerTarget(null) },
            );
          }}
        />
      ) : null}

      {/* 초대코드 모달 — 코드를 보여주고 공유 시트를 띄운다 */}
      <Modal visible={inviteOpen} transparent animationType="fade">
        <Pressable style={styles.inviteBackdrop} onPress={() => setInviteOpen(false)}>
          <Pressable style={styles.inviteCard} onPress={() => undefined}>
            <Text style={styles.inviteTitle}>친구 초대하기</Text>
            <Text style={styles.inviteSubtitle}>
              친구가 모임 참여 화면에서{'\n'}이 코드를 입력하면 함께할 수 있어요.
            </Text>

            <View style={styles.inviteCodeBox}>
              <Text style={styles.inviteCode}>{data.summary.inviteCode ?? '--------'}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const code = data.summary.inviteCode;
                if (!code) return;
                // 웹 등 공유 시트가 없는 환경에서는 코드가 화면에 보이는 것으로 충분하다
                Share.share({ message: `스파크 모임 초대코드: ${code}` }).catch(() => undefined);
              }}
              style={({ pressed }) => [styles.inviteShare, pressed && styles.pressed]}
            >
              <Text style={styles.inviteShareLabel}>공유하기</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setInviteOpen(false)}
              style={({ pressed }) => [styles.inviteClose, pressed && styles.pressed]}
            >
              <Text style={styles.inviteCloseLabel}>닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  pressed: {
    opacity: 0.7,
  },
  inviteBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  inviteCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  inviteTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 24,
    color: colors.textMain,
  },
  inviteSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    textAlign: 'center',
    marginTop: 8,
  },
  inviteCodeBox: {
    marginTop: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  inviteCode: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 4,
    color: colors.main,
  },
  inviteShare: {
    marginTop: 18,
    width: '100%',
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteShareLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    color: colors.white,
  },
  inviteClose: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  inviteCloseLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 13,
    color: colors.textSub,
  },
});
