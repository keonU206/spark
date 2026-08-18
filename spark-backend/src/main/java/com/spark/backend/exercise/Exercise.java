package com.spark.backend.exercise;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exercises")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Exercise {

    @Id
    @Column(length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private ExerciseCategory category;

    @Column(nullable = false)
    private String name;

    private String thumbnailUrl;

    /** "좌우 8~10회" — 운동마다 표기 규칙이 달라 문자열 그대로 저장한다 */
    @Column(nullable = false)
    private String repsLabel;

    @Column(nullable = false)
    private int sets;

    @Column(nullable = false)
    private int durationMinutes;

    /** AI PT 지원 6종만 true — 시안 69:1695 명시 */
    @Column(nullable = false)
    private boolean aiPtSupported;

    /** 커서 페이지네이션 정렬 기준 */
    @Column(nullable = false)
    private int sortOrder;

    @Builder
    private Exercise(String id, ExerciseCategory category, String name, String thumbnailUrl,
                     String repsLabel, int sets, int durationMinutes, boolean aiPtSupported, int sortOrder) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.thumbnailUrl = thumbnailUrl;
        this.repsLabel = repsLabel;
        this.sets = sets;
        this.durationMinutes = durationMinutes;
        this.aiPtSupported = aiPtSupported;
        this.sortOrder = sortOrder;
    }
}
