package com.spark.backend.session;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    Optional<WorkoutSession> findByIdAndUserId(Long id, Long userId);

    /** 스트릭 계산용 — 완료 세션의 시작 시각만 가볍게 가져온다 */
    @Query("""
            select s.startedAt from WorkoutSession s
            where s.userId = :userId and s.status = :status and s.startedAt >= :from""")
    List<LocalDateTime> findStartTimes(@Param("userId") Long userId,
                                       @Param("status") WorkoutSession.Status status,
                                       @Param("from") LocalDateTime from);

    /** 월간 집계용 — 그 달에 시작해 닫힌(완료/중단) 세션 전부 */
    @Query("""
            select s from WorkoutSession s
            where s.userId = :userId and s.status <> :inProgress
              and s.startedAt >= :from and s.startedAt < :to""")
    List<WorkoutSession> findClosedInRange(@Param("userId") Long userId,
                                           @Param("inProgress") WorkoutSession.Status inProgress,
                                           @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** 스케줄러가 정리할 오래된 미완료 세션 */
    List<WorkoutSession> findByStatusAndStartedAtBefore(WorkoutSession.Status status, LocalDateTime before);

    /** 최근 기록 목록용 */
    List<WorkoutSession> findTop10ByUserIdAndStatusOrderByStartedAtDesc(Long userId, WorkoutSession.Status status);

    long countByUserIdAndStatus(Long userId, WorkoutSession.Status status);
}
