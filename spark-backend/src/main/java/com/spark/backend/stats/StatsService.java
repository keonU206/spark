package com.spark.backend.stats;

import com.spark.backend.badge.Badge;
import com.spark.backend.badge.BadgeService;
import com.spark.backend.badge.UserBadge;
import com.spark.backend.common.LabelFormatter;
import com.spark.backend.exercise.Routine;
import com.spark.backend.exercise.RoutineRepository;
import com.spark.backend.session.SessionExercise;
import com.spark.backend.session.WorkoutSession;
import com.spark.backend.session.WorkoutSessionRepository;
import com.spark.backend.stats.dto.StatsDtos.AchievementResponse;
import com.spark.backend.stats.dto.StatsDtos.BadgeListResponse;
import com.spark.backend.stats.dto.StatsDtos.BadgeResponse;
import com.spark.backend.stats.dto.StatsDtos.DayIntensityResponse;
import com.spark.backend.stats.dto.StatsDtos.MyStatusResponse;
import com.spark.backend.stats.dto.StatsDtos.RecentSessionResponse;
import com.spark.backend.stats.dto.StatsDtos.StreakDetailResponse;
import com.spark.backend.stats.dto.StatsDtos.WeekdayAttendanceResponse;
import com.spark.backend.stats.dto.StatsDtos.WorkoutStatsResponse;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class StatsService {

    private final StatsEngine statsEngine;
    private final WorkoutSessionRepository sessionRepository;
    private final RoutineRepository routineRepository;
    private final BadgeService badgeService;

    /** GET /stats/summary — 운동 기록/통계 화면 */
    public WorkoutStatsResponse summary(Long userId) {
        YearMonth month = YearMonth.now();
        StatsEngine.MonthlyStats monthly = statsEngine.monthlyStats(userId, month);

        long totalSessions = sessionRepository.countByUserIdAndStatus(userId, WorkoutSession.Status.COMPLETED);
        long totalSeconds = sessionRepository.sumDurationSeconds(userId, WorkoutSession.Status.COMPLETED);

        List<WorkoutSession> recentSessions =
                sessionRepository.findTop10ByUserIdAndStatusOrderByStartedAtDesc(userId, WorkoutSession.Status.COMPLETED);
        Map<String, Routine> routines = routineRepository.findAllById(
                        recentSessions.stream().map(WorkoutSession::getRoutineId).filter(java.util.Objects::nonNull).toList())
                .stream().collect(Collectors.toMap(Routine::getId, Function.identity()));

        List<RecentSessionResponse> recent = recentSessions.stream()
                .map(s -> {
                    int skipped = (int) s.getExercises().stream()
                            .filter(e -> e.getStatus() == SessionExercise.Status.SKIPPED).count();
                    return new RecentSessionResponse(
                            String.valueOf(s.getId()),
                            s.getRoutineId() != null && routines.containsKey(s.getRoutineId())
                                    ? routines.get(s.getRoutineId()).getName() : "자유 운동",
                            LabelFormatter.whenLabel(s.getStartedAt().toLocalDate()),
                            Math.round(s.getDurationSeconds() / 60f),
                            s.getExercises().size() - skipped,
                            skipped);
                })
                .toList();

        return new WorkoutStatsResponse(
                (int) totalSessions,
                (int) (totalSeconds / 3600),
                statsEngine.streakDays(userId),
                statsEngine.monthBestStreak(userId, month),
                statsEngine.weeklyAttendance(userId).stream()
                        .map(d -> new WeekdayAttendanceResponse(d.weekday(), d.completed())).toList(),
                new WorkoutStatsResponse.Monthly(
                        monthly.completedRoutines(), monthly.skippedExercises(), monthly.averageMinutes()),
                recent);
    }

    /** GET /stats/streak — 연속 출석 현황 화면 */
    public StreakDetailResponse streakDetail(Long userId) {
        YearMonth month = YearMonth.now();
        int streak = statsEngine.streakDays(userId);
        List<Integer> days = statsEngine.completedDaysOfMonth(userId, month);

        List<AchievementResponse> achievements = badgeService.recompute(userId).stream()
                .filter(UserBadge::isEarned)
                .limit(4)
                .map(ub -> new AchievementResponse(
                        ub.getBadge().getId(),
                        ub.getBadge().getName(),
                        achievementSubtitle(ub.getBadge())))
                .toList();

        return new StreakDetailResponse(
                streak,
                days.size(),
                LabelFormatter.streakMessage(streak),
                new StreakDetailResponse.Attendance(month.toString(),
                        days.stream().map(d -> new DayIntensityResponse(d, 1.0)).toList()),
                achievements);
    }

    /** GET /stats/my-status — 내 운동 현황(월 캘린더) 화면 */
    public MyStatusResponse myStatus(Long userId) {
        YearMonth month = YearMonth.now();
        List<Integer> days = statsEngine.completedDaysOfMonth(userId, month);
        return new MyStatusResponse(
                statsEngine.streakDays(userId),
                days.size(),
                new MyStatusResponse.Attendance(month.toString(), days));
    }

    /** GET /badges — 배지 목록 화면 (획득/도전 중/잠김) */
    public BadgeListResponse badges(Long userId) {
        List<UserBadge> all = badgeService.recompute(userId);
        return new BadgeListResponse(
                all.stream().filter(UserBadge::isEarned).map(this::toBadge).toList(),
                all.stream().filter(ub -> !ub.isEarned() && ub.getProgress() > 0).map(this::toBadge).toList(),
                all.stream().filter(ub -> !ub.isEarned() && ub.getProgress() == 0).map(this::toBadge).toList());
    }

    private BadgeResponse toBadge(UserBadge ub) {
        Badge badge = ub.getBadge();
        String state;
        String statusLabel;
        if (ub.isEarned()) {
            state = "earned";
            statusLabel = "획득 완료";
        } else if (ub.getProgress() > 0) {
            state = "inProgress";
            statusLabel = ub.getProgress() + "/" + badge.getConditionValue() + badge.getConditionType().unit();
        } else {
            state = "locked";
            statusLabel = "조건 미충족";
        }
        return new BadgeResponse(badge.getId(), badge.getName(), state, statusLabel, badge.getIconUrl());
    }

    /** 연속 출석 화면의 achievements 부제 — "7일 연속 완료" "30회 완료" */
    private String achievementSubtitle(Badge badge) {
        int value = badge.getConditionValue();
        return switch (badge.getConditionType()) {
            case STREAK -> value + "일 연속 완료";
            case SESSION_COUNT -> value + "회 완료";
            case DAYS_COUNT -> value + "일 달성";
            case ROUTINE_COUNT -> "루틴 " + value + "회 완료";
            case AI_PT_COUNT -> "AI PT " + value + "회 완료";
            case NUDGE_COUNT -> "친구 독려 " + value + "회";
            case GROUP_COUNT -> "모임 " + value + "개 참여";
        };
    }
}
