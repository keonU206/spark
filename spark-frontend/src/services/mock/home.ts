import type { HomeSummary } from '@/types/api';

/**
 * 홈 mock 데이터. 값은 Figma `64:592`에 그려진 것과 동일하게 맞췄다.
 * (시안 대조가 가능하도록 — 임의 값이 아니다)
 */
export const homeSummaryMock: HomeSummary = {
  streakDays: 2,
  recommendedRoutine: {
    id: 'routine-1',
    name: '목/어깨 스트레칭 + 코어강화',
    exerciseCount: 5,
    estimatedMinutes: 20,
  },
  friendActivities: [
    {
      userId: 'u-1',
      nickname: '유승연',
      avatarUrl: null,
      statusLabel: '3일째 운동 완료 ✅',
      isMe: true,
      canNudge: false,
    },
    {
      userId: 'u-2',
      nickname: '김채린',
      avatarUrl: null,
      statusLabel: '8일째 운동 중 🔥',
      isMe: false,
      canNudge: true,
    },
    {
      userId: 'u-3',
      nickname: '유동연',
      avatarUrl: null,
      statusLabel: '최신 운동 기록이 없어요 ..',
      isMe: false,
      canNudge: true,
    },
  ],
  weeklyAttendance: [
    { weekday: '월', completed: false },
    { weekday: '화', completed: false },
    { weekday: '수', completed: true },
    { weekday: '목', completed: false },
    { weekday: '금', completed: true },
    { weekday: '토', completed: true },
    { weekday: '일', completed: false },
  ],
};
