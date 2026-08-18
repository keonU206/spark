package com.spark.backend.me;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 알림 설정. devicePermissionGranted는 기기 상태라 저장하지 않는다 — docs/erd.md §7 */
@Entity
@Table(name = "notification_settings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NotificationSetting {

    @Id
    private Long userId;

    @Column(nullable = false)
    private boolean reminderEnabled;

    /** "오전 8:00" — 화면 표기 그대로 저장한다 */
    @Column(nullable = false)
    private String reminderTime;

    @Column(nullable = false)
    private boolean friendNudgeEnabled;

    @Column(nullable = false)
    private boolean groupActivityEnabled;

    @Builder
    private NotificationSetting(Long userId) {
        this.userId = userId;
        this.reminderEnabled = true;
        this.reminderTime = "오전 8:00";
        this.friendNudgeEnabled = true;
        this.groupActivityEnabled = true;
    }

    public void update(Boolean reminderEnabled, String reminderTime,
                       Boolean friendNudgeEnabled, Boolean groupActivityEnabled) {
        if (reminderEnabled != null) this.reminderEnabled = reminderEnabled;
        if (reminderTime != null && !reminderTime.isBlank()) this.reminderTime = reminderTime;
        if (friendNudgeEnabled != null) this.friendNudgeEnabled = friendNudgeEnabled;
        if (groupActivityEnabled != null) this.groupActivityEnabled = groupActivityEnabled;
    }
}
