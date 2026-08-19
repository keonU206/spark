package com.spark.backend.group;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "feed_posts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FeedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id")
    private WorkoutGroup group;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false, length = 2000)
    private String body;

    private String imageUrl;

    /** 운동 완료 공유로 만들어진 글이면 세션 id — 같은 세션의 중복 공유를 막는 기준 */
    private Long sessionId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeedReaction> reactions = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<FeedComment> comments = new ArrayList<>();

    @Builder
    private FeedPost(WorkoutGroup group, Long authorId, String body, String imageUrl, Long sessionId) {
        this.group = group;
        this.authorId = authorId;
        this.body = body;
        this.imageUrl = imageUrl;
        this.sessionId = sessionId;
    }

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
