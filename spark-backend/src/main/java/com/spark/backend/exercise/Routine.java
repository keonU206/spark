package com.spark.backend.exercise;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "routines")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Routine {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false)
    private String name;

    /** null이면 시스템 추천 루틴 */
    private Long ownerId;

    @Column(nullable = false)
    private int estimatedMinutes;

    private String thumbnailUrl;

    /** 진행 화면이 이 순서대로 소비한다 */
    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<RoutineExercise> exercises = new ArrayList<>();

    @Builder
    private Routine(String id, String name, Long ownerId, int estimatedMinutes, String thumbnailUrl) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.estimatedMinutes = estimatedMinutes;
        this.thumbnailUrl = thumbnailUrl;
    }

    public void addExercise(Exercise exercise) {
        exercises.add(RoutineExercise.builder()
                .routine(this)
                .exercise(exercise)
                .orderIndex(exercises.size())
                .build());
    }
}
