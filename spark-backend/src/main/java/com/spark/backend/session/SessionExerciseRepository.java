package com.spark.backend.session;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SessionExerciseRepository extends JpaRepository<SessionExercise, Long> {

    /** 기록 화면의 "건너뛴 운동 N회" */
    @Query("""
            select count(se) from SessionExercise se
            where se.session.userId = :userId and se.status = :status
              and se.session.startedAt >= :from and se.session.startedAt < :to""")
    long countByStatusInRange(@Param("userId") Long userId,
                              @Param("status") SessionExercise.Status status,
                              @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /** AI PT 지원 운동을 완료한 세션 수 — "AI PT 도전" 배지 */
    @Query("""
            select count(distinct se.session.id) from SessionExercise se
            where se.session.userId = :userId and se.session.status = :sessionStatus
              and se.status = :exerciseStatus and se.exerciseId in :exerciseIds""")
    long countAiPtSessions(@Param("userId") Long userId,
                           @Param("sessionStatus") com.spark.backend.session.WorkoutSession.Status sessionStatus,
                           @Param("exerciseStatus") SessionExercise.Status exerciseStatus,
                           @Param("exerciseIds") java.util.List<String> exerciseIds);
}
