import { useEffect, useRef, useState } from 'react';
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

  /** 공유를 마친 모임 이름 — 성공 화면을 잠깐 보여준 뒤 닫는다 */
  const [sharedTo, setSharedTo] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

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

        {sharedTo ? (
          /* 공유 완료 — 어디에 올라갔는지 확실하게 보여주고 닫는다 */
          <View style={styles.doneBox}>
            <Text style={styles.doneCheck}>✅</Text>
            <Text style={styles.doneTitle}>{`'${sharedTo}' 피드에 공유했어요!`}</Text>
            <Text style={styles.doneSub}>모임 상세의 피드에서 확인할 수 있어요.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>어느 모임에 공유할까요?</Text>
            <Text style={styles.preview}>{body}</Text>

            {share.error ? (
              <Text style={styles.errorText}>
                {share.error instanceof Error ? share.error.message : '공유에 실패했어요.'}
              </Text>
            ) : null}

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
                        {
                          onSuccess: () => {
                            setSharedTo(group.title);
                            closeTimer.current = setTimeout(onClose, 1500);
                          },
                        },
                      )
                    }
                    style={({ pressed }) => [
                      styles.row,
                      share.isPending && styles.rowDisabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.cover} />
                    <View style={styles.texts}>
                      <Text style={styles.name} numberOfLines={1}>
                        {group.title}
                      </Text>
                      <Text style={styles.meta}>{`멤버 ${group.memberCount}명`}</Text>
                    </View>
                    {share.isPending ? <Text style={styles.meta}>공유 중…</Text> : null}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </>
        )}
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
  rowDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: colors.main,
    marginBottom: 8,
  },
  doneBox: {
    alignItems: 'center',
    paddingVertical: 34,
  },
  doneCheck: {
    fontSize: 34,
    lineHeight: 42,
  },
  doneTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMain,
    marginTop: 10,
    textAlign: 'center',
  },
  doneSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSub,
    marginTop: 6,
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
