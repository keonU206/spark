package com.spark.backend.group;

import com.spark.backend.common.error.ApiException;
import com.spark.backend.group.dto.GroupDtos.CreateCommentRequest;
import com.spark.backend.group.dto.GroupDtos.CreateFeedPostRequest;
import com.spark.backend.group.dto.GroupDtos.CreateGroupRequest;
import com.spark.backend.group.dto.GroupDtos.FeedPostResponse;
import com.spark.backend.group.dto.GroupDtos.FriendActivityResponse;
import com.spark.backend.group.dto.GroupDtos.GroupDetailResponse;
import com.spark.backend.group.dto.GroupDtos.GroupStatusResponse;
import com.spark.backend.group.dto.GroupDtos.GroupSummaryResponse;
import com.spark.backend.group.dto.GroupDtos.JoinGroupRequest;
import com.spark.backend.group.dto.GroupDtos.NudgeRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final FriendService friendService;

    /* ---------------- 친구 · 넛지 ---------------- */

    @GetMapping("/friends/activities")
    public List<FriendActivityResponse> friendActivities(@AuthenticationPrincipal Long userId) {
        return friendService.activities(userId);
    }

    @PostMapping("/nudges")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void nudge(@AuthenticationPrincipal Long userId, @Valid @RequestBody NudgeRequest request) {
        friendService.nudge(userId, request.targetUserId(), request.groupId());
    }

    /* ---------------- 모임 ---------------- */

    @GetMapping("/groups/mine")
    public List<GroupSummaryResponse> myGroups(@AuthenticationPrincipal Long userId) {
        return groupService.myGroups(userId);
    }

    @PostMapping("/groups")
    public GroupSummaryResponse create(@AuthenticationPrincipal Long userId,
                                       @Valid @RequestBody CreateGroupRequest request) {
        return groupService.create(userId, request.name(), request.description());
    }

    @PostMapping("/groups/join")
    public GroupSummaryResponse join(@AuthenticationPrincipal Long userId,
                                     @Valid @RequestBody JoinGroupRequest request) {
        return groupService.join(userId, request.inviteCode());
    }

    @GetMapping("/groups/{id}")
    public GroupDetailResponse detail(@AuthenticationPrincipal Long userId, @PathVariable String id) {
        return groupService.detail(userId, parseGroupId(id));
    }

    @GetMapping("/groups/{id}/status")
    public GroupStatusResponse status(@AuthenticationPrincipal Long userId, @PathVariable String id) {
        return groupService.status(userId, parseGroupId(id));
    }

    @PostMapping("/groups/{groupId}/feed/{postId}/cheer")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cheer(@AuthenticationPrincipal Long userId,
                      @PathVariable String groupId, @PathVariable String postId) {
        groupService.cheer(userId, parseGroupId(groupId),
                parseId(postId, "POST_NOT_FOUND", "글을 찾을 수 없어요."));
    }

    /* ---------------- 확장: 피드 작성·댓글 (계약서 §9-8) ---------------- */

    @PostMapping("/groups/{id}/feed")
    public FeedPostResponse createPost(@AuthenticationPrincipal Long userId, @PathVariable String id,
                                       @Valid @RequestBody CreateFeedPostRequest request) {
        return groupService.createPost(userId, parseGroupId(id), request.body(), request.imageUrl());
    }

    @PostMapping("/groups/{groupId}/feed/{postId}/comments")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void createComment(@AuthenticationPrincipal Long userId,
                              @PathVariable String groupId, @PathVariable String postId,
                              @Valid @RequestBody CreateCommentRequest request) {
        groupService.createComment(userId, parseGroupId(groupId),
                parseId(postId, "POST_NOT_FOUND", "글을 찾을 수 없어요."), request.body());
    }

    private Long parseGroupId(String raw) {
        return parseId(raw, "GROUP_NOT_FOUND", "모임을 찾을 수 없어요.");
    }

    private Long parseId(String raw, String code, String message) {
        try {
            return Long.parseLong(raw);
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, code, message);
        }
    }
}
