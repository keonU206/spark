package com.spark.backend.survey;

import com.spark.backend.common.error.ApiException;
import java.util.Arrays;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 설문 선택지. 프론트는 표시 문자열(한국어)을 그대로 보낸다 — docs/api-contract.md §2.
 * DB에는 enum 코드로 저장한다 (코드값+표시명 분리, docs/erd.md §9-3).
 */
public final class SurveyEnums {

    private SurveyEnums() {
    }

    private static <E extends Enum<E>> E fromLabel(E[] values, java.util.function.Function<E, String> labelOf,
                                                   String label, String fieldName) {
        return Arrays.stream(values)
                .filter(v -> labelOf.apply(v).equals(label))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_INPUT",
                        fieldName + " 값이 올바르지 않아요."));
    }

    @Getter
    @RequiredArgsConstructor
    public enum FitnessLevel {
        VERY_LOW("매우 낮음"), LOW("낮음"), NORMAL("보통"), HIGH("높음"), VERY_HIGH("매우 높음");

        private final String label;

        public static FitnessLevel fromLabel(String label) {
            return SurveyEnums.fromLabel(values(), FitnessLevel::getLabel, label, "체력 수준");
        }
    }

    @Getter
    @RequiredArgsConstructor
    public enum ActivityLevel {
        NONE("거의 없음"), WEEKLY_1_2("주 1~2회"), WEEKLY_3_4("주 3~4회"), WEEKLY_5_PLUS("주 5회 이상");

        private final String label;

        public static ActivityLevel fromLabel(String label) {
            return SurveyEnums.fromLabel(values(), ActivityLevel::getLabel, label, "활동량");
        }
    }

    @Getter
    @RequiredArgsConstructor
    public enum AvailableTime {
        UNDER_10("10분 이내"), MIN_10_20("10~20분"), MIN_20_30("20~30분"), OVER_30("30분 이상");

        private final String label;

        public static AvailableTime fromLabel(String label) {
            return SurveyEnums.fromLabel(values(), AvailableTime::getLabel, label, "운동 가능 시간");
        }
    }

    @Getter
    @RequiredArgsConstructor
    public enum WorkoutIntensity {
        LIGHT("가볍게"), NORMAL("보통"), HARD("강하게");

        private final String label;

        public static WorkoutIntensity fromLabel(String label) {
            return SurveyEnums.fromLabel(values(), WorkoutIntensity::getLabel, label, "운동 강도");
        }
    }

    /** 프론트가 코드값으로 보내는 유일한 항목 */
    public enum PainArea {
        neckShoulder, lowerBack, kneeLeg, wristElbow, none;

        public static PainArea fromCode(String code) {
            try {
                return valueOf(code);
            } catch (IllegalArgumentException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_INPUT", "통증 부위 값이 올바르지 않아요.");
            }
        }
    }
}
