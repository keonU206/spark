import type { FriendActivity, GroupDetail, GroupStatus, GroupSummary } from '@/types/api';

/** 커뮤니티(`77:1506`) · 모임 상세(`87:813`)에 그려진 값 그대로 */

export const friendActivitiesMock: FriendActivity[] = [
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
];

export const myGroupsMock: GroupSummary[] = [
  {
    id: 'g-1',
    title: '유승연,김채린,고예원,김…',
    description: '우리 진짜 거북목 되지 말자',
    coverUrl: null,
    memberCount: 5,
    lastActivityLabel: '2일전',
  },
  {
    id: 'g-2',
    title: '운동사랑단',
    description: '운동을 사랑하는 동호회',
    coverUrl: null,
    memberCount: 12,
    lastActivityLabel: '1일전',
  },
  {
    id: 'g-3',
    title: '김주성,유동연,김준수',
    description: '브로맨스',
    coverUrl: null,
    memberCount: 3,
    lastActivityLabel: '7일전',
  },
];

export const groupDetailMock: GroupDetail = {
  summary: myGroupsMock[0]!,
  members: [
    { userId: 'u-1', nickname: '유승연', avatarUrl: null },
    { userId: 'u-4', nickname: '조예원', avatarUrl: null },
    { userId: 'u-5', nickname: '임채민', avatarUrl: null },
  ],
  feed: [
    {
      id: 'p-1',
      author: { userId: 'u-1', nickname: '유승연', avatarUrl: null },
      createdAtLabel: '2026.08.23 · 오후 6:30',
      imageUrl: null,
      body: '오늘 스쿼트 20개 3세트 완료!',
      reactions: [
        { emoji: '🩷', count: 12 },
        { emoji: '🔥', count: 15 },
      ],
      comments: [{ userId: 'u-2', nickname: '채린', body: '🍊 다음에 같이 운동하자' }],
      canCheer: true,
    },
  ],
};

/**
 * 모임 운동현황(`81:1817`) mock.
 * 캘린더 농도는 시안에서 칸마다 진하기가 다른 것을 그대로 옮겼다.
 */
export const groupStatusMock: GroupStatus = {
  summary: myGroupsMock[0]!,
  attendance: {
    month: '2026-07',
    days: [
      { day: 3, intensity: 1 },
      { day: 4, intensity: 1 },
      { day: 5, intensity: 1 },
      { day: 6, intensity: 1 },
      { day: 8, intensity: 1 },
      { day: 9, intensity: 0.35 },
      { day: 12, intensity: 1 },
      { day: 15, intensity: 1 },
      { day: 16, intensity: 1 },
      { day: 17, intensity: 0.55 },
      { day: 18, intensity: 1 },
      { day: 19, intensity: 1 },
      { day: 24, intensity: 0.35 },
      { day: 25, intensity: 1 },
      { day: 26, intensity: 1 },
      { day: 29, intensity: 1 },
      { day: 30, intensity: 1 },
    ],
  },
  members: [
    {
      userId: 'u-1',
      nickname: '유승연',
      avatarUrl: null,
      statusLabel: '3일째 운동 완료 ✅',
      canNudge: true,
    },
    {
      userId: 'u-2',
      nickname: '김채린',
      avatarUrl: null,
      statusLabel: '3일째 운동 완료 ✅',
      canNudge: true,
    },
    {
      userId: 'u-4',
      nickname: '고예원',
      avatarUrl: null,
      statusLabel: '8일째 운동 중 🔥',
      canNudge: true,
    },
    {
      userId: 'u-6',
      nickname: '김희민',
      avatarUrl: null,
      statusLabel: '최신 운동 기록이 없어요 ..',
      canNudge: true,
    },
    {
      userId: 'u-7',
      nickname: '김미정',
      avatarUrl: null,
      statusLabel: '최신 운동 기록이 없어요 ..',
      canNudge: true,
    },
  ],
};
