package com.spark.backend.exercise.dto;

import com.spark.backend.exercise.Exercise;
import com.spark.backend.exercise.Routine;
import java.util.List;

/** 운동·루틴 응답 — spark-frontend/src/types/api.ts 와 1:1 */
public final class ExerciseDtos {

    private ExerciseDtos() {
    }

    public record CategoryResponse(String id, String name) {
    }

    public record ExerciseResponse(
            String id,
            String categoryId,
            String categoryName,
            String name,
            String thumbnailUrl,
            String repsLabel,
            int sets,
            int durationMinutes,
            boolean aiPtSupported
    ) {
        public static ExerciseResponse from(Exercise e) {
            return new ExerciseResponse(e.getId(), e.getCategory().getId(), e.getCategory().getName(),
                    e.getName(), e.getThumbnailUrl(), e.getRepsLabel(), e.getSets(),
                    e.getDurationMinutes(), e.isAiPtSupported());
        }
    }

    /** GET /exercises 무한 스크롤 응답 — nextCursor가 null이면 마지막 페이지 */
    public record ExercisePageResponse(List<ExerciseResponse> items, String nextCursor) {
    }

    public record RoutineResponse(
            String id,
            String name,
            int exerciseCount,
            int estimatedMinutes,
            String thumbnailUrl,
            List<ExerciseResponse> exercises
    ) {
        public static RoutineResponse from(Routine routine) {
            List<ExerciseResponse> exercises = routine.getExercises().stream()
                    .map(re -> ExerciseResponse.from(re.getExercise()))
                    .toList();
            return new RoutineResponse(routine.getId(), routine.getName(), exercises.size(),
                    routine.getEstimatedMinutes(), routine.getThumbnailUrl(), exercises);
        }
    }
}
