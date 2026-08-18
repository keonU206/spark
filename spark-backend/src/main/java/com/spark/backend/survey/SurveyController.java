package com.spark.backend.survey;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SurveyController {

    private final SurveyService surveyService;

    public record SurveyRequest(
            @NotBlank(message = "체력 수준을 선택해주세요.") String fitnessLevel,
            @NotBlank(message = "활동량을 선택해주세요.") String activityLevel,
            @NotBlank(message = "운동 가능 시간을 선택해주세요.") String availableTime,
            @NotBlank(message = "운동 강도를 선택해주세요.") String intensity,
            @NotEmpty(message = "통증 부위를 선택해주세요.") List<String> painAreas
    ) {
    }

    /** `POST /onboarding/survey` → 204 */
    @PostMapping("/onboarding/survey")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void submit(@AuthenticationPrincipal Long userId, @Valid @RequestBody SurveyRequest request) {
        surveyService.submit(userId, request.fitnessLevel(), request.activityLevel(),
                request.availableTime(), request.intensity(), request.painAreas());
    }
}
