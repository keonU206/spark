import { useCallback, useEffect, useRef, useState } from 'react';

import {
  detectPose,
  exerciseTypeFor,
  toPose,
  type AiLandmark,
  type ExerciseType,
} from '@/services/aiPose';
import {
  WorkoutReportBuilder,
  type RepMeasurement,
  type WorkoutAnalysisReport,
} from '@/services/workoutReport';
import type { Pose } from '@/types/pose';

type AnalyzableExercise = { id?: string; name?: string };

type MovementState = {
  phase: 'ready' | 'active';
  activeFrames: number;
  neutralMetric: number | null;
  recentMetrics: number[];
};

const newMovementState = (): MovementState => ({
  phase: 'ready', activeFrames: 0, neutralMetric: null, recentMetrics: [],
});

function smoothMetric(state: MovementState, metric: number) {
  state.recentMetrics.push(metric);
  if (state.recentMetrics.length > 3) state.recentMetrics.shift();
  const sorted = [...state.recentMetrics].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? metric;
}

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
  // 얕은 시도도 리포트에 포함하기 위해 135°부터 동작 시작으로 본다.
  return { active: metric <= 135, returned: metric >= 155 };
}

function landmark(landmarks: AiLandmark[] | null | undefined, index: number) {
  return landmarks?.find((item) => item.index === index);
}

function torsoTilt(landmarks?: AiLandmark[] | null) {
  const leftShoulder = landmark(landmarks, 11);
  const rightShoulder = landmark(landmarks, 12);
  const leftHip = landmark(landmarks, 23);
  const rightHip = landmark(landmarks, 24);
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 0;
  const shoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const hipX = (leftHip.x + rightHip.x) / 2;
  const hipY = (leftHip.y + rightHip.y) / 2;
  return Math.abs(Math.atan2(shoulderX - hipX, hipY - shoulderY) * (180 / Math.PI));
}

function repMeasurement(angles?: number[] | null, landmarks?: AiLandmark[] | null): RepMeasurement | null {
  if (!angles || angles.length < 2) return null;
  return {
    leftKneeAngle: angles[0] ?? 180,
    rightKneeAngle: angles[1] ?? 180,
    torsoTilt: torsoTilt(landmarks),
  };
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
  const [report, setReport] = useState<WorkoutAnalysisReport | null>(null);
  const movement = useRef<MovementState>(newMovementState());
  const currentRep = useRef<RepMeasurement | null>(null);
  const reportBuilder = useRef(new WorkoutReportBuilder(type));
  const busy = useRef(false);

  useEffect(() => {
    movement.current = newMovementState();
    setRepCount(0);
    setPose(null);
    setError(null);
    setReport(null);
    currentRep.current = null;
    reportBuilder.current.reset(type);
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
      if (result.message) setFeedback(result.message);
      const rawMetric = metricFor(type, result.angles);
      if (rawMetric == null) return;

      const state = movement.current;
      const metric = smoothMetric(state, rawMetric);
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
          currentRep.current = repMeasurement(result.angles, result.landmarks);
          setFeedback('좋아요. 잠깐 유지한 뒤 원위치로 돌아오세요.');
        }
      } else if (active) {
        state.activeFrames += 1;
        const next = repMeasurement(result.angles, result.landmarks);
        if (next && currentRep.current) {
          currentRep.current = {
            leftKneeAngle: Math.min(currentRep.current.leftKneeAngle, next.leftKneeAngle),
            rightKneeAngle: Math.min(currentRep.current.rightKneeAngle, next.rightKneeAngle),
            torsoTilt: Math.max(currentRep.current.torsoTilt, next.torsoTilt),
          };
        } else if (next) {
          currentRep.current = next;
        }
      } else if (returned) {
        if (state.activeFrames >= 2) {
          setRepCount((count) => count + 1);
          setFeedback(COMPLETE_FEEDBACK[type]);
          if (currentRep.current) {
            reportBuilder.current.addRep(currentRep.current);
            setReport(reportBuilder.current.build());
          }
        }
        state.phase = 'ready';
        state.activeFrames = 0;
        currentRep.current = null;
      }
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'AI 서버 연결에 실패했어요.';
      setError(message);
      setFeedback(`분석 오류: ${message}`);
    } finally {
      busy.current = false;
    }
  }, [enabled, type]);

  const finishAnalysis = useCallback(() => reportBuilder.current.build(), []);
  const resetAnalysis = useCallback(() => {
    movement.current = newMovementState();
    currentRep.current = null;
    reportBuilder.current.reset(type);
    setRepCount(0);
    setReport(null);
    setPose(null);
    setError(null);
  }, [type]);

  return {
    pose,
    repCount,
    feedback,
    error,
    report,
    onFrame,
    finishAnalysis,
    resetAnalysis,
    exerciseType: type,
  };
}
