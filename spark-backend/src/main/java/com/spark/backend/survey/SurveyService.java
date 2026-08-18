package com.spark.backend.survey;

import com.spark.backend.common.error.ApiException;
import com.spark.backend.survey.SurveyEnums.PainArea;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SurveyService {

    private final SurveyResponseRepository surveyResponseRepository;

    @Transactional
    public void submit(Long userId, String fitnessLevel, String activityLevel,
                       String availableTime, String intensity, List<String> painAreaCodes) {
        if (surveyResponseRepository.existsByUserId(userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "SURVEY_ALREADY_SUBMITTED", "설문은 이미 제출했어요.");
        }

        Set<PainArea> painAreas = painAreaCodes.stream()
                .map(PainArea::fromCode)
                .collect(Collectors.toSet());
        // "통증 없음"은 다른 값과 함께 올 수 없다 — docs/api-contract.md §2
        if (painAreas.contains(PainArea.none) && painAreas.size() > 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_INPUT",
                    "'통증 없음'은 다른 부위와 함께 선택할 수 없어요.");
        }

        surveyResponseRepository.save(SurveyResponse.builder()
                .userId(userId)
                .fitnessLevel(SurveyEnums.FitnessLevel.from(fitnessLevel))
                .activityLevel(SurveyEnums.ActivityLevel.from(activityLevel))
                .availableTime(SurveyEnums.AvailableTime.from(availableTime))
                .intensity(SurveyEnums.WorkoutIntensity.from(intensity))
                .painAreas(painAreas)
                .build());
    }
}
