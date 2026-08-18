package com.spark.backend.stats;

import com.spark.backend.session.SessionExercise;
import com.spark.backend.session.SessionExerciseRepository;
import com.spark.backend.session.WorkoutSession;
import com.spark.backend.session.WorkoutSessionRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 습관 엔진 — 스트릭·주간·월간 집계의 단일 소스.
 * 프론트의 모든 파생값(streakDays, weeklyAttendance, monthly, monthBestStreak)이 여기서 나온다.
 * 계산 규칙은 docs/erd.md §8.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsEngine {

    /** 스트릭 탐색 상한 — 이 이상 연속이면 사실상 무한 스트릭 */
    private static final int STREAK_LOOKBACK_DAYS = 400;

    private final WorkoutSessionRepository sessionRepository;
    private final SessionExerciseRepository sessionExerciseRepository;

    public record MonthlyStats(int completedRoutines, int abortedCount, int averageMinutes, int skippedExercises) {
    }

    /** 그날 완료 세션이 하루라도 있으면 출석 — 출석 판정의 단일 지점 */
    public Set<LocalDate> completedDays(Long userId, LocalDate from) {
        return sessionRepository
                .findStartTimes(userId, WorkoutSession.Status.COMPLETED, from.atStartOfDay())
                .stream()
                .map(LocalDateTime::toLocalDate)
                .collect(Collectors.toSet());
    }

    /** 오늘(또는 아직 오늘 안 했으면 어제)부터 역순으로 이어진 출석 일수 */
    public int streakDays(Long userId) {
        LocalDate today = LocalDate.now();
        Set<LocalDate> days = completedDays(userId, today.minusDays(STREAK_LOOKBACK_DAYS));
        LocalDate cursor = days.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    /** 이번 주 월~일 7칸 — 요일 라벨과 완료 여부 */
    public List<DayAttendance> weeklyAttendance(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1L);
        Set<LocalDate> days = completedDays(userId, monday);
        String[] labels = {"월", "화", "수", "목", "금", "토", "일"};
        return java.util.stream.IntStream.range(0, 7)
                .mapToObj(i -> new DayAttendance(labels[i], days.contains(monday.plusDays(i))))
                .toList();
    }

    public record DayAttendance(String weekday, boolean completed) {
    }

    /** 이번 달 안에서 가장 길었던 연속 출석 */
    public int monthBestStreak(Long userId, YearMonth month) {
        Set<LocalDate> days = completedDays(userId, month.atDay(1));
        int best = 0;
        int run = 0;
        for (LocalDate d = month.atDay(1); !d.isAfter(month.atEndOfMonth()); d = d.plusDays(1)) {
            run = days.contains(d) ? run + 1 : 0;
            best = Math.max(best, run);
        }
        return best;
    }

    /** 그 달에 출석한 날짜(1~31) 오름차순 */
    public List<Integer> completedDaysOfMonth(Long userId, YearMonth month) {
        return completedDays(userId, month.atDay(1)).stream()
                .filter(d -> YearMonth.from(d).equals(month))
                .map(LocalDate::getDayOfMonth)
                .sorted()
                .toList();
    }

    public MonthlyStats monthlyStats(Long userId, YearMonth month) {
        LocalDateTime from = month.atDay(1).atStartOfDay();
        LocalDateTime to = month.plusMonths(1).atDay(1).atStartOfDay();
        List<WorkoutSession> closed = sessionRepository.findClosedInRange(
                userId, WorkoutSession.Status.IN_PROGRESS, from, to);

        List<WorkoutSession> completed = closed.stream()
                .filter(s -> s.getStatus() == WorkoutSession.Status.COMPLETED)
                .toList();
        // "완료 루틴"은 루틴으로 한 것만 센다 — 단일 운동 세션이 수치를 부풀리면 안 된다
        int completedRoutines = (int) completed.stream()
                .filter(s -> s.getRoutineId() != null)
                .count();
        int aborted = closed.size() - completed.size();
        int averageMinutes = completed.isEmpty() ? 0
                : (int) Math.round(completed.stream()
                        .mapToInt(WorkoutSession::getDurationSeconds).average().orElse(0) / 60.0);
        long skipped = sessionExerciseRepository.countByStatusInRange(
                userId, SessionExercise.Status.SKIPPED, from, to);

        return new MonthlyStats(completedRoutines, aborted, averageMinutes, (int) skipped);
    }
}
