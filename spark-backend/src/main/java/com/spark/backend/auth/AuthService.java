package com.spark.backend.auth;

import com.spark.backend.auth.dto.AuthDtos.AuthSessionResponse;
import com.spark.backend.common.error.ApiException;
import com.spark.backend.survey.SurveyResponseRepository;
import com.spark.backend.user.SocialAccount;
import com.spark.backend.user.SocialAccountRepository;
import com.spark.backend.user.User;
import com.spark.backend.user.UserRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final SocialAccountRepository socialAccountRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final SurveyResponseRepository surveyResponseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtProperties jwtProperties;

    @Transactional
    public AuthSessionResponse signupEmail(String email, String password, String name) {
        if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "이미 가입된 이메일이에요.");
        }
        User user = userRepository.save(User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .nickname(name)
                .build());
        return issueSession(user, true);
    }

    @Transactional
    public AuthSessionResponse loginEmail(String email, String password) {
        // 로그인 실패는 401이 아니라 400 — 프론트가 401 message를 "로그인이 필요해요."로 치환하기 때문
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .filter(u -> u.getPasswordHash() != null && passwordEncoder.matches(password, u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CREDENTIALS",
                        "이메일 또는 비밀번호가 올바르지 않아요."));
        return issueSession(user, false);
    }

    /** 소셜은 가입과 로그인이 같은 요청 — 계정이 없으면 만든다 */
    @Transactional
    public AuthSessionResponse loginSocial(String provider, String idToken) {
        if (!"google".equals(provider)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "UNSUPPORTED_PROVIDER", "지원하지 않는 로그인 방식이에요.");
        }
        GoogleTokenVerifier.GoogleUser googleUser = googleTokenVerifier.verify(idToken);

        return socialAccountRepository
                .findByProviderAndProviderUserId(SocialAccount.Provider.GOOGLE, googleUser.providerUserId())
                .map(account -> issueSession(account.getUser(), false))
                .orElseGet(() -> {
                    String nickname = googleUser.name() != null ? googleUser.name()
                            : googleUser.email() != null ? googleUser.email().split("@")[0] : "스파크 회원";
                    User user = userRepository.save(User.builder()
                            .email(googleUser.email())
                            .nickname(nickname)
                            .build());
                    socialAccountRepository.save(SocialAccount.builder()
                            .user(user)
                            .provider(SocialAccount.Provider.GOOGLE)
                            .providerUserId(googleUser.providerUserId())
                            .build());
                    return issueSession(user, true);
                });
    }

    /** 회전 방식 — 쓴 토큰은 폐기하고 새 쌍을 발급한다 */
    @Transactional
    public AuthSessionResponse refresh(String refreshTokenValue) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(this::invalidRefreshToken);
        if (stored.isExpired()) {
            refreshTokenRepository.delete(stored);
            throw invalidRefreshToken();
        }
        User user = userRepository.findById(stored.getUserId())
                .filter(u -> !u.isDeleted())
                .orElseThrow(this::invalidRefreshToken);
        refreshTokenRepository.delete(stored);
        return issueSession(user, false);
    }

    private ApiException invalidRefreshToken() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "로그인이 필요해요.");
    }

    private AuthSessionResponse issueSession(User user, boolean isNewUser) {
        String accessToken = tokenProvider.createAccessToken(user.getId());

        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        String refreshValue = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        refreshTokenRepository.save(RefreshToken.builder()
                .userId(user.getId())
                .token(refreshValue)
                .expiresAt(LocalDateTime.now().plusDays(jwtProperties.refreshTokenDays()))
                .build());

        boolean surveyCompleted = surveyResponseRepository.existsByUserId(user.getId());
        return new AuthSessionResponse(accessToken, refreshValue, surveyCompleted, isNewUser);
    }
}
