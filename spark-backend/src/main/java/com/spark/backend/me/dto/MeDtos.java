package com.spark.backend.me.dto;

import jakarta.validation.constraints.Size;

/** 마이 요청/응답 — docs/api-contract.md §8, types/api.ts 와 1:1 */
public final class MeDtos {

    private MeDtos() {
    }

    public record MyProfileResponse(
            String nickname,
            String statusMessage,
            String avatarUrl,
            int streakDays,
            int monthCompletedCount,
            int badgeCount,
            int joinedGroupCount
    ) {
    }

    public record UpdateMeRequest(
            @Size(min = 1, max = 20, message = "닉네임은 1~20자로 입력해주세요.")
            String nickname,
            String avatarUri
    ) {
    }

    public record NotificationSettingsRequest(
            Boolean reminderEnabled,
            String reminderTime,
            Boolean friendNudgeEnabled,
            Boolean groupActivityEnabled
    ) {
    }

    public record NotificationSettingsResponse(
            boolean reminderEnabled,
            String reminderTime,
            boolean friendNudgeEnabled,
            boolean groupActivityEnabled,
            boolean devicePermissionGranted
    ) {
    }

    public record ConsentRequest(Boolean poseAnalysisAgreed) {
    }

    public record ConsentResponse(boolean cameraPermissionGranted, boolean poseAnalysisAgreed) {
    }
}
