import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/ScreenState';
import { useMyGroups, useShareToFeed } from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';
import type { SessionResult } from '@/types/api';

/**
 * 운동 완료 후 모임에 공유하는 시트.
 *
 * 시안에 피드 작성 화면이 없어서, 별도 글쓰기 대신 **방금 한 운동을 공유**하는 흐름으로 만들었다.
 * 시안의 피드 글이 "오늘 스쿼트 20개 3세트 완료!"처럼 운동 기록 자체이기 때문이다.
 *
 * 여러 모임에 속할 수 있으므로 어디에 올릴지 고르게 한다.
 */
export function ShareToGroupSheet({
  visible,
  result,
  onClose,
}: {
  visible: boolean;
  result: SessionResult;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const groupsQuery = useMyGroups();
  const share = useShareToFeed();

  // "스쿼트, 어깨돌리기, 런지 완료!" 형태로 자동 작성한다
  const completed = result.exercises.filter((e) => e.status === 'completed');
  const body =
    completed.length > 0
      ? `오늘 ${completed.map((e) => e.name).join(', ')} 완료!`
      : '오늘도 운동했어요!';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.grabber} />
        <Text style={styles.title}>어느 모임에 공유할까요?</Text>
        <Text style={styles.preview}>{body}</Text>

        <ScrollView bounces={false}>
          {groupsQuery.data?.length === 0 ? (
            <EmptyState message="아직 참여 중인 모임이 없어요." />
          ) : (
            groupsQuery.data?.map((group) => (
              <Pressable
                key={group.id}
                accessibilityRole="button"
                disabled={share.isPending}
                onPress={() =>
                  share.mutate(
                    { groupId: group.id, body, sessionId: result.sessionId },
                    { onSuccess: onClose },
                  )
                }
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.cover} />
                <View style={styles.texts}>
                  <Text style={styles.name} numberOfLines={1}>
                    {group.title}
                  </Text>
                  <Text style={styles.meta}>{`멤버 ${group.memberCount}명`}</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    maxHeight: '65%',
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray6,
    marginBottom: 16,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 24,
    color: colors.textMain,
  },
  preview: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    marginTop: 6,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  cover: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.cardBorder,
  },
  texts: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMain,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSub,
    marginTop: 2,
  },
});
