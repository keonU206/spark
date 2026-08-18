package com.spark.backend.group;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NudgeRepository extends JpaRepository<Nudge, Long> {

    /** 쿨다운: 같은 대상에게 하루 1회 */
    boolean existsByFromUserIdAndToUserIdAndCreatedAtAfter(Long fromUserId, Long toUserId, LocalDateTime after);

    long countByFromUserId(Long fromUserId);
}
