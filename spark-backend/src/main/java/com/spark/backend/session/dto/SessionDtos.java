package com.spark.backend.session.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

/** 세션 요청/응답 — docs/api-contract.md §5, types/api.ts SessionResult 와 1:1 */
public final class SessionDtos {

    private SessionDtos() {
    }

    public record StartSessionRequest(
            @NotBlank(message = "루틴을 선택해주세요.") String routineId
    ) {
    }

    public record StartSessionResponse(String sessionId) {
    }

    /** 프론트는 아직 body 없이 호출한다 — skippedExerciseIds는 선택 확장 */
    public record CompleteSessionRequest(List<String> skippedExerciseIds) {
    }

    public record SessionExerciseResult(String exerciseId, String name, String status) {
    }

    public record SessionResultResponse(
            String sessionId,
            List<SessionExerciseResult> exercises,
            Monthly monthly
    ) {
        public record Monthly(int completedRoutines, int abortedCount, int averageMinutes) {
        }
    }
}
