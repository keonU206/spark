package com.spark.backend.session;

import com.spark.backend.badge.BadgeService;
import com.spark.backend.common.error.ApiException;
import com.spark.backend.exercise.Exercise;
import com.spark.backend.exercise.ExerciseRepository;
import com.spark.backend.exercise.Routine;
import com.spark.backend.exercise.RoutineRepository;
import com.spark.backend.session.dto.SessionDtos.SessionExerciseResult;
import com.spark.backend.session.dto.SessionDtos.AnalysisReportRequest;
import com.spark.backend.session.dto.SessionDtos.SessionResultResponse;
import com.spark.backend.session.dto.SessionDtos.StartSessionResponse;
import com.spark.backend.stats.StatsEngine;
import java.time.YearMonth;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final WorkoutSessionRepository sessionRepository;
    private final RoutineRepository routineRepository;
    private final ExerciseRepository exerciseRepository;
    private final StatsEngine statsEngine;
    private final BadgeService badgeService;

    /** 프론트가 단일 운동을 가짜 루틴으로 감쌀 때 붙이는 접두사 (workout.ts getRoutineForExercise) */
    private static final String SINGLE_EXERCISE_PREFIX = "single-";

    /**
     * 세션 시작. 프론트(session.tsx)는 `routineId ?? exerciseId`를 그대로 보내므로
     * 이 값은 루틴 id일 수도, 운동 id일 수도, `single-{exerciseId}`일 수도 있다.
     * 해석 순서: ① 실제 루틴 → ② (접두사를 벗긴) 운동 id → ③ 404
     */
    @Transactional
    public StartSessionResponse start(Long userId, String key) {
        WorkoutSession session;

        Routine routine = routineRepository.findById(key).orElse(null);
        if (routine != null) {
            // 루틴 세션 — 구성 운동을 순서대로 스냅샷 떠 둔다
            session = WorkoutSession.builder().userId(userId).routineId(key).build();
            routine.getExercises().forEach(re ->
                    session.addExercise(re.getExercise().getId(), re.getExercise().getName()));
        } else {
            // 단일 운동 세션 — routineId 없이 운동 하나만 스냅샷한다
            String exerciseId = key.startsWith(SINGLE_EXERCISE_PREFIX)
                    ? key.substring(SINGLE_EXERCISE_PREFIX.length()) : key;
            Exercise exercise = exerciseRepository.findById(exerciseId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ROUTINE_NOT_FOUND",
                            "루틴을 찾을 수 없어요."));
            session = WorkoutSession.builder().userId(userId).build();
            session.addExercise(exercise.getId(), exercise.getName());
        }

        sessionRepository.save(session);
        return new StartSessionResponse(String.valueOf(session.getId()));
    }

    /**
     * 완료. skippedExerciseIds는 선택 — 프론트가 아직 보내지 않으므로 없으면 전부 완료 처리한다.
     * 응답의 monthly 블록이 루틴 완료 모달에 그대로 표시된다.
     */
    @Transactional
    public SessionResultResponse complete(Long userId, Long sessionId, List<String> skippedExerciseIds,
                                          List<AnalysisReportRequest> analysisReports) {
        WorkoutSession session = findOwnSession(userId, sessionId);
        if (!session.isInProgress()) {
            throw new ApiException(HttpStatus.CONFLICT, "SESSION_ALREADY_CLOSED", "이미 끝난 운동이에요.");
        }

        if (skippedExerciseIds != null && !skippedExerciseIds.isEmpty()) {
            Set<String> skipped = Set.copyOf(skippedExerciseIds);
            session.getExercises().stream()
                    .filter(e -> skipped.contains(e.getExerciseId()))
                    .forEach(SessionExercise::markSkipped);
        }
        if (analysisReports != null) {
            analysisReports.forEach(report -> session.getExercises().stream()
                    .filter(exercise -> exercise.getExerciseId().equals(report.exerciseId()))
                    .findFirst()
                    .ifPresent(exercise -> exercise.applyAnalysis(
                            report.score(), report.totalReps(), report.validReps(),
                            report.summary(), report.issues())));
        }
        session.complete();
        // 운동 직후 배지 화면이 바로 갱신돼 보이도록 진행도를 재계산한다
        badgeService.recompute(userId);

        StatsEngine.MonthlyStats monthly = statsEngine.monthlyStats(userId, YearMonth.now());
        return new SessionResultResponse(
                String.valueOf(session.getId()),
                session.getExercises().stream()
                        .map(e -> new SessionExerciseResult(
                                e.getExerciseId(), e.getExerciseName(), e.getStatus().name().toLowerCase()))
                        .toList(),
                new SessionResultResponse.Monthly(
                        monthly.completedRoutines(), monthly.abortedCount(), monthly.averageMinutes()));
    }

    @Transactional
    public void abort(Long userId, Long sessionId) {
        WorkoutSession session = findOwnSession(userId, sessionId);
        if (!session.isInProgress()) {
            throw new ApiException(HttpStatus.CONFLICT, "SESSION_ALREADY_CLOSED", "이미 끝난 운동이에요.");
        }
        session.abort();
    }

    private WorkoutSession findOwnSession(Long userId, Long sessionId) {
        return sessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND",
                        "운동 기록을 찾을 수 없어요."));
    }
}
