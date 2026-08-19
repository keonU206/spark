package com.spark.backend.session;

import com.spark.backend.common.error.ApiException;
import com.spark.backend.session.dto.SessionDtos.CompleteSessionRequest;
import com.spark.backend.session.dto.SessionDtos.AnalysisReportRequest;
import com.spark.backend.session.dto.SessionDtos.SessionResultResponse;
import com.spark.backend.session.dto.SessionDtos.StartSessionRequest;
import com.spark.backend.session.dto.SessionDtos.StartSessionResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping
    public StartSessionResponse start(@AuthenticationPrincipal Long userId,
                                      @Valid @RequestBody StartSessionRequest request) {
        return sessionService.start(userId, request.routineId());
    }

    @PostMapping("/{id}/complete")
    public SessionResultResponse complete(@AuthenticationPrincipal Long userId, @PathVariable String id,
                                          @RequestBody(required = false) CompleteSessionRequest request) {
        List<String> skipped = request != null ? request.skippedExerciseIds() : null;
        List<AnalysisReportRequest> reports = request != null ? request.analysisReports() : null;
        return sessionService.complete(userId, parseId(id), skipped, reports);
    }

    @PostMapping("/{id}/abort")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void abort(@AuthenticationPrincipal Long userId, @PathVariable String id) {
        sessionService.abort(userId, parseId(id));
    }

    /** 프론트는 sessionId를 문자열로 다룬다 — 숫자가 아니면 존재하지 않는 세션 */
    private Long parseId(String id) {
        try {
            return Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND", "운동 기록을 찾을 수 없어요.");
        }
    }
}
