package com.spark.backend.group;

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

/** 모임. GROUP은 SQL 예약어라 테이블명을 workout_groups로 쓴다 */
@Entity
@Table(name = "workout_groups")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkoutGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** null·빈 값이면 카드 제목은 멤버 이름 나열로 대체된다 */
    private String name;

    @Column(nullable = false)
    private String description;

    private String coverUrl;

    /** 8자리 고정 — POST /groups/join 의 통로 */
    @Column(nullable = false, unique = true, length = 8)
    private String inviteCode;

    @Column(nullable = false)
    private Long createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    private WorkoutGroup(String name, String description, String coverUrl, String inviteCode, Long createdBy) {
        this.name = name;
        this.description = description != null ? description : "";
        this.coverUrl = coverUrl;
        this.inviteCode = inviteCode;
        this.createdBy = createdBy;
    }

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
