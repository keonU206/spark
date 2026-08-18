package com.spark.backend.me;

import com.spark.backend.me.dto.MeDtos.ConsentRequest;
import com.spark.backend.me.dto.MeDtos.ConsentResponse;
import com.spark.backend.me.dto.MeDtos.MyProfileResponse;
import com.spark.backend.me.dto.MeDtos.NotificationSettingsRequest;
import com.spark.backend.me.dto.MeDtos.NotificationSettingsResponse;
import com.spark.backend.me.dto.MeDtos.UpdateMeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class MeController {

    private final MeService meService;

    @GetMapping
    public MyProfileResponse profile(@AuthenticationPrincipal Long userId) {
        return meService.profile(userId);
    }

    @PatchMapping
    public MyProfileResponse update(@AuthenticationPrincipal Long userId,
                                    @Valid @RequestBody UpdateMeRequest request) {
        return meService.updateProfile(userId, request.nickname(), request.avatarUri());
    }

    /** 되돌릴 수 없는 동작 — 프론트가 확인 다이얼로그를 거친 뒤 호출한다 */
    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Long userId) {
        meService.deleteAccount(userId);
    }

    @GetMapping("/notification-settings")
    public NotificationSettingsResponse notificationSettings(@AuthenticationPrincipal Long userId) {
        return meService.notificationSettings(userId);
    }

    @PatchMapping("/notification-settings")
    public NotificationSettingsResponse updateNotificationSettings(
            @AuthenticationPrincipal Long userId, @RequestBody NotificationSettingsRequest request) {
        return meService.updateNotificationSettings(userId, request.reminderEnabled(),
                request.reminderTime(), request.friendNudgeEnabled(), request.groupActivityEnabled());
    }

    @GetMapping("/consents")
    public ConsentResponse consents(@AuthenticationPrincipal Long userId) {
        return meService.consents(userId);
    }

    @PatchMapping("/consents")
    public ConsentResponse updateConsents(@AuthenticationPrincipal Long userId,
                                          @RequestBody ConsentRequest request) {
        return meService.updateConsents(userId, request.poseAnalysisAgreed());
    }
}
