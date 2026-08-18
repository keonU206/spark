import { badgeListMock, streakDetailMock, workoutStatsMock } from '@/services/mock/stats';
import { http } from '@/services/http';
import type { BadgeList, StreakDetail, WorkoutStats } from '@/types/api';

/** mock ↔ 실서버 전환 스위치. `.env`의 `EXPO_PUBLIC_USE_MOCK=false`면 실서버로 붙는다. */
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** `GET /stats/summary` */
export async function getWorkoutStats(): Promise<WorkoutStats> {
  if (USE_MOCK) return delay(workoutStatsMock);
  const { data } = await http.get<WorkoutStats>('/stats/summary');
  return data;
}

/** `GET /stats/streak` */
export async function getStreakDetail(): Promise<StreakDetail> {
  if (USE_MOCK) return delay(streakDetailMock);
  const { data } = await http.get<StreakDetail>('/stats/streak');
  return data;
}

/** `GET /badges` */
export async function getBadges(): Promise<BadgeList> {
  if (USE_MOCK) return delay(badgeListMock);
  const { data } = await http.get<BadgeList>('/badges');
  return data;
}
