package com.spark.backend.exercise;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoutineRepository extends JpaRepository<Routine, String> {

    /** ownerId가 없는 것이 시스템 추천 루틴 */
    List<Routine> findByOwnerIdIsNullOrderByIdAsc();
}
