import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  addComment,
  cheerPost,
  createFeedPost,
  createGroup,
  getFriendActivities,
  getGroup,
  getGroupStatus,
  getMyGroups,
  joinGroup,
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
  abortSession,
  completeSession,
  getCategories,
  getExercise,
  getExercises,
  getMyStatus,
  getRecommendedRoutines,
  getRoutine,
  getRoutineForExercise,
  startSession,
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

/** 세션 시작. 서버가 발급한 sessionId를 완료·중단에 쓴다 */
export function useStartSession() {
  return useMutation({ mutationFn: (routineId: string) => startSession(routineId) });
}

/** 중도 이탈. 실패해도 화면을 막지 않는다 — 서버가 타임아웃으로 정리한다 */
export function useAbortSession() {
  return useMutation({ mutationFn: (sessionId: string) => abortSession(sessionId) });
}

/** 세션 완료 — 기록·통계가 바뀌므로 관련 쿼리를 무효화한다 */
export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => completeSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      // 운동하면 배지 진행도와 마이의 이번 달 완료 수도 바뀐다
      void queryClient.invalidateQueries({ queryKey: queryKeys.badges });
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
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

/**
 * 모임 목록·친구·홈은 멤버십이 바뀌면 전부 다시 불러와야 한다.
 * 탭 화면은 계속 마운트돼 있어 무효화 없이는 이전 목록이 그대로 보인다.
 */
function useInvalidateMembership() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['groups'] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.friendActivities });
    void queryClient.invalidateQueries({ queryKey: queryKeys.home });
    void queryClient.invalidateQueries({ queryKey: queryKeys.me });
  };
}

/** 모임 만들기 */
export function useCreateGroup() {
  const invalidate = useInvalidateMembership();
  return useMutation({
    mutationFn: (name: string) => createGroup(name),
    onSuccess: invalidate,
  });
}

/** 초대코드로 참여하기 */
export function useJoinGroup() {
  const invalidate = useInvalidateMembership();
  return useMutation({
    mutationFn: (inviteCode: string) => joinGroup(inviteCode),
    onSuccess: invalidate,
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
      // 홈의 친구 현황에도 canNudge(재촉 버튼)가 있다
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
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

/** 운동 완료 후 모임에 공유 */
export function useShareToFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { groupId: string; body: string; sessionId?: string }) =>
      createFeedPost(input),
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.group(input.groupId) });
    },
  });
}

/** 응원 문구 보내기 — 피드 글에 댓글로 달린다 */
export function useAddComment(groupId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: string }) =>
      addComment(groupId as string, postId, body),
    onSuccess: () => {
      if (groupId) void queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
    },
  });
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
