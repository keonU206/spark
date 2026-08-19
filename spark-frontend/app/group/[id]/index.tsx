import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CheerModal } from '@/components/domain/CheerModal';
import { FeedPostCard } from '@/components/domain/FeedPostCard';
import { FloatingTabBar } from '@/components/domain/FloatingTabBar';
import { FriendRow } from '@/components/domain/FriendRow';
import { GroupCard } from '@/components/domain/GroupCard';
import { MonthCalendar } from '@/components/domain/MonthCalendar';
import { BackButton } from '@/components/ui/BackButton';
import { goBack } from '@/lib/navigation';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import { useAddComment, useDeleteFeedPost, useGroup, useGroupStatus, useSendNudge } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';
import type { FeedPost, GroupDayAttendance } from '@/types/api';

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
 * 모임 상세 — Figma `87:813` + `81:1817`
 * 시안대로 **한 페이지**에 다 담는다:
 * 모임 카드 / 모임 멤버(+초대) / 출석 캘린더 / 구성원 운동 현황(재촉하기) / 모임 피드(응원)
 */
export default function GroupDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data, error, isPending, refetch } = useGroup(id);
  const statusQuery = useGroupStatus(id);
  const comment = useAddComment(id);
  const deletePost = useDeleteFeedPost(id);
  const nudge = useSendNudge();

  /** 삭제는 되돌릴 수 없으니 한 번 확인한다 (웹은 confirm, 폰은 Alert) */
  function confirmDelete(postId: string) {
    const run = () => deletePost.mutate(postId);
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('이 글을 삭제할까요? 달린 응원과 댓글도 함께 지워져요.')) run();
      return;
    }
    Alert.alert('글 삭제', '이 글을 삭제할까요?\n달린 응원과 댓글도 함께 지워져요.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: run },
    ]);
  }

  const [inviteOpen, setInviteOpen] = useState(false);
  /** 응원 보내기 모달이 열려 있는 대상 글 */
  const [cheerTarget, setCheerTarget] = useState<FeedPost | null>(null);
  const [pickedMonth, setPickedMonth] = useState<string>();
  /** 캘린더에서 누른 날 — "운동한 멤버" 팝업 */
  const [pickedDay, setPickedDay] = useState<GroupDayAttendance | null>(null);

  if (!id) return <ScreenError error={new Error('모임이 지정되지 않았어요.')} />;
  if (error) return <ScreenError error={error} onRetry={() => void refetch()} />;
  if (isPending || !data) return <ScreenLoading />;

  const attendance = statusQuery.data?.attendance;
  const month = pickedMonth ?? attendance?.month ?? '';
  // 다른 달은 아직 서버에서 못 가져온다 — 조회한 달만 칠한다
  const calendarDays = attendance && month === attendance.month ? attendance.days : [];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerBack}>
          <BackButton onPress={() => goBack('/community')} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {data.summary.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.block}>
          <GroupCard group={data.summary} />
        </View>

        {/* ---------------- 모임 멤버 ---------------- */}
        <Text style={styles.sectionTitle}>모임 멤버</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.memberRow}
        >
          {data.members.map((member) => (
            <View key={member.userId} style={styles.memberCard}>
              {member.avatarUrl ? (
                <Image source={{ uri: member.avatarUrl }} style={styles.memberAvatar} />
              ) : (
                <View style={[styles.memberAvatar, styles.memberAvatarPlaceholder]} />
              )}
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

        {/* ---------------- 출석 캘린더 ---------------- */}
        <Text style={styles.sectionTitle}>출석 캘린더</Text>

        {attendance ? (
          <>
            <View style={styles.monthNav}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="이전 달"
                onPress={() => setPickedMonth(shiftMonth(month, -1))}
                hitSlop={10}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.monthArrow}>‹</Text>
              </Pressable>

              <Text style={styles.monthLabel}>{formatMonth(month)}</Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="다음 달"
                onPress={() => setPickedMonth(shiftMonth(month, 1))}
                hitSlop={10}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.monthArrow}>›</Text>
              </Pressable>
            </View>

            <MonthCalendar month={month} days={calendarDays} onDayPress={setPickedDay} />
          </>
        ) : (
          <Text style={styles.loadingHint}>출석 정보를 불러오는 중…</Text>
        )}

        {/* ---------------- 구성원 운동 현황 ---------------- */}
        <View style={styles.memberSection}>
          <Text style={styles.memberTitle}>구성원 운동 현황</Text>
          <Text style={styles.memberSubtitle}>내 친구의 운동을 응원해봐요</Text>

          <View style={styles.card}>
            {(statusQuery.data?.members ?? []).map((member) => (
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

        {/* ---------------- 모임 피드 ---------------- */}
        <Text style={styles.sectionTitle}>모임 피드</Text>
        <View style={styles.feed}>
          {data.feed.length === 0 ? (
            <Text style={styles.loadingHint}>아직 글이 없어요. 운동을 완료하고 공유해보세요!</Text>
          ) : (
            data.feed.map((post) => (
              <FeedPostCard
                key={post.id}
                post={post}
                onCheer={() => setCheerTarget(post)}
                onDelete={() => confirmDelete(post.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* 시안처럼 하단 메뉴가 항상 떠 있다 */}
      <FloatingTabBar active="community" />

      {/* 응원 보내기 — 프리셋 문구를 고르거나 직접 입력해 글에 단다 (Frame 1000001151) */}
      {cheerTarget ? (
        <CheerModal
          visible
          authorNickname={cheerTarget.author.nickname}
          initialMessage={cheerTarget.comments.find((c) => c.isMine)?.body}
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

      {/* 캘린더 날짜를 누르면 그날 운동한 멤버를 보여준다 */}
      <Modal visible={pickedDay !== null} transparent animationType="fade">
        <Pressable style={styles.dayBackdrop} onPress={() => setPickedDay(null)}>
          <Pressable style={styles.dayCard} onPress={() => undefined}>
            <Text style={styles.dayTitle}>
              {`${Number(month.split('-')[1])}월 ${pickedDay?.day}일 운동한 멤버`}
            </Text>

            {(pickedDay?.members ?? []).length > 0 ? (
              <View style={styles.dayMembers}>
                {(pickedDay?.members ?? []).map((nickname) => (
                  <View key={nickname} style={styles.dayMember}>
                    <View style={styles.dayMemberAvatar} />
                    <Text style={styles.dayMemberName} numberOfLines={1}>
                      {nickname}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.dayEmpty}>이날 운동한 멤버 정보가 없어요.</Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={() => setPickedDay(null)}
              style={({ pressed }) => [styles.dayClose, pressed && styles.pressed]}
            >
              <Text style={styles.dayCloseLabel}>닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
    paddingHorizontal: 44,
  },
  headerBack: {
    position: 'absolute',
    left: 0,
    bottom: 14,
    // 전체 폭을 차지하는 제목 텍스트가 터치를 가로채지 않게 위로 올린다
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
  },
  memberAvatarPlaceholder: {
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 8,
  },
  monthArrow: {
    fontSize: 20,
    lineHeight: 24,
    color: colors.textSub,
  },
  monthLabel: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMain,
  },
  loadingHint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
    paddingHorizontal: 19,
  },
  memberSection: {
    paddingHorizontal: 19,
    marginTop: 28,
  },
  memberTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
  },
  memberSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 12,
  },
  feed: {
    paddingHorizontal: 19,
    gap: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  dayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  dayCard: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  dayTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMain,
  },
  dayMembers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 16,
  },
  dayMember: {
    alignItems: 'center',
    width: 64,
  },
  dayMemberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBorder,
  },
  dayMemberName: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMain,
    marginTop: 6,
    maxWidth: 64,
  },
  dayEmpty: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
    marginTop: 14,
  },
  dayClose: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  dayCloseLabel: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 14,
    color: colors.textSub,
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
