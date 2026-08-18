package com.spark.backend.badge;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 사용자별 배지 진행도. earnedAt이 있으면 획득 — 한 번 획득하면 되돌리지 않는다 */
@Entity
@Table(name = "user_badges",
        uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "badge_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "badge_id")
    private Badge badge;

    @Column(nullable = false)
    private int progress;

    private LocalDateTime earnedAt;

    @Builder
    private UserBadge(Long userId, Badge badge) {
        this.userId = userId;
        this.badge = badge;
        this.progress = 0;
    }

    /** 진행도는 뒤로 가지 않는다. 조건을 채우면 획득 처리한다 */
    public void updateProgress(int computed) {
        this.progress = Math.max(this.progress, computed);
        if (earnedAt == null && this.progress >= badge.getConditionValue()) {
            this.earnedAt = LocalDateTime.now();
        }
    }

    public boolean isEarned() {
        return earnedAt != null;
    }
}
