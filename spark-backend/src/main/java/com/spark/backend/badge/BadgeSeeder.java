package com.spark.backend.badge;

import com.spark.backend.badge.Badge.ConditionType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 배지 마스터 시드 — 이름은 mock(시안 69:1533) 그대로 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BadgeSeeder implements CommandLineRunner {

    private final BadgeRepository badgeRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (badgeRepository.count() > 0) {
            return;
        }
        log.info("배지 마스터 데이터를 시드합니다");
        badgeRepository.saveAll(List.of(
                badge("b-1", "7일 연속", ConditionType.STREAK, 7, 1),
                badge("b-2", "첫 운동", ConditionType.SESSION_COUNT, 1, 2),
                badge("b-3", "30일 달성", ConditionType.DAYS_COUNT, 30, 3),
                badge("b-4", "루틴 완성", ConditionType.ROUTINE_COUNT, 1, 4),
                badge("b-5", "AI PT 도전", ConditionType.AI_PT_COUNT, 1, 5),
                badge("b-6", "21일 연속", ConditionType.STREAK, 21, 6),
                badge("b-7", "목표 달성자", ConditionType.ROUTINE_COUNT, 5, 7),
                badge("b-8", "친구 독려왕", ConditionType.NUDGE_COUNT, 10, 8),
                badge("b-9", "100일 달성", ConditionType.DAYS_COUNT, 100, 9),
                badge("b-10", "운동 마스터", ConditionType.SESSION_COUNT, 50, 10),
                badge("b-11", "모임 챔피언", ConditionType.GROUP_COUNT, 3, 11)
        ));
    }

    private Badge badge(String id, String name, ConditionType type, int value, int sortOrder) {
        return Badge.builder()
                .id(id).name(name).conditionType(type).conditionValue(value).sortOrder(sortOrder)
                .build();
    }
}
