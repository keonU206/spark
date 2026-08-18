package com.spark.backend.exercise;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ExerciseRepository extends JpaRepository<Exercise, String> {

    @Query("select e from Exercise e join fetch e.category where e.sortOrder > :cursor order by e.sortOrder asc")
    List<Exercise> findPage(@Param("cursor") int cursor, Pageable pageable);

    @Query("""
            select e from Exercise e join fetch e.category
            where e.category.id = :categoryId and e.sortOrder > :cursor order by e.sortOrder asc""")
    List<Exercise> findPageByCategory(@Param("categoryId") String categoryId,
                                      @Param("cursor") int cursor, Pageable pageable);
}
