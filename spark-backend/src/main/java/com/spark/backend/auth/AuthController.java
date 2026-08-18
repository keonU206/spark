package com.spark.backend.auth;

import com.spark.backend.auth.dto.AuthDtos.AuthSessionResponse;
import com.spark.backend.auth.dto.AuthDtos.EmailLoginRequest;
import com.spark.backend.auth.dto.AuthDtos.EmailSignupRequest;
import com.spark.backend.auth.dto.AuthDtos.RefreshRequest;
import com.spark.backend.auth.dto.AuthDtos.SocialLoginRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup/email")
    public AuthSessionResponse signupEmail(@Valid @RequestBody EmailSignupRequest request) {
        return authService.signupEmail(request.email(), request.password(), request.name());
    }

    @PostMapping("/login/email")
    public AuthSessionResponse loginEmail(@Valid @RequestBody EmailLoginRequest request) {
        return authService.loginEmail(request.email(), request.password());
    }

    @PostMapping("/login/social")
    public AuthSessionResponse loginSocial(@Valid @RequestBody SocialLoginRequest request) {
        return authService.loginSocial(request.provider(), request.idToken());
    }

    @PostMapping("/refresh")
    public AuthSessionResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }
}
