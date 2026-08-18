package com.spark.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 인증 요청/응답 — docs/api-contract.md §2, spark-frontend/src/services/api/auth.ts 와 1:1 */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record EmailSignupRequest(
            @NotBlank(message = "이메일을 입력해주세요.")
            @Email(message = "이메일 형식이 올바르지 않아요.")
            String email,
            @NotBlank(message = "비밀번호를 입력해주세요.")
            @Size(min = 8, message = "비밀번호는 8자 이상이어야 해요.")
            String password,
            @NotBlank(message = "이름을 입력해주세요.")
            @Size(max = 20, message = "이름은 20자 이하로 입력해주세요.")
            String name
    ) {
    }

    public record EmailLoginRequest(
            @NotBlank(message = "이메일을 입력해주세요.") String email,
            @NotBlank(message = "비밀번호를 입력해주세요.") String password
    ) {
    }

    public record SocialLoginRequest(
            @NotBlank(message = "소셜 제공자가 비어 있어요.") String provider,
            @NotBlank(message = "인증 토큰이 비어 있어요.") String idToken
    ) {
    }

    public record RefreshRequest(
            @NotBlank(message = "refreshToken이 비어 있어요.") String refreshToken
    ) {
    }

    /** AuthSession — 프론트가 기대하는 공통 응답 */
    public record AuthSessionResponse(
            String accessToken,
            String refreshToken,
            boolean surveyCompleted,
            boolean isNewUser
    ) {
    }
}
