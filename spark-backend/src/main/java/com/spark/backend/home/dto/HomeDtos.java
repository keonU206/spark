package com.spark.backend.home.dto;

import com.spark.backend.group.dto.GroupDtos.FriendActivityResponse;
import java.util.List;

/** 홈 응답 — types/api.ts HomeSummary 와 1:1 */
public final class HomeDtos {

    private HomeDtos() {
    }

    public record RecommendedRoutineResponse(String id, String name, int exerciseCount, int estimatedMinutes) {
    }

    public record WeekdayAttendanceResponse(String weekday, boolean completed) {
    }

    public record HomeSummaryResponse(
            int streakDays,
            RecommendedRoutineResponse recommendedRoutine,
            List<FriendActivityResponse> friendActivities,
            List<WeekdayAttendanceResponse> weeklyAttendance
    ) {
    }
}
