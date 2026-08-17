import type {
  Exercise,
  ExerciseCategory,
  MyStatus,
  Routine,
  SessionResult,
} from '@/types/api';

/**
 * 운동 mock 데이터.
 * 카테고리·표기 형식은 Figma `61:768`(운동 목록)에 그려진 것을 그대로 따랐다.
 */

export const categoriesMock: ExerciseCategory[] = [
  { id: 'all', name: '전체' },
  { id: 'squat', name: '스쿼트' },
  { id: 'lunge', name: '런지' },
  { id: 'stretch', name: '스트레칭' },
  { id: 'etc', name: '기타' },
];

function make(
  id: string,
  categoryId: string,
  categoryName: string,
  name: string,
  repsLabel: string,
  sets: number,
  durationMinutes: number,
): Exercise {
  return {
    id,
    categoryId,
    categoryName,
    name,
    thumbnailUrl: null,
    repsLabel,
    sets,
    durationMinutes,
  };
}

export const exercisesMock: Exercise[] = [
  make('e-1', 'squat', '스쿼트', '사이드 스쿼트', '좌우 8~10회', 2, 4),
  make('e-2', 'squat', '스쿼트', '기본 스쿼트', '12~15회', 3, 5),
  make('e-3', 'squat', '스쿼트', '와이드 스쿼트', '10~12회', 3, 5),
  make('e-4', 'lunge', '런지', '프론트 런지', '좌우 10회', 3, 6),
  make('e-5', 'lunge', '런지', '백 런지', '좌우 10회', 3, 6),
  make('e-6', 'stretch', '스트레칭', '목 스트레칭', '좌우 15초', 2, 2),
  make('e-7', 'stretch', '스트레칭', '어깨 돌리기', '앞뒤 10회', 2, 3),
  make('e-8', 'stretch', '스트레칭', '허리 비틀기', '좌우 20초', 2, 3),
  make('e-9', 'stretch', '스트레칭', '햄스트링 스트레칭', '좌우 20초', 2, 4),
  make('e-10', 'etc', '기타', '플랭크', '30초', 3, 3),
  make('e-11', 'etc', '기타', '브릿지', '15회', 3, 4),
  make('e-12', 'etc', '기타', '버드독', '좌우 10회', 2, 4),
];

/** 진행 화면(`81:1248`, `81:1448`)이 1/3 · 3/3으로 그려져 있어 3개로 맞췄다 */
export const recommendedRoutinesMock: Routine[] = [
  {
    id: 'routine-1',
    name: '목/어깨 스트레칭 + 코어강화',
    exerciseCount: 5,
    estimatedMinutes: 20,
    thumbnailUrl: null,
    exercises: [
      make('e-2', 'squat', '스쿼트', '스쿼트', '12~15회', 3, 5),
      make('e-7', 'stretch', '스트레칭', '어깨돌리기', '앞뒤 10회', 2, 3),
      make('e-4', 'lunge', '런지', '런지', '좌우 10회', 3, 6),
    ],
  },
  {
    id: 'routine-2',
    name: '하체 집중 루틴',
    exerciseCount: 4,
    estimatedMinutes: 18,
    thumbnailUrl: null,
    exercises: [
      make('e-1', 'squat', '스쿼트', '사이드 스쿼트', '좌우 8~10회', 2, 4),
      make('e-5', 'lunge', '런지', '백 런지', '좌우 10회', 3, 6),
      make('e-9', 'stretch', '스트레칭', '햄스트링 스트레칭', '좌우 20초', 2, 4),
    ],
  },
  {
    id: 'routine-3',
    name: '아침 기상 스트레칭',
    exerciseCount: 3,
    estimatedMinutes: 12,
    thumbnailUrl: null,
    exercises: [
      make('e-6', 'stretch', '스트레칭', '목 스트레칭', '좌우 15초', 2, 2),
      make('e-7', 'stretch', '스트레칭', '어깨 돌리기', '앞뒤 10회', 2, 3),
      make('e-8', 'stretch', '스트레칭', '허리 비틀기', '좌우 20초', 2, 3),
    ],
  },
];

/** 루틴 완료 화면(`81:1505`)에 그려진 숫자 그대로 */
export const sessionResultMock: SessionResult = {
  sessionId: 'session-1',
  exercises: [
    { exerciseId: 'e-2', name: '스쿼트', status: 'completed' },
    { exerciseId: 'e-7', name: '어깨돌리기', status: 'completed' },
    { exerciseId: 'e-4', name: '런지', status: 'completed' },
  ],
  monthly: {
    completedRoutines: 12,
    abortedCount: 10,
    averageMinutes: 31,
  },
};

/** 내 운동 현황(`81:887`)에 그려진 값 그대로 — 연속 2일 / 이번 달 12일 */
export const myStatusMock: MyStatus = {
  streakDays: 2,
  monthCompletedDays: 12,
  attendance: {
    month: '2026-07',
    completedDays: [3, 4, 5, 6, 8, 9, 10, 11, 12, 15, 17, 18, 19, 24, 25, 26, 30, 31],
  },
};
