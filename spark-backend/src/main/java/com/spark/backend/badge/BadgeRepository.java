package com.spark.backend.badge;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, String> {

    List<Badge> findAllByOrderBySortOrderAsc();
}
