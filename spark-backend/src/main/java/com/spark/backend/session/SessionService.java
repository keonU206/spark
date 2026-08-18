package com.spark.backend.session;

import com.spark.backend.common.error.ApiException;
import com.spark.backend.exercise.Routine;
import com.spark.backend.exercise.RoutineRepository;
import com.spark.backend.session.dto.SessionDtos.SessionExerciseResult;
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
    private final StatsEngine statsEngine;

    @Transactional
    public StartSessionResponse start(Long userId, String routineId) {
        WorkoutSession session = WorkoutSession.builder()
                .userId(userId)
                .routineId(routineId)
                .build();

        // 루틴으로 시작하면 구성 운동을 순서대로 스냅샷 떠 둔다
        if (routineId != null) {
            Routine routine = routineRepository.findById(routineId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ROUTINE_NOT_FOUND",
                            "루틴을 찾을 수 없어요."));
            routine.getExercises().forEach(re ->
                    session.addExercise(re.getExercise().getId(), re.getExercise().getName()));
        }

        sessionRepository.save(session);
        return new StartSessionResponse(String.valueOf(session.getId()));
    }

    /**
     * 완료. skippedExerciseIds는 선택 — 프론트가 아직 보내지 않으므로 없으면 전부 완료 처리한다.
     * 응답의 monthly 블록이 루틴 완료 모달에 그대로 표시된다.
     */
    @Transactional
    public SessionResultResponse complete(Long userId, Long sessionId, List<String> skippedExerciseIds) {
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
        session.complete();

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
