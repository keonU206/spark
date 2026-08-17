import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  cheerPost,
  getFriendActivities,
  getGroup,
  getGroupStatus,
  getMyGroups,
  sendNudge,
} from '@/services/api/group';
import { getHome } from '@/services/api/home';
import {
  deleteAccount,
  getAiPtConsent,
  getMyProfile,
  getNotificationSettings,
  updateAiPtConsent,
  updateMyProfile,
  updateNotificationSettings,
} from '@/services/api/me';
import { getBadges, getStreakDetail, getWorkoutStats } from '@/services/api/stats';
import {
  completeSession,
  getCategories,
  getExercise,
  getExercises,
  getMyStatus,
  getRecommendedRoutines,
  getRoutine,
  getRoutineForExercise,
} from '@/services/api/workout';
import type { AiPtConsent, NotificationSettings } from '@/types/api';

/**
 * 화면이 쓰는 쿼리 훅 모음.
 *
 * 화면마다 `useEffect` + `useState` + 정리 플래그를 반복하던 것을 여기로 모았다.
 * 로딩·에러·캐시·중복요청 제거가 한 곳에서 처리된다.
 */

/** 쿼리 키는 한 곳에서 관리해야 무효화가 어긋나지 않는다 */
export const queryKeys = {
  home: ['home'] as const,
  exerciseCategories: ['exercise-categories'] as const,
  exercises: (categoryId: string) => ['exercises', categoryId] as const,
  exercise: (id: string) => ['exercise', id] as const,
  recommendedRoutines: ['routines', 'recommended'] as const,
  myStatus: ['stats', 'my-status'] as const,
  workoutStats: ['stats', 'summary'] as const,
  streak: ['stats', 'streak'] as const,
  badges: ['badges'] as const,
  friendActivities: ['friends', 'activities'] as const,
  myGroups: ['groups', 'mine'] as const,
  group: (id: string) => ['groups', id] as const,
  groupStatus: (id: string) => ['groups', id, 'status'] as const,
  me: ['me'] as const,
  notificationSettings: ['me', 'notification-settings'] as const,
  aiPtConsent: ['me', 'consents'] as const,
};

/* ------------------------------- 홈 ------------------------------- */

export function useHome() {
  return useQuery({ queryKey: queryKeys.home, queryFn: getHome });
}

/* ------------------------------ 운동 ------------------------------ */

export function useExerciseCategories() {
  return useQuery({ queryKey: queryKeys.exerciseCategories, queryFn: getCategories });
}

/** 커서 기반 무한 스크롤 — `getExercises`가 이미 `nextCursor`를 준다 */
export function useExercises(categoryId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.exercises(categoryId),
    queryFn: ({ pageParam }) => getExercises(categoryId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useExercise(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.exercise(id ?? ''),
    queryFn: () => getExercise(id as string),
    enabled: !!id,
  });
}

export function useRecommendedRoutines() {
  return useQuery({ queryKey: queryKeys.recommendedRoutines, queryFn: getRecommendedRoutines });
}

export function useMyStatus() {
  return useQuery({ queryKey: queryKeys.myStatus, queryFn: getMyStatus });
}

/**
 * 운동 진행 화면이 쓸 루틴.
 * 추천 카드로 시작하면 `routineId`, 운동 상세로 시작하면 `exerciseId`가 온다.
 */
export function useSessionRoutine(routineId?: string, exerciseId?: string) {
  return useQuery({
    queryKey: ['session-routine', routineId ?? '', exerciseId ?? ''] as const,
    queryFn: () =>
      routineId ? getRoutine(routineId) : getRoutineForExercise(exerciseId as string),
    enabled: !!routineId || !!exerciseId,
  });
}

/** 세션 완료 — 기록·통계가 바뀌므로 관련 쿼리를 무효화한다 */
export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => completeSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

/* ------------------------------ 기록 ------------------------------ */

export function useWorkoutStats() {
  return useQuery({ queryKey: queryKeys.workoutStats, queryFn: getWorkoutStats });
}

export function useStreakDetail() {
  return useQuery({ queryKey: queryKeys.streak, queryFn: getStreakDetail });
}

export function useBadges() {
  return useQuery({ queryKey: queryKeys.badges, queryFn: getBadges });
}

/* ------------------------------ 모임 ------------------------------ */

export function useFriendActivities() {
  return useQuery({ queryKey: queryKeys.friendActivities, queryFn: getFriendActivities });
}

export function useMyGroups() {
  return useQuery({ queryKey: queryKeys.myGroups, queryFn: getMyGroups });
}

export function useGroup(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.group(id ?? ''),
    queryFn: () => getGroup(id as string),
    enabled: !!id,
  });
}

export function useGroupStatus(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.groupStatus(id ?? ''),
    queryFn: () => getGroupStatus(id as string),
    enabled: !!id,
  });
}

/** 재촉하기 — 성공하면 친구·모임 현황을 다시 불러온다 */
export function useSendNudge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) => sendNudge(targetUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.friendActivities });
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

/* ------------------------------ 마이 ------------------------------ */

export function useMyProfile() {
  return useQuery({ queryKey: queryKeys.me, queryFn: getMyProfile });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.notificationSettings,
    queryFn: getNotificationSettings,
  });
}

/** 토글은 즉시 반영되어야 해서 낙관적 업데이트를 쓴다 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<NotificationSettings>) => updateNotificationSettings(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notificationSettings });
      const previous = queryClient.getQueryData<NotificationSettings>(
        queryKeys.notificationSettings,
      );
      if (previous) {
        queryClient.setQueryData(queryKeys.notificationSettings, { ...previous, ...patch });
      }
      return { previous };
    },
    onError: (_error, _patch, context) => {
      // 실패하면 되돌린다
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notificationSettings, context.previous);
      }
    },
    onSettled: (data) => {
      if (data) queryClient.setQueryData(queryKeys.notificationSettings, data);
    },
  });
}

/** 표시 이름·프로필 사진 저장 */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: { nickname?: string; avatarUri?: string }) => updateMyProfile(patch),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.me, profile);
    },
  });
}

/** 계정 삭제. 성공하면 화면에서 로그아웃까지 이어간다 */
export function useDeleteAccount() {
  return useMutation({ mutationFn: () => deleteAccount() });
}

/** 모임 피드 응원보내기 */
export function useCheerPost(groupId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => cheerPost(groupId as string, postId),
    onSuccess: () => {
      if (groupId) void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
    },
  });
}

export function useAiPtConsent() {
  return useQuery({ queryKey: queryKeys.aiPtConsent, queryFn: getAiPtConsent });
}

export function useUpdateAiPtConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: Partial<AiPtConsent>) => updateAiPtConsent(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.aiPtConsent });
      const previous = queryClient.getQueryData<AiPtConsent>(queryKeys.aiPtConsent);
      if (previous) queryClient.setQueryData(queryKeys.aiPtConsent, { ...previous, ...patch });
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.aiPtConsent, context.previous);
    },
    onSettled: (data) => {
      if (data) queryClient.setQueryData(queryKeys.aiPtConsent, data);
    },
  });
}
