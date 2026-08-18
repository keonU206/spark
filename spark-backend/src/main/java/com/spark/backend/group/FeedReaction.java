package com.spark.backend.group;

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
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 화면은 이모지별 개수만 보여준다. 같은 사람이 같은 이모지를 중복으로 못 누르게 막는다 */
@Entity
@Table(name = "feed_reactions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "userId", "emoji"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FeedReaction {

    /** POST /groups/{g}/feed/{p}/cheer 가 남기는 이모지 */
    public static final String CHEER_EMOJI = "🩷";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private FeedPost post;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 16)
    private String emoji;

    @Builder
    private FeedReaction(FeedPost post, Long userId, String emoji) {
        this.post = post;
        this.userId = userId;
        this.emoji = emoji;
    }
}
