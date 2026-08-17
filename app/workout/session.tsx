import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraConsentModal } from '@/components/domain/CameraConsentModal';
import { CameraStage } from '@/components/domain/CameraStage';
import { SessionResultModal } from '@/components/domain/SessionResultModal';
import { TabHomeIcon } from '@/components/illustrations/tabIcons';
import { usePoseEngine } from '@/hooks/usePoseEngine';
import { ScreenError, ScreenLoading } from '@/components/ui/ScreenState';
import {
  useAbortSession,
  useCompleteSession,
  useSessionRoutine,
  useStartSession,
} from '@/hooks/queries';
import { colors, fontFamily } from '@/theme/tokens';
import type { SessionResult } from '@/types/api';

function formatTimer(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(' : ');
}

/**
 * 운동 진행 — Figma `81:1725`(권한) / `81:1248`(1/3) / `81:1448`(3/3) / `81:1505`(완료)
 *
 * 시안: 상단 흰 헤더(타이머 + 운동명 + ‹ ›) / 카메라 무대 / 우측 홈·일시정지 버튼 /
 * 하단 시트(n / 총개수, 안내 문구, 진행바)
 */
export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  // 루틴으로 시작하거나(추천 카드), 운동 하나로 시작한다(운동 상세)
  const { routineId, exerciseId } = useLocalSearchParams<{
    routineId?: string;
    exerciseId?: string;
  }>();

  const routineQuery = useSessionRoutine(routineId, exerciseId);
  const start = useStartSession();
  const abort = useAbortSession();
  const complete = useCompleteSession();

  // 서버가 발급한 세션 id. 완료·중단에 쓴다
  const sessionId = useRef<string | null>(null);

  const [consented, setConsented] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);

  // 실제 카메라를 쓸 수 있는지는 CameraStage가 확인해서 알려준다
  const [hasCamera, setHasCamera] = useState(false);
  const { pose } = usePoseEngine({
    enabled: consented && !paused && !result,
    hasRealSource: hasCamera,
  });
  const finishing = useRef(false);
  /** 정상 완료했는지 — 언마운트 시 중단으로 기록할지 판단한다 */
  const finished = useRef(false);

  // 동의하면 서버에 세션 시작을 알린다 (중도 이탈을 세려면 시작 기록이 있어야 한다)
  useEffect(() => {
    if (!consented || sessionId.current) return;
    const key = routineId ?? exerciseId;
    if (!key) return;

    start.mutate(key, {
      onSuccess: (res) => {
        sessionId.current = res.sessionId;
      },
    });
    // start는 매 렌더 새로 만들어지므로 의존성에서 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consented, routineId, exerciseId]);

  // 완료하지 않고 화면을 벗어나면 중단으로 기록한다
  useEffect(() => {
    return () => {
      if (sessionId.current && !finished.current) {
        abort.mutate(sessionId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 타이머는 동의 후, 일시정지가 아닐 때만 흐른다
  useEffect(() => {
    if (!consented || paused || result) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [consented, paused, result]);

  const routine = routineQuery.data;

  if (!routineId && !exerciseId) {
    return <ScreenError error={new Error('루틴이 지정되지 않았어요.')} />;
  }
  if (routineQuery.error) {
    return <ScreenError error={routineQuery.error} onRetry={() => void routineQuery.refetch()} />;
  }
  if (!routine) return <ScreenLoading />;

  const total = routine.exercises.length;
  const current = routine.exercises[index];
  const isLast = index === total - 1;
  const progress = total > 0 ? (index + 1) / total : 0;

  async function finish() {
    const sessionKey = sessionId.current ?? routineId ?? exerciseId;
    if (finishing.current || !sessionKey) return;
    finishing.current = true;
    try {
      setResult(await complete.mutateAsync(sessionKey));
      finished.current = true;
    } finally {
      finishing.current = false;
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <Text style={styles.timer}>{formatTimer(seconds)}</Text>

        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이전 운동"
            disabled={index === 0}
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
            style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
          >
            <Text style={[styles.arrowLabel, index === 0 && styles.arrowDisabled]}>‹</Text>
          </Pressable>

          <Text style={styles.exerciseName} numberOfLines={1}>
            {current?.name ?? ''}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다음 운동"
            onPress={() => (isLast ? void finish() : setIndex((i) => i + 1))}
            style={({ pressed }) => [styles.arrow, pressed && styles.pressed]}
          >
            <Text style={styles.arrowLabel}>›</Text>
          </Pressable>
        </View>
      </View>

      <CameraStage pose={pose} paused={paused} onSourceReady={setHasCamera} />

      <View style={styles.floatingControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="홈으로"
          onPress={() => router.replace('/home')}
          style={({ pressed }) => [styles.roundButton, styles.homeButton, pressed && styles.pressed]}
        >
          <TabHomeIcon size={22} active />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={paused ? '이어서 하기' : '일시정지'}
          onPress={() => setPaused((p) => !p)}
          style={({ pressed }) => [styles.roundButton, styles.pauseButton, pressed && styles.pressed]}
        >
          <Text style={styles.pauseGlyph}>{paused ? '▶' : '❙❙'}</Text>
        </Pressable>
      </View>

      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.grabber} />

        <Text style={styles.count}>
          <Text style={styles.countCurrent}>{index + 1}</Text>
          <Text style={styles.countTotal}>{` / ${total}`}</Text>
        </Text>

        {/*
          시안이 단계마다 문구가 다르다.
          1/3 `81:1248` "완료까지 같이 운동해요!"
          2/3 `63:1396` "루틴 완료까지 1세트 남았습니다." (남은 개수 = 3 - 2 = 1)
          3/3 `81:1448` "루틴 완료까지 얼마 안 남았어요!"
        */}
        <Text style={styles.hint}>
          {index === 0
            ? '완료까지 같이 운동해요!'
            : isLast
              ? '루틴 완료까지 얼마 안 남았어요!'
              : `루틴 완료까지 ${total - index - 1}세트 남았습니다.`}
        </Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/*
        두 모달을 동시에 마운트해 두고 `visible`만 토글하면, 같은 틱에 하나가 닫히고
        하나가 열릴 때 react-native-web의 페이드 전환이 엉킨다
        (닫히는 쪽이 opacity 1로 남고, 열리는 쪽이 opacity 0으로 남는다).
        필요할 때만 마운트해서 그 상황 자체를 없앤다.
      */}
      {!consented && !result ? (
        <CameraConsentModal
          visible
          onAgree={() => setConsented(true)}
          onDecline={() => router.back()}
        />
      ) : null}

      {result ? (
        <SessionResultModal visible result={result} onGoHome={() => router.replace('/home')} />
      ) : null}
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
    paddingBottom: 14,
  },
  timer: {
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    color: colors.main,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginTop: 2,
  },
  arrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLabel: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.textSub,
  },
  arrowDisabled: {
    color: colors.gray6,
  },
  exerciseName: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 24,
    color: colors.textMain,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  floatingControls: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    gap: 12,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    backgroundColor: colors.main,
  },
  pauseButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.main,
  },
  pauseGlyph: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.main,
  },
  bottomSheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  grabber: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray6,
  },
  count: {
    marginTop: 18,
  },
  countCurrent: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 34,
    color: colors.textMain,
  },
  countTotal: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 22,
    color: colors.textSub,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSub,
    marginTop: 6,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBorder,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.main,
  },
});
