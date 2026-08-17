import type { BadgeList, StreakDetail, WorkoutStats } from '@/types/api';

/** 값은 Figma `69:1437` / `69:727` / `69:1533`에 그려진 것 그대로 */

export const workoutStatsMock: WorkoutStats = {
  totalSessions: 124,
  totalHours: 61,
  streakDays: 14,
  monthBestStreak: 20,
  weeklyAttendance: [
    { weekday: '월', completed: true },
    { weekday: '화', completed: true },
    { weekday: '수', completed: true },
    { weekday: '목', completed: true },
    { weekday: '금', completed: false },
    { weekday: '토', completed: false },
    { weekday: '일', completed: false },
  ],
  monthly: {
    completedRoutines: 18,
    skippedExercises: 3,
    averageMinutes: 28,
  },
  recent: [
    {
      id: 's-1',
      routineName: '전신 스트레칭 루틴',
      whenLabel: '오늘',
      minutes: 32,
      completedCount: 6,
      skippedCount: 0,
    },
    {
      id: 's-2',
      routineName: '어깨·목 집중 루틴',
      whenLabel: '어제',
      minutes: 25,
      completedCount: 5,
      skippedCount: 0,
    },
    {
      id: 's-3',
      routineName: '하체 강화 루틴',
      whenLabel: '2일 전',
      minutes: 40,
      completedCount: 7,
      skippedCount: 0,
    },
    {
      id: 's-4',
      routineName: '코어 & 허리 루틴',
      whenLabel: '3일 전',
      minutes: 30,
      completedCount: 5,
      skippedCount: 1,
    },
    {
      id: 's-5',
      routineName: '아침 기상 스트레칭',
      whenLabel: '5일 전',
      minutes: 15,
      completedCount: 4,
      skippedCount: 0,
    },
  ],
};

export const streakDetailMock: StreakDetail = {
  currentStreakDays: 12,
  monthCompletedCount: 18,
  message: '지금 페이스가 아주 좋아요. 내일도 이어가봐요!',
  attendance: {
    month: '2026-07',
    days: [
      { day: 1, intensity: 1 },
      { day: 2, intensity: 1 },
      { day: 3, intensity: 1 },
      { day: 6, intensity: 1 },
      { day: 7, intensity: 1 },
      { day: 8, intensity: 1 },
      { day: 9, intensity: 1 },
      { day: 13, intensity: 1 },
      { day: 14, intensity: 1 },
      { day: 15, intensity: 1 },
      { day: 20, intensity: 1 },
      { day: 21, intensity: 1 },
      { day: 22, intensity: 1 },
      { day: 23, intensity: 1 },
      { day: 27, intensity: 1 },
      { day: 28, intensity: 1 },
      { day: 29, intensity: 1 },
      { day: 30, intensity: 1 },
    ],
  },
  achievements: [
    { id: 'a-1', title: '첫걸음', subtitle: '7일 연속 완료' },
    { id: 'a-2', title: '운동 마스터', subtitle: '30회 완료' },
  ],
};

export const badgeListMock: BadgeList = {
  earned: [
    { id: 'b-1', name: '7일 연속', state: 'earned', statusLabel: '획득 완료', iconUrl: null },
    { id: 'b-2', name: '첫 운동', state: 'earned', statusLabel: '획득 완료', iconUrl: null },
    { id: 'b-3', name: '30일 달성', state: 'earned', statusLabel: '획득 완료', iconUrl: null },
    { id: 'b-4', name: '루틴 완성', state: 'earned', statusLabel: '획득 완료', iconUrl: null },
    { id: 'b-5', name: 'AI PT 도전', state: 'earned', statusLabel: '획득 완료', iconUrl: null },
  ],
  inProgress: [
    { id: 'b-6', name: '21일 연속', state: 'inProgress', statusLabel: '14/21일', iconUrl: null },
    { id: 'b-7', name: '목표 달성자', state: 'inProgress', statusLabel: '2/5회', iconUrl: null },
    { id: 'b-8', name: '친구 독려왕', state: 'inProgress', statusLabel: '3/10회', iconUrl: null },
  ],
  locked: [
    { id: 'b-9', name: '100일 달성', state: 'locked', statusLabel: '조건 미충족', iconUrl: null },
    { id: 'b-10', name: '운동 마스터', state: 'locked', statusLabel: '조건 미충족', iconUrl: null },
    { id: 'b-11', name: '모임 챔피언', state: 'locked', statusLabel: '조건 미충족', iconUrl: null },
  ],
};
