package com.spark.backend.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 소셜 로그인 연동. 가입과 로그인이 같은 요청이라 이 테이블 존재 여부가 계정 생성 판단 기준이다.
 * 식별자는 이메일이 아니라 (provider, providerUserId) — 구글 이메일은 바뀔 수 있다.
 */
@Entity
@Table(name = "social_accounts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "providerUserId"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SocialAccount {

    public enum Provider { GOOGLE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider;

    /** 구글이 주는 sub 값 */
    @Column(nullable = false)
    private String providerUserId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private SocialAccount(User user, Provider provider, String providerUserId) {
        this.user = user;
        this.provider = provider;
        this.providerUserId = providerUserId;
    }

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
