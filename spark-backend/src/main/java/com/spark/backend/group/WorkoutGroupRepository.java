package com.spark.backend.group;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutGroupRepository extends JpaRepository<WorkoutGroup, Long> {

    Optional<WorkoutGroup> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);
}
