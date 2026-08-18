package com.spark.backend.survey;

import com.spark.backend.common.error.ApiException;
import java.util.Arrays;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 설문 선택지. 프론트(SelectField)는 **코드값**(예: VERY_LOW, WEEK_1_2)을 보낸다 —
 * spark-frontend/src/constants/strings.ts 의 code와 enum 이름이 1:1이다.
 * 계약서(docs/api-contract.md §2)의 예시였던 한국어 표시 문자열도 함께 받아준다.
 */
public final class SurveyEnums {

    private SurveyEnums() {
    }

    /** 코드값(enum 이름) 또는 표시 라벨 어느 쪽이 와도 해석한다 */
    private static <E extends Enum<E>> E resolve(E[] values, java.util.function.Function<E, String> labelOf,
                                                 String raw, String fieldName) {
        return Arrays.stream(values)
                .filter(v -> v.name().equals(raw) || labelOf.apply(v).equals(raw))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_INPUT",
                        fieldName + " 값이 올바르지 않아요."));
    }

    @Getter
    @RequiredArgsConstructor
    public enum FitnessLevel {
        VERY_LOW("매우 낮음"), LOW("낮음"), NORMAL("보통"), HIGH("높음"), VERY_HIGH("매우 높음");

        private final String label;

        public static FitnessLevel from(String raw) {
            return resolve(values(), FitnessLevel::getLabel, raw, "체력 수준");
        }
    }

    @Getter
    @RequiredArgsConstructor
    public enum ActivityLevel {
        NONE("거의 없음"), WEEK_1_2("주 1~2회"), WEEK_3_4("주 3~4회"), WEEK_5_PLUS("주 5회 이상");

        private final String label;

        public static ActivityLevel from(String raw) {
            return resolve(values(), ActivityLevel::getLabel, raw, "활동량");
        }
    }

    @Getter
    @RequiredArgsConstructor
    public enum AvailableTime {
        UNDER_10("10분 이내"), MIN_10_20("10~20분"), MIN_20_30("20~30분"), OVER_30("30분 이상");

        private final String label;

        public static AvailableTime from(String raw) {
            return resolve(values(), AvailableTime::getLabel, raw, "운동 가능 시간");
        }
    }

    @Getter
    @RequiredArgsConstructor
    public enum WorkoutIntensity {
        LIGHT("가볍게"), NORMAL("보통"), HARD("강하게");

        private final String label;

        public static WorkoutIntensity from(String raw) {
            return resolve(values(), WorkoutIntensity::getLabel, raw, "운동 강도");
        }
    }

    /** 프론트가 key 값(neckShoulder …)으로 보내는 항목 */
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
