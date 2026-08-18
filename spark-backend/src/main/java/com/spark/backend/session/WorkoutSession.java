package com.spark.backend.session;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 운동 세션 — 연속 출석·주간/월간 통계가 전부 이 테이블에서 나온다 (docs/erd.md §3).
 * 시작(POST /sessions) 시 IN_PROGRESS로 생성되고, complete/abort로 닫힌다.
 * 앱이 죽으면 abort가 오지 않으므로 스케줄러가 오래된 세션을 ABORTED로 정리한다.
 */
@Entity
@Table(name = "workout_sessions", indexes = {
        @Index(name = "idx_session_user_status_started", columnList = "userId, status, startedAt")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkoutSession {

    public enum Status { IN_PROGRESS, COMPLETED, ABORTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    /** 루틴 없이 운동 하나만 할 수도 있어 nullable */
    @Column(length = 40)
    private String routineId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(nullable = false)
    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    @Column(nullable = false)
    private int durationSeconds;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<SessionExercise> exercises = new ArrayList<>();

    @Builder
    private WorkoutSession(Long userId, String routineId) {
        this.userId = userId;
        this.routineId = routineId;
        this.status = Status.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
        this.durationSeconds = 0;
    }

    public void addExercise(String exerciseId, String exerciseName) {
        exercises.add(SessionExercise.builder()
                .session(this)
                .exerciseId(exerciseId)
                .exerciseName(exerciseName)
                .orderIndex(exercises.size())
                .build());
    }

    public boolean isInProgress() {
        return status == Status.IN_PROGRESS;
    }

    public void complete() {
        close(Status.COMPLETED);
        // 진행 중(pending)으로 남은 동작은 완료 처리한다 — 프론트는 건너뛴 것만 따로 보고한다
        exercises.stream()
                .filter(e -> e.getStatus() == SessionExercise.Status.PENDING)
                .forEach(SessionExercise::markCompleted);
    }

    public void abort() {
        close(Status.ABORTED);
    }

    private void close(Status newStatus) {
        this.status = newStatus;
        this.endedAt = LocalDateTime.now();
        this.durationSeconds = (int) Duration.between(startedAt, endedAt).getSeconds();
    }
}
