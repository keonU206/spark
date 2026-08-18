package com.spark.backend.badge;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "badges")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Badge {

    /** 어떤 수치가 조건값에 도달하면 획득하는지 */
    public enum ConditionType {
        STREAK,          // 연속 출석일
        SESSION_COUNT,   // 완료 세션 수
        DAYS_COUNT,      // 운동한 날 수
        ROUTINE_COUNT,   // 루틴 완료 수
        AI_PT_COUNT,     // AI PT 운동 포함 세션 수
        NUDGE_COUNT,     // 보낸 독려 수
        GROUP_COUNT;     // 참여 모임 수

        /** "14/21일" · "2/5회" 의 단위 */
        public String unit() {
            return (this == STREAK || this == DAYS_COUNT) ? "일" : "회";
        }
    }

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false)
    private String name;

    private String iconUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConditionType conditionType;

    @Column(nullable = false)
    private int conditionValue;

    @Column(nullable = false)
    private int sortOrder;

    @Builder
    private Badge(String id, String name, String iconUrl, ConditionType conditionType,
                  int conditionValue, int sortOrder) {
        this.id = id;
        this.name = name;
        this.iconUrl = iconUrl;
        this.conditionType = conditionType;
        this.conditionValue = conditionValue;
        this.sortOrder = sortOrder;
    }
}
