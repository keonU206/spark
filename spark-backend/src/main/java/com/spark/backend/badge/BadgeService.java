package com.spark.backend.badge;

import com.spark.backend.exercise.Exercise;
import com.spark.backend.exercise.ExerciseRepository;
import com.spark.backend.group.GroupMemberRepository;
import com.spark.backend.group.NudgeRepository;
import com.spark.backend.session.SessionExercise;
import com.spark.backend.session.SessionExerciseRepository;
import com.spark.backend.session.WorkoutSession;
import com.spark.backend.session.WorkoutSessionRepository;
import com.spark.backend.stats.StatsEngine;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 배지 진행도는 원본 테이블에서 그때그때 다시 계산한다(호출 누락으로 어긋날 일이 없다).
 * 세션 완료 시와 배지 화면 조회 시 recompute가 불린다.
 */
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final WorkoutSessionRepository sessionRepository;
    private final SessionExerciseRepository sessionExerciseRepository;
    private final ExerciseRepository exerciseRepository;
    private final NudgeRepository nudgeRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final StatsEngine statsEngine;

    @Transactional
    public List<UserBadge> recompute(Long userId) {
        List<Badge> badges = badgeRepository.findAllByOrderBySortOrderAsc();
        Map<String, UserBadge> mine = userBadgeRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), Function.identity()));

        // 원천 수치를 한 번씩만 계산한다
        int streak = statsEngine.streakDays(userId);
        long sessions = sessionRepository.countByUserIdAndStatus(userId, WorkoutSession.Status.COMPLETED);
        int days = statsEngine.completedDays(userId, LocalDate.now().minusDays(400)).size();
        long routines = sessionRepository.countByUserIdAndStatusAndRoutineIdIsNotNull(
                userId, WorkoutSession.Status.COMPLETED);
        List<String> aiPtIds = exerciseRepository.findByAiPtSupportedTrue().stream()
                .map(Exercise::getId).toList();
        long aiPt = aiPtIds.isEmpty() ? 0 : sessionExerciseRepository.countAiPtSessions(
                userId, WorkoutSession.Status.COMPLETED, SessionExercise.Status.COMPLETED, aiPtIds);
        long nudges = nudgeRepository.countByFromUserId(userId);
        long groups = groupMemberRepository.countByUserId(userId);

        List<UserBadge> result = new ArrayList<>();
        for (Badge badge : badges) {
            UserBadge userBadge = mine.get(badge.getId());
            if (userBadge == null) {
                userBadge = userBadgeRepository.save(UserBadge.builder().userId(userId).badge(badge).build());
            }
            int computed = switch (badge.getConditionType()) {
                case STREAK -> streak;
                case SESSION_COUNT -> (int) sessions;
                case DAYS_COUNT -> days;
                case ROUTINE_COUNT -> (int) routines;
                case AI_PT_COUNT -> (int) aiPt;
                case NUDGE_COUNT -> (int) nudges;
                case GROUP_COUNT -> (int) groups;
            };
            userBadge.updateProgress(computed);
            result.add(userBadge);
        }
        return result;
    }

    @Transactional
    public long earnedCount(Long userId) {
        recompute(userId);
        return userBadgeRepository.countByUserIdAndEarnedAtIsNotNull(userId);
    }
}
