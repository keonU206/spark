package com.spark.backend.session;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 세션 안의 동작별 결과 — "5개 완료, 1개 건너뜀"이 여기서 나온다 */
@Entity
@Table(name = "session_exercises")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SessionExercise {

    public enum Status { PENDING, COMPLETED, SKIPPED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id")
    private WorkoutSession session;

    /** 운동 마스터가 바뀌어도 기록이 남도록 id와 이름을 함께 저장한다 */
    @Column(nullable = false, length = 40)
    private String exerciseId;

    @Column(nullable = false)
    private String exerciseName;

    @Column(nullable = false)
    private int orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Builder
    private SessionExercise(WorkoutSession session, String exerciseId, String exerciseName, int orderIndex) {
        this.session = session;
        this.exerciseId = exerciseId;
        this.exerciseName = exerciseName;
        this.orderIndex = orderIndex;
        this.status = Status.PENDING;
    }

    public void markCompleted() {
        this.status = Status.COMPLETED;
    }

    public void markSkipped() {
        this.status = Status.SKIPPED;
    }
}
