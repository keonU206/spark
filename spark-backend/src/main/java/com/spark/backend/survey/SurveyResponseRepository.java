package com.spark.backend.survey;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, Long> {

    boolean existsByUserId(Long userId);
}
