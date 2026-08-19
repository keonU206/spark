import { useCallback, useEffect, useRef, useState } from 'react';

import { detectPose, exerciseTypeFor, toPose, type ExerciseType } from '@/services/aiPose';
import type { Pose } from '@/types/pose';

type AnalyzableExercise = { id?: string; name?: string };

type MovementState = {
  phase: 'ready' | 'active';
  activeFrames: number;
  neutralMetric: number | null;
};

const INITIAL_MOVEMENT: MovementState = { phase: 'ready', activeFrames: 0, neutralMetric: null };

function metricFor(type: ExerciseType, angles?: number[] | null): number | null {
  if (!angles?.length) return null;
  if (type === 'squat' || type === 'lunge') return Math.min(angles[0] ?? 180, angles[1] ?? 180);
  return angles[0] ?? null;
}

function thresholds(type: ExerciseType, metric: number, neutral: number | null) {
  if (type === 'chin_tuck') {
    return {
      active: neutral != null && metric <= neutral * 0.72,
      returned: neutral != null && metric >= neutral * 0.88,
    };
  }
  if (type === 'shoulder_roll') return { active: metric <= 0.3, returned: metric >= 0.55 };
  if (type === 'chest_opener') return { active: metric >= 72, returned: metric <= 50 };
  if (type === 'side_bend') return { active: Math.abs(metric) >= 14, returned: Math.abs(metric) <= 7 };
  return { active: metric <= 100, returned: metric >= 155 };
}

const COMPLETE_FEEDBACK: Record<ExerciseType, string> = {
  squat: '좋아요! 스쿼트 한 회 완료했어요.',
  lunge: '좋아요! 런지 한 회 완료했어요.',
  chin_tuck: '턱 당기기 자세가 좋아요.',
  shoulder_roll: '어깨를 크게 잘 돌렸어요.',
  chest_opener: '가슴을 충분히 열었어요.',
  side_bend: '사이드 밴드 한 회 완료했어요.',
};

export function useWorkoutAnalysis({ enabled, exercise }: { enabled: boolean; exercise?: AnalyzableExercise }) {
  const type = exerciseTypeFor(exercise?.id, exercise?.name);
  const [pose, setPose] = useState<Pose | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState('카메라에 몸이 잘 보이도록 서주세요.');
  const [error, setError] = useState<string | null>(null);
  const movement = useRef<MovementState>({ ...INITIAL_MOVEMENT });
  const busy = useRef(false);

  useEffect(() => {
    movement.current = { ...INITIAL_MOVEMENT };
    setRepCount(0);
    setPose(null);
    setError(null);
    setFeedback(type === 'chin_tuck' ? '옆모습으로 2초간 편하게 서주세요.' : '카메라에 몸이 잘 보이도록 서주세요.');
  }, [exercise?.id, type]);

  const onFrame = useCallback(async (base64: string) => {
    if (!enabled || busy.current || !base64) return;
    busy.current = true;
    try {
      const result = await detectPose(base64, type);
      if (!result.success) {
        setPose(null);
        setFeedback(result.message ?? '자세를 인식하지 못했어요.');
        return;
      }
      setError(null);
      setPose(toPose(result.landmarks));
      const metric = metricFor(type, result.angles);
      if (metric == null) return;

      const state = movement.current;
      if (type === 'chin_tuck' && state.neutralMetric == null) {
        if (metric >= 0.12) {
          state.neutralMetric = metric;
          setFeedback('준비됐어요. 턱을 수평으로 뒤로 당겨주세요.');
        }
        return;
      }
      const { active, returned } = thresholds(type, metric, state.neutralMetric);
      if (state.phase === 'ready') {
        if (type === 'chin_tuck' && returned && state.neutralMetric != null) {
          state.neutralMetric = state.neutralMetric * 0.9 + metric * 0.1;
        }
        if (active) {
          state.phase = 'active';
          state.activeFrames = 1;
          setFeedback('좋아요. 잠깐 유지한 뒤 원위치로 돌아오세요.');
        }
      } else if (active) {
        state.activeFrames += 1;
      } else if (returned) {
        if (state.activeFrames >= 2) {
          setRepCount((count) => count + 1);
          setFeedback(COMPLETE_FEEDBACK[type]);
        }
        state.phase = 'ready';
        state.activeFrames = 0;
      }
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'AI 서버 연결에 실패했어요.';
      setError(message);
      setFeedback(`분석 오류: ${message}`);
    } finally {
      busy.current = false;
    }
  }, [enabled, type]);

  return { pose, repCount, feedback, error, onFrame, exerciseType: type };
}
