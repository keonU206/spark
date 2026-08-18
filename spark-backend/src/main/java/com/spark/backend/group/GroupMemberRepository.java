package com.spark.backend.group;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    List<GroupMember> findByUserIdOrderByJoinedAtAsc(Long userId);

    List<GroupMember> findByGroupIdOrderByJoinedAtAsc(Long groupId);

    boolean existsByGroupIdAndUserId(Long groupId, Long userId);

    long countByGroupId(Long groupId);

    long countByUserId(Long userId);

    /** 친구 = 내가 속한 모든 모임의 멤버 합집합 (나 제외) — docs/erd.md §5 */
    @Query("""
            select distinct gm.userId from GroupMember gm
            where gm.group.id in (select mine.group.id from GroupMember mine where mine.userId = :userId)
              and gm.userId <> :userId""")
    List<Long> findFriendUserIds(@Param("userId") Long userId);
}
