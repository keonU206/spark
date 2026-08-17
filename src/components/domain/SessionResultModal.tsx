import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { ShareToGroupSheet } from '@/components/domain/ShareToGroupSheet';
import { PillButton } from '@/components/ui/PillButton';
import { colors, fontFamily } from '@/theme/tokens';
import type { SessionResult } from '@/types/api';

/**
 * 루틴 완료 — Figma `81:1505`
 * 진행 화면 위에 덮이는 모달. 완료한 운동 목록 + 이번 달 통계 + 홈으로 돌아가기.
 */
export function SessionResultModal({
  visible,
  result,
  onGoHome,
}: {
  visible: boolean;
  result: SessionResult | null;
  onGoHome: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);

  if (!result) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onGoHome}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>운동 기록</Text>
          <Text style={styles.subtitle}>오늘 한 운동 통계를 보여줄게요!</Text>

          <View style={styles.list}>
            {result.exercises.map((exercise, i) => (
              <View key={exercise.exerciseId} style={styles.row}>
                <Text style={styles.rowIndex}>{i + 1}</Text>
                <Text style={styles.rowName} numberOfLines={1}>
                  {exercise.name}
                </Text>
                <Text style={styles.rowStatus}>
                  {exercise.status === 'completed' ? '완료' : '건너뜀'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>이번 달 통계</Text>
            <View style={styles.statsRow}>
              <Stat label="완료 루틴" value={`${result.monthly.completedRoutines}일`} accent />
              <View style={styles.statsDivider} />
              <Stat label="중단 횟수" value={`${result.monthly.abortedCount}번`} />
              <View style={styles.statsDivider} />
              <Stat label="평균 시간" value={`${result.monthly.averageMinutes}분`} />
            </View>
          </View>

          <Text style={styles.outro}>{'오늘의 운동이 끝났습니다.\n수고했어요!'}</Text>

          <View style={styles.cta}>
            {/* 시안에 피드 작성 화면이 없어, 방금 한 운동을 공유하는 흐름으로 대신한다 */}
            <PillButton
              label="모임에 공유하기"
              variant="outline"
              height={52}
              onPress={() => setShareOpen(true)}
              style={styles.shareButton}
            />
            <PillButton label="홈으로 돌아가기" variant="primary" height={52} onPress={onGoHome} />
          </View>

          <ShareToGroupSheet
            visible={shareOpen}
            result={result}
            onClose={() => setShareOpen(false)}
          />
        </View>
      </View>
    </Modal>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 336,
    backgroundColor: colors.bg,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 24,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 19,
    lineHeight: 26,
    color: colors.textMain,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    textAlign: 'center',
    marginTop: 8,
  },
  list: {
    marginTop: 22,
    gap: 10,
  },
  row: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.main,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  rowIndex: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.main,
    width: 18,
  },
  rowName: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 19,
    color: colors.textMain,
  },
  rowStatus: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    color: colors.main,
  },
  statsCard: {
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statsTitle: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMain,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statsDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.cardBorder,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSub,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 24,
    color: colors.textMain,
    marginTop: 6,
  },
  statValueAccent: {
    color: colors.main,
  },
  outro: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMain,
    textAlign: 'center',
    marginTop: 22,
  },
  cta: {
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },
  shareButton: {
    borderRadius: 26,
  },
});
