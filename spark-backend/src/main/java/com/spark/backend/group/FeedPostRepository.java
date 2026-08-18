package com.spark.backend.group;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedPostRepository extends JpaRepository<FeedPost, Long> {

    List<FeedPost> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    Optional<FeedPost> findTop1ByGroupIdOrderByCreatedAtDesc(Long groupId);

    Optional<FeedPost> findByIdAndGroupId(Long id, Long groupId);
}
