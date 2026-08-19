package com.spark.backend.group;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 독려(재촉하기/잡도리/깨우기 — UI 라벨은 다르지만 데이터는 하나) */
@Entity
@Table(name = "nudges", indexes = @Index(name = "idx_nudge_from_to_created", columnList = "fromUserId, toUserId, createdAt"))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Nudge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long fromUserId;

    @Column(nullable = false)
    private Long toUserId;

    /** 모임 화면에서 보냈으면 채운다 */
    private Long groupId;

    /** 받은 사람이 홈 배너에서 확인한 시각 — null이면 아직 안 본 것 */
    private LocalDateTime seenAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private Nudge(Long fromUserId, Long toUserId, Long groupId) {
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.groupId = groupId;
    }

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public void markSeen() {
        if (this.seenAt == null) {
            this.seenAt = LocalDateTime.now();
        }
    }
}
