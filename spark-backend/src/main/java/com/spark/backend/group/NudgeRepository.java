package com.spark.backend.group;

import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NudgeRepository extends JpaRepository<Nudge, Long> {

    /** 쿨다운: 같은 대상에게 하루 1회 */
    boolean existsByFromUserIdAndToUserIdAndCreatedAtAfter(Long fromUserId, Long toUserId, LocalDateTime after);

    long countByFromUserId(Long fromUserId);

    /** 아직 확인하지 않은 받은 재촉 — 홈 배너·종 아이콘용 */
    java.util.List<Nudge> findByToUserIdAndSeenAtIsNullOrderByCreatedAtDesc(Long toUserId);

    /** 알림함 — 받은 재촉 이력 (최근 50개) */
    java.util.List<Nudge> findTop50ByToUserIdOrderByCreatedAtDesc(Long toUserId);
}
