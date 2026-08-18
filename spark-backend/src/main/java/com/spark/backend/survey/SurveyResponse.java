package com.spark.backend.survey;

import com.spark.backend.survey.SurveyEnums.ActivityLevel;
import com.spark.backend.survey.SurveyEnums.AvailableTime;
import com.spark.backend.survey.SurveyEnums.FitnessLevel;
import com.spark.backend.survey.SurveyEnums.PainArea;
import com.spark.backend.survey.SurveyEnums.WorkoutIntensity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 초기 설문 — 계정당 1회. 존재 여부가 AuthSession.surveyCompleted 가 된다 */
@Entity
@Table(name = "survey_responses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SurveyResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FitnessLevel fitnessLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityLevel activityLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AvailableTime availableTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkoutIntensity intensity;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "survey_pain_areas", joinColumns = @JoinColumn(name = "survey_response_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "area", nullable = false)
    private Set<PainArea> painAreas;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private SurveyResponse(Long userId, FitnessLevel fitnessLevel, ActivityLevel activityLevel,
                           AvailableTime availableTime, WorkoutIntensity intensity, Set<PainArea> painAreas) {
        this.userId = userId;
        this.fitnessLevel = fitnessLevel;
        this.activityLevel = activityLevel;
        this.availableTime = availableTime;
        this.intensity = intensity;
        this.painAreas = painAreas;
    }

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
