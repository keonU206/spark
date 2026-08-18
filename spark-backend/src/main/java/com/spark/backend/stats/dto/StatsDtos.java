package com.spark.backend.stats.dto;

import java.util.List;

/** 기록·통계·배지 응답 — types/api.ts WorkoutStats·StreakDetail·MyStatus·BadgeList 와 1:1 */
public final class StatsDtos {

    private StatsDtos() {
    }

    public record WeekdayAttendanceResponse(String weekday, boolean completed) {
    }

    public record RecentSessionResponse(
            String id,
            String routineName,
            String whenLabel,
            int minutes,
            int completedCount,
            int skippedCount
    ) {
    }

    public record WorkoutStatsResponse(
            int totalSessions,
            int totalHours,
            int streakDays,
            int monthBestStreak,
            List<WeekdayAttendanceResponse> weeklyAttendance,
            Monthly monthly,
            List<RecentSessionResponse> recent
    ) {
        public record Monthly(int completedRoutines, int skippedExercises, int averageMinutes) {
        }
    }

    public record DayIntensityResponse(int day, double intensity) {
    }

    public record AchievementResponse(String id, String title, String subtitle) {
    }

    public record StreakDetailResponse(
            int currentStreakDays,
            int monthCompletedCount,
            String message,
            Attendance attendance,
            List<AchievementResponse> achievements
    ) {
        public record Attendance(String month, List<DayIntensityResponse> days) {
        }
    }

    public record MyStatusResponse(
            int streakDays,
            int monthCompletedDays,
            Attendance attendance
    ) {
        public record Attendance(String month, List<Integer> completedDays) {
        }
    }

    public record BadgeResponse(String id, String name, String state, String statusLabel, String iconUrl) {
    }

    public record BadgeListResponse(
            List<BadgeResponse> earned,
            List<BadgeResponse> inProgress,
            List<BadgeResponse> locked
    ) {
    }
}
