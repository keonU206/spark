import {
  categoriesMock,
  exercisesMock,
  myStatusMock,
  recommendedRoutinesMock,
  sessionResultMock,
} from '@/services/mock/workout';
import { http } from '@/services/http';
import type {
  Exercise,
  ExerciseCategory,
  ExercisePage,
  MyStatus,
  Routine,
  SessionResult,
} from '@/types/api';
import type { ExerciseAnalysisResult } from '@/services/workoutReport';

/** mock ↔ 실서버 전환 스위치. `.env`의 `EXPO_PUBLIC_USE_MOCK=false`면 실서버로 붙는다. */
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

const PAGE_SIZE = 6;

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** `GET /exercise-categories` — 첫 항목은 서버가 "전체"(all)를 붙여준다 */
export async function getCategories(): Promise<ExerciseCategory[]> {
  if (USE_MOCK) return delay(categoriesMock);
  const { data } = await http.get<ExerciseCategory[]>('/exercise-categories');
  return data;
}

/** `GET /exercises?categoryId&cursor` — 커서 기반 무한 스크롤 */
export async function getExercises(
  categoryId: string,
  cursor?: string,
): Promise<ExercisePage> {
  if (USE_MOCK) {
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

  const { data } = await http.get<ExercisePage>('/exercises', {
    params: { categoryId, cursor },
  });
  return data;
}

/** `GET /exercises/{id}` */
export async function getExercise(id: string): Promise<Exercise> {
  if (USE_MOCK) {
    const exercise = exercisesMock.find((e) => e.id === id);
    if (!exercise) throw new Error(`운동을 찾을 수 없어요: ${id}`);
    return delay(exercise);
  }
  const { data } = await http.get<Exercise>(`/exercises/${id}`);
  return data;
}

/**
 * 운동 하나만 하는 세션용 루틴.
 * 진행 화면은 `Routine`만 알기 때문에, 단일 운동도 루틴 한 개로 감싸서 넘긴다.
 * 서버의 `POST /sessions`도 `single-{exerciseId}` 형식을 이해한다.
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
  if (USE_MOCK) return delay(recommendedRoutinesMock);
  const { data } = await http.get<Routine[]>('/routines/recommended');
  return data;
}

/** `GET /routines/{id}` */
export async function getRoutine(id: string): Promise<Routine> {
  if (USE_MOCK) {
    const routine = recommendedRoutinesMock.find((r) => r.id === id);
    if (!routine) throw new Error(`루틴을 찾을 수 없어요: ${id}`);
    return delay(routine);
  }
  const { data } = await http.get<Routine>(`/routines/${id}`);
  return data;
}

/**
 * `POST /sessions` — 세션 시작.
 *
 * 완료 시점에만 알리면 중도 이탈을 셀 수 없다.
 * 루틴 완료 화면의 "중단 횟수"가 이 값에서 나온다.
 */
export async function startSession(routineId: string): Promise<{ sessionId: string }> {
  if (USE_MOCK) return delay({ sessionId: `session-${routineId}-${Date.now()}` });
  const { data } = await http.post<{ sessionId: string }>('/sessions', { routineId });
  return data;
}

/**
 * `POST /sessions/{id}/abort` — 중도 이탈.
 *
 * 앱이 죽거나 배터리가 나가면 이 호출이 오지 않으므로,
 * 서버는 3시간 뒤 미완료 세션을 `aborted`로 정리한다.
 */
export async function abortSession(sessionId: string): Promise<void> {
  if (USE_MOCK) {
    void sessionId;
    await delay(undefined);
    return;
  }
  await http.post(`/sessions/${sessionId}/abort`);
}

/** `POST /sessions/{id}/complete` — 응답이 루틴 완료 모달에 그대로 표시된다 */
export async function completeSession(
  sessionId: string,
  analysisResults: ExerciseAnalysisResult[] = [],
): Promise<SessionResult> {
  if (USE_MOCK) return delay({ ...sessionResultMock, sessionId });
  const analysisReports = analysisResults.map(({ exerciseId, report }) => ({
    exerciseId,
    score: report.score,
    totalReps: report.totalReps,
    validReps: report.validReps,
    summary: report.summary,
    issues: report.issues.map((issue) => issue.message),
  }));
  const { data } = await http.post<SessionResult>(`/sessions/${sessionId}/complete`, {
    analysisReports,
  });
  return data;
}

/** `GET /stats/my-status` */
export async function getMyStatus(): Promise<MyStatus> {
  if (USE_MOCK) return delay(myStatusMock);
  const { data } = await http.get<MyStatus>('/stats/my-status');
  return data;
}

export type { Exercise };
