package com.spark.backend.badge;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUserId(Long userId);

    long countByUserIdAndEarnedAtIsNotNull(Long userId);

    List<UserBadge> findByUserIdAndEarnedAtIsNotNullOrderByEarnedAtDesc(Long userId);
}
