package com.spark.backend.exercise;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 운동·루틴 마스터 데이터 시드.
 * 값은 spark-frontend/src/services/mock/workout.ts(시안 그대로)를 따르고,
 * AI PT 6종 중 mock에 없던 턱 당기기·가슴 열기·사이드 밴드를 추가했다 — docs/erd.md §2.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ExerciseRepository exerciseRepository;
    private final RoutineRepository routineRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return;
        }
        log.info("운동·루틴 마스터 데이터를 시드합니다");

        Map<String, ExerciseCategory> categories = categoryRepository.saveAll(java.util.List.of(
                ExerciseCategory.builder().id("squat").name("스쿼트").sortOrder(1).build(),
                ExerciseCategory.builder().id("lunge").name("런지").sortOrder(2).build(),
                ExerciseCategory.builder().id("stretch").name("스트레칭").sortOrder(3).build(),
                ExerciseCategory.builder().id("etc").name("기타").sortOrder(4).build()
        )).stream().collect(Collectors.toMap(ExerciseCategory::getId, Function.identity()));

        // AI PT 지원 6종: 기본 스쿼트, 프론트 런지, 어깨 돌리기, 턱 당기기, 가슴 열기, 사이드 밴드
        exerciseRepository.saveAll(java.util.List.of(
                exercise("e-1", categories.get("squat"), "사이드 스쿼트", "좌우 8~10회", 2, 4, false, 10),
                exercise("e-2", categories.get("squat"), "기본 스쿼트", "12~15회", 3, 5, true, 20),
                exercise("e-3", categories.get("squat"), "와이드 스쿼트", "10~12회", 3, 5, false, 30),
                exercise("e-4", categories.get("lunge"), "프론트 런지", "좌우 10회", 3, 6, true, 40),
                exercise("e-5", categories.get("lunge"), "백 런지", "좌우 10회", 3, 6, false, 50),
                exercise("e-6", categories.get("stretch"), "목 스트레칭", "좌우 15초", 2, 2, false, 60),
                exercise("e-7", categories.get("stretch"), "어깨 돌리기", "앞뒤 10회", 2, 3, true, 70),
                exercise("e-8", categories.get("stretch"), "허리 비틀기", "좌우 20초", 2, 3, false, 80),
                exercise("e-9", categories.get("stretch"), "햄스트링 스트레칭", "좌우 20초", 2, 4, false, 90),
                exercise("e-10", categories.get("etc"), "플랭크", "30초", 3, 3, false, 100),
                exercise("e-11", categories.get("etc"), "브릿지", "15회", 3, 4, false, 110),
                exercise("e-12", categories.get("etc"), "버드독", "좌우 10회", 2, 4, false, 120),
                exercise("e-13", categories.get("stretch"), "턱 당기기", "10회", 2, 2, true, 130),
                exercise("e-14", categories.get("stretch"), "가슴 열기", "15초 유지 5회", 2, 3, true, 140),
                exercise("e-15", categories.get("stretch"), "사이드 밴드", "좌우 10회", 2, 3, true, 150)
        ));

        Map<String, Exercise> exercises = exerciseRepository.findAll().stream()
                .collect(Collectors.toMap(Exercise::getId, Function.identity()));

        Routine routine1 = Routine.builder()
                .id("routine-1").name("목/어깨 스트레칭 + 코어강화").estimatedMinutes(20).build();
        routine1.addExercise(exercises.get("e-2"));
        routine1.addExercise(exercises.get("e-7"));
        routine1.addExercise(exercises.get("e-4"));

        Routine routine2 = Routine.builder()
                .id("routine-2").name("하체 집중 루틴").estimatedMinutes(18).build();
        routine2.addExercise(exercises.get("e-1"));
        routine2.addExercise(exercises.get("e-5"));
        routine2.addExercise(exercises.get("e-9"));

        Routine routine3 = Routine.builder()
                .id("routine-3").name("AI 상체 스트레칭").estimatedMinutes(9).build();
        routine3.addExercise(exercises.get("e-7"));
        routine3.addExercise(exercises.get("e-14"));
        routine3.addExercise(exercises.get("e-15"));

        routineRepository.saveAll(java.util.List.of(routine1, routine2, routine3));
    }

    private Exercise exercise(String id, ExerciseCategory category, String name, String repsLabel,
                              int sets, int durationMinutes, boolean aiPt, int sortOrder) {
        return Exercise.builder()
                .id(id).category(category).name(name).repsLabel(repsLabel)
                .sets(sets).durationMinutes(durationMinutes).aiPtSupported(aiPt).sortOrder(sortOrder)
                .build();
    }
}
