package com.spark.backend.me;

import com.spark.backend.auth.RefreshTokenRepository;
import com.spark.backend.badge.BadgeService;
import com.spark.backend.common.error.ApiException;
import com.spark.backend.group.GroupMemberRepository;
import com.spark.backend.me.dto.MeDtos.ConsentResponse;
import com.spark.backend.me.dto.MeDtos.MyProfileResponse;
import com.spark.backend.me.dto.MeDtos.NotificationSettingsResponse;
import com.spark.backend.stats.StatsEngine;
import com.spark.backend.user.User;
import com.spark.backend.user.UserRepository;
import java.time.YearMonth;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MeService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final NotificationSettingRepository notificationSettingRepository;
    private final UserConsentRepository userConsentRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final StatsEngine statsEngine;
    private final BadgeService badgeService;

    public MyProfileResponse profile(Long userId) {
        User user = findUser(userId);
        return new MyProfileResponse(
                user.getNickname(),
                user.getStatusMessage(),
                user.getAvatarUrl(),
                statsEngine.streakDays(userId),
                statsEngine.completedDaysOfMonth(userId, YearMonth.now()).size(),
                (int) badgeService.earnedCount(userId),
                (int) groupMemberRepository.countByUserId(userId));
    }

    /** PATCH /me — avatarUri는 업로드된 URL을 기대한다 (기기 로컬 경로면 그 값 그대로 저장됨) */
    public MyProfileResponse updateProfile(Long userId, String nickname, String avatarUri) {
        User user = findUser(userId);
        user.updateProfile(nickname, avatarUri);
        return profile(userId);
    }

    /** DELETE /me — 소프트 삭제 + 발급된 refresh 토큰 전부 폐기 */
    public void deleteAccount(Long userId) {
        User user = findUser(userId);
        user.softDelete();
        refreshTokenRepository.deleteByUserId(userId);
    }

    public NotificationSettingsResponse notificationSettings(Long userId) {
        return toResponse(findOrCreateSettings(userId));
    }

    public NotificationSettingsResponse updateNotificationSettings(
            Long userId, Boolean reminderEnabled, String reminderTime,
            Boolean friendNudgeEnabled, Boolean groupActivityEnabled) {
        NotificationSetting settings = findOrCreateSettings(userId);
        settings.update(reminderEnabled, reminderTime, friendNudgeEnabled, groupActivityEnabled);
        return toResponse(settings);
    }

    public ConsentResponse consents(Long userId) {
        return toResponse(findOrCreateConsent(userId));
    }

    public ConsentResponse updateConsents(Long userId, Boolean poseAnalysisAgreed) {
        UserConsent consent = findOrCreateConsent(userId);
        if (poseAnalysisAgreed != null) {
            consent.setAgreed(poseAnalysisAgreed);
        }
        return toResponse(consent);
    }

    /* ---------------- 내부 ---------------- */

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "로그인이 필요해요."));
    }

    private NotificationSetting findOrCreateSettings(Long userId) {
        return notificationSettingRepository.findById(userId)
                .orElseGet(() -> notificationSettingRepository.save(
                        NotificationSetting.builder().userId(userId).build()));
    }

    private UserConsent findOrCreateConsent(Long userId) {
        return userConsentRepository.findById(userId)
                .orElseGet(() -> userConsentRepository.save(UserConsent.builder().userId(userId).build()));
    }

    /** devicePermissionGranted·cameraPermissionGranted는 기기 상태 — 앱이 덮어쓰고 표시한다 */
    private NotificationSettingsResponse toResponse(NotificationSetting s) {
        return new NotificationSettingsResponse(
                s.isReminderEnabled(), s.getReminderTime(),
                s.isFriendNudgeEnabled(), s.isGroupActivityEnabled(), true);
    }

    private ConsentResponse toResponse(UserConsent c) {
        return new ConsentResponse(false, c.isPoseAnalysisAgreed());
    }
}
