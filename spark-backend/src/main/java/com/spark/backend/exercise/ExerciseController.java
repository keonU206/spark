package com.spark.backend.exercise;

import com.spark.backend.exercise.dto.ExerciseDtos.CategoryResponse;
import com.spark.backend.exercise.dto.ExerciseDtos.ExercisePageResponse;
import com.spark.backend.exercise.dto.ExerciseDtos.ExerciseResponse;
import com.spark.backend.exercise.dto.ExerciseDtos.RoutineResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @GetMapping("/exercise-categories")
    public List<CategoryResponse> categories() {
        return exerciseService.categories();
    }

    @GetMapping("/exercises")
    public ExercisePageResponse exercises(@RequestParam(required = false) String categoryId,
                                          @RequestParam(required = false) String cursor) {
        return exerciseService.exercises(categoryId, cursor);
    }

    @GetMapping("/exercises/{id}")
    public ExerciseResponse exercise(@PathVariable String id) {
        return exerciseService.exercise(id);
    }

    @GetMapping("/routines/recommended")
    public List<RoutineResponse> recommendedRoutines() {
        return exerciseService.recommendedRoutines();
    }

    @GetMapping("/routines/{id}")
    public RoutineResponse routine(@PathVariable String id) {
        return exerciseService.routine(id);
    }
}
