package com.spark.backend.stats;

import com.spark.backend.stats.dto.StatsDtos.BadgeListResponse;
import com.spark.backend.stats.dto.StatsDtos.MyStatusResponse;
import com.spark.backend.stats.dto.StatsDtos.StreakDetailResponse;
import com.spark.backend.stats.dto.StatsDtos.WorkoutStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/stats/summary")
    public WorkoutStatsResponse summary(@AuthenticationPrincipal Long userId) {
        return statsService.summary(userId);
    }

    @GetMapping("/stats/streak")
    public StreakDetailResponse streak(@AuthenticationPrincipal Long userId) {
        return statsService.streakDetail(userId);
    }

    @GetMapping("/stats/my-status")
    public MyStatusResponse myStatus(@AuthenticationPrincipal Long userId) {
        return statsService.myStatus(userId);
    }

    @GetMapping("/badges")
    public BadgeListResponse badges(@AuthenticationPrincipal Long userId) {
        return statsService.badges(userId);
    }
}
