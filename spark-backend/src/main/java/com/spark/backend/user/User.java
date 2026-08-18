package com.spark.backend.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 소셜 전용 계정은 이메일이 없을 수 있다 */
    @Column(unique = true)
    private String email;

    /** 소셜 전용 계정은 비밀번호가 없다 */
    private String passwordHash;

    @Column(nullable = false)
    private String nickname;

    @Column(nullable = false)
    private String statusMessage;

    private String avatarUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** DELETE /me — 소프트 삭제 */
    private LocalDateTime deletedAt;

    @Builder
    private User(String email, String passwordHash, String nickname, String statusMessage, String avatarUrl) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
        this.statusMessage = statusMessage != null ? statusMessage : "오늘도 건강하게 운동 중 🔥";
        this.avatarUrl = avatarUrl;
    }

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void updateProfile(String nickname, String avatarUrl) {
        if (nickname != null) this.nickname = nickname;
        if (avatarUrl != null) this.avatarUrl = avatarUrl;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
