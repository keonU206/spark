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

    /** body 없이 호출해도 동작하며, AI 분석 결과가 있으면 운동별 기록에 함께 저장한다. */
    public record CompleteSessionRequest(
            List<String> skippedExerciseIds,
            List<AnalysisReportRequest> analysisReports
    ) {
    }

    public record AnalysisReportRequest(
            String exerciseId,
            Integer score,
            Integer totalReps,
            Integer validReps,
            String summary,
            List<String> issues
    ) {
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
