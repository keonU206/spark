package com.spark.backend.exercise;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<ExerciseCategory, String> {

    List<ExerciseCategory> findAllByOrderBySortOrderAsc();
}
