package com.spark.backend.session;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 앱이 죽거나 배터리가 나가면 abort 호출이 오지 않는다.
 * 시작 후 3시간이 지난 미완료 세션을 ABORTED로 정리한다 — spark-frontend/src/services/api/workout.ts 주석 요구사항.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StaleSessionCleaner {

    private static final int STALE_HOURS = 3;

    private final WorkoutSessionRepository sessionRepository;

    @Scheduled(fixedDelayString = "PT30M", initialDelayString = "PT1M")
    @Transactional
    public void closeStaleSessions() {
        List<WorkoutSession> stale = sessionRepository.findByStatusAndStartedAtBefore(
                WorkoutSession.Status.IN_PROGRESS, LocalDateTime.now().minusHours(STALE_HOURS));
        if (stale.isEmpty()) {
            return;
        }
        stale.forEach(WorkoutSession::abort);
        log.info("미완료 세션 {}건을 중단 처리했습니다", stale.size());
    }
}
