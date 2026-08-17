import { badgeListMock, streakDetailMock, workoutStatsMock } from '@/services/mock/stats';
import type { BadgeList, StreakDetail, WorkoutStats } from '@/types/api';

/** mock ↔ 실서버 전환 스위치. 백엔드가 붙으면 false로 바꾼다. */
const USE_MOCK = true;

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function notConnected(endpoint: string): never {
  throw new Error(`${endpoint} 아직 연결되지 않음 — services/api/stats.ts 참고`);
}

/** `GET /stats/summary` */
export async function getWorkoutStats(): Promise<WorkoutStats> {
  if (!USE_MOCK) notConnected('GET /stats/summary');
  return delay(workoutStatsMock);
}

/** `GET /stats/streak` */
export async function getStreakDetail(): Promise<StreakDetail> {
  if (!USE_MOCK) notConnected('GET /stats/streak');
  return delay(streakDetailMock);
}

/** `GET /badges` */
export async function getBadges(): Promise<BadgeList> {
  if (!USE_MOCK) notConnected('GET /badges');
  return delay(badgeListMock);
}
