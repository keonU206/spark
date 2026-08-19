package com.spark.backend.group.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/** 모임·친구·넛지 요청/응답 — docs/api-contract.md §7, types/api.ts 와 1:1 */
public final class GroupDtos {

    private GroupDtos() {
    }

    public record CreateGroupRequest(
            @NotBlank(message = "모임 이름을 입력해주세요.")
            @Size(max = 20, message = "모임 이름은 20자 이하로 입력해주세요.")
            String name,
            @Size(max = 100, message = "모임 소개는 100자 이하로 입력해주세요.")
            String description
    ) {
    }

    public record JoinGroupRequest(
            @NotBlank(message = "초대코드를 입력해주세요.")
            @Pattern(regexp = "[A-Za-z0-9]{8}", message = "초대코드는 8자리 영문·숫자예요.")
            String inviteCode
    ) {
    }

    public record NudgeRequest(
            @NotBlank(message = "독려할 친구를 선택해주세요.") String targetUserId,
            String groupId
    ) {
    }

    /** 확장 — 계약서 §9-8에서 미정의였던 피드 작성 */
    public record CreateFeedPostRequest(
            @NotBlank(message = "내용을 입력해주세요.")
            @Size(max = 2000, message = "글은 2000자 이하로 입력해주세요.")
            String body,
            String imageUrl,
            /** 운동 완료 공유면 세션 id — 같은 세션의 중복 공유를 막는다 */
            String sessionId
    ) {
    }

    /** 확장 — 계약서 §9-8에서 미정의였던 댓글 작성 */
    public record CreateCommentRequest(
            @NotBlank(message = "댓글을 입력해주세요.")
            @Size(max = 1000, message = "댓글은 1000자 이하로 입력해주세요.")
            String body
    ) {
    }

    public record GroupSummaryResponse(
            String id,
            String title,
            String description,
            String coverUrl,
            int memberCount,
            String lastActivityLabel,
            /** 계약서에는 없는 추가 필드 — 모임장이 코드를 공유할 UI가 생기면 쓴다 */
            String inviteCode
    ) {
    }

    public record GroupMemberResponse(String userId, String nickname, String avatarUrl) {
    }

    public record FeedReactionResponse(String emoji, int count) {
    }

    public record FeedCommentResponse(
            String id,
            String userId,
            String nickname,
            String body,
            /** 내가 남긴 응원이면 true — 버튼이 "응원 수정"으로 바뀐다 */
            boolean isMine
    ) {
    }

    public record FeedPostResponse(
            String id,
            GroupMemberResponse author,
            String createdAtLabel,
            String imageUrl,
            String body,
            List<FeedReactionResponse> reactions,
            List<FeedCommentResponse> comments,
            boolean canCheer
    ) {
    }

    public record GroupDetailResponse(
            GroupSummaryResponse summary,
            List<GroupMemberResponse> members,
            List<FeedPostResponse> feed
    ) {
    }

    public record GroupDayAttendanceResponse(
            int day,
            double intensity,
            /** 그날 운동한 멤버 닉네임 — 캘린더 날짜를 누르면 보여준다 */
            List<String> members
    ) {
    }

    public record GroupAttendanceResponse(String month, List<GroupDayAttendanceResponse> days) {
    }

    public record GroupMemberStatusResponse(
            String userId,
            String nickname,
            String avatarUrl,
            String statusLabel,
            boolean canNudge
    ) {
    }

    public record GroupStatusResponse(
            GroupSummaryResponse summary,
            GroupAttendanceResponse attendance,
            List<GroupMemberStatusResponse> members
    ) {
    }

    /** 받은 재촉 — 홈 배너에 그대로 표시된다 */
    public record ReceivedNudgeResponse(
            String id,
            String message,
            String groupId
    ) {
    }

    /** 알림함 항목 — 받은 재촉 이력 */
    public record NudgeInboxItemResponse(
            String id,
            String message,
            /** "오늘" / "어제" / "3일 전" */
            String whenLabel,
            /** 아직 확인 전이면 false — 목록에서 강조 표시 */
            boolean seen
    ) {
    }

    public record FriendActivityResponse(
            String userId,
            String nickname,
            String avatarUrl,
            String statusLabel,
            boolean isMe,
            boolean canNudge
    ) {
    }
}
