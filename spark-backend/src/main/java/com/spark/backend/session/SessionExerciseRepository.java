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
}
