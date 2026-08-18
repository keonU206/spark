package com.spark.backend.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 불투명 refresh 토큰. 회전 방식 — /auth/refresh 때 기존 레코드를 지우고 새로 발급한다.
 * DB에 있으므로 유출 시 개별 폐기가 가능하다.
 */
@Entity
@Table(name = "refresh_tokens", indexes = @Index(name = "idx_refresh_token", columnList = "token", unique = true))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 128)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder
    private RefreshToken(Long userId, String token, LocalDateTime expiresAt) {
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }
}
