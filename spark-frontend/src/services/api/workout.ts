import {
  categoriesMock,
  exercisesMock,
  myStatusMock,
  recommendedRoutinesMock,
  sessionResultMock,
} from '@/services/mock/workout';
import type {
  Exercise,
  ExerciseCategory,
  ExercisePage,
  MyStatus,
  Routine,
  SessionResult,
} from '@/types/api';

/** mock ↔ 실서버 전환 스위치. 백엔드가 붙으면 false로 바꾼다. */
const USE_MOCK = true;

const PAGE_SIZE = 6;

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function notConnected(endpoint: string): never {
  throw new Error(`${endpoint} 아직 연결되지 않음 — services/api/workout.ts 참고`);
}

/** `GET /exercise-categories` */
export async function getCategories(): Promise<ExerciseCategory[]> {
  if (!USE_MOCK) notConnected('GET /exercise-categories');
  return delay(categoriesMock);
}

/** `GET /exercises?categoryId&cursor` */
export async function getExercises(
  categoryId: string,
  cursor?: string,
): Promise<ExercisePage> {
  if (!USE_MOCK) notConnected('GET /exercises');

  const filtered =
    categoryId === 'all'
      ? exercisesMock
      : exercisesMock.filter((e) => e.categoryId === categoryId);

  const start = cursor ? Number(cursor) : 0;
  const items = filtered.slice(start, start + PAGE_SIZE);
  const next = start + PAGE_SIZE;

  return delay({
    items,
    nextCursor: next < filtered.length ? String(next) : null,
  });
}

/** `GET /exercises/{id}` */
export async function getExercise(id: string): Promise<Exercise> {
  if (!USE_MOCK) notConnected('GET /exercises/{id}');

  const exercise = exercisesMock.find((e) => e.id === id);
  if (!exercise) throw new Error(`운동을 찾을 수 없어요: ${id}`);
  return delay(exercise);
}

/**
 * 운동 하나만 하는 세션용 루틴.
 * 진행 화면은 `Routine`만 알기 때문에, 단일 운동도 루틴 한 개로 감싸서 넘긴다.
 */
export async function getRoutineForExercise(exerciseId: string): Promise<Routine> {
  const exercise = await getExercise(exerciseId);
  return {
    id: `single-${exercise.id}`,
    name: exercise.name,
    exerciseCount: 1,
    estimatedMinutes: exercise.durationMinutes,
    thumbnailUrl: exercise.thumbnailUrl,
    exercises: [exercise],
  };
}

/** `GET /routines/recommended` */
export async function getRecommendedRoutines(): Promise<Routine[]> {
  if (!USE_MOCK) notConnected('GET /routines/recommended');
  return delay(recommendedRoutinesMock);
}

/** `GET /routines/{id}` */
export async function getRoutine(id: string): Promise<Routine> {
  if (!USE_MOCK) notConnected('GET /routines/{id}');

  const routine = recommendedRoutinesMock.find((r) => r.id === id);
  if (!routine) throw new Error(`루틴을 찾을 수 없어요: ${id}`);
  return delay(routine);
}

/**
 * `POST /sessions` — 세션 시작.
 *
 * 완료 시점에만 알리면 중도 이탈을 셀 수 없다.
 * 루틴 완료 화면의 "중단 횟수"가 이 값에서 나온다.
 */
export async function startSession(routineId: string): Promise<{ sessionId: string }> {
  if (!USE_MOCK) notConnected('POST /sessions');
  return delay({ sessionId: `session-${routineId}-${Date.now()}` });
}

/**
 * `POST /sessions/{id}/abort` — 중도 이탈.
 *
 * 앱이 죽거나 배터리가 나가면 이 호출이 오지 않으므로,
 * 서버는 일정 시간(예: 3시간) 뒤 미완료 세션을 `aborted`로 정리해야 한다.
 */
export async function abortSession(sessionId: string): Promise<void> {
  if (!USE_MOCK) notConnected('POST /sessions/{id}/abort');
  void sessionId;
  await delay(undefined);
}

/** `POST /sessions/{id}/complete` */
export async function completeSession(sessionId: string): Promise<SessionResult> {
  if (!USE_MOCK) notConnected('POST /sessions/{id}/complete');
  return delay({ ...sessionResultMock, sessionId });
}

/** `GET /stats/my-status` */
export async function getMyStatus(): Promise<MyStatus> {
  if (!USE_MOCK) notConnected('GET /stats/my-status');
  return delay(myStatusMock);
}

export type { Exercise };
