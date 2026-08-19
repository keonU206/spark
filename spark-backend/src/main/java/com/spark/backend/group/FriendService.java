package com.spark.backend.group;

import com.spark.backend.common.error.ApiException;
import com.spark.backend.group.dto.GroupDtos.FriendActivityResponse;
import com.spark.backend.user.User;
import com.spark.backend.user.UserRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 친구 = 내가 속한 모든 모임의 멤버 합집합 (별도 친구 테이블 없음 — docs/erd.md §5) */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FriendService {

    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final GroupService groupService;
    private final NudgeQueryService nudgeQueryService;
    private final NudgeRepository nudgeRepository;

    /** 나를 맨 앞에 두고, 친구들을 이어 붙인다 */
    public List<FriendActivityResponse> activities(Long userId) {
        User me = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "로그인이 필요해요."));

        List<FriendActivityResponse> result = new ArrayList<>();
        result.add(toActivity(me, userId));

        List<Long> friendIds = memberRepository.findFriendUserIds(userId);
        userRepository.findAllById(friendIds).stream()
                .filter(u -> !u.isDeleted())
                .sorted(java.util.Comparator.comparing(User::getNickname))
                .forEach(friend -> result.add(toActivity(friend, userId)));
        return result;
    }

    /** POST /nudges — 같은 모임 멤버에게만, 같은 대상에게 하루 1회 */
    @Transactional
    public void nudge(Long userId, String targetUserIdRaw, String groupIdRaw) {
        Long targetUserId = parseLong(targetUserIdRaw, "USER_NOT_FOUND", "친구를 찾을 수 없어요.");
        if (targetUserId.equals(userId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CANNOT_NUDGE_SELF", "나에게는 보낼 수 없어요.");
        }
        if (!memberRepository.findFriendUserIds(userId).contains(targetUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_GROUP_MATE",
                    "같은 모임의 멤버에게만 보낼 수 있어요.");
        }
        if (!nudgeQueryService.canNudgeToday(userId, targetUserId)) {
            throw new ApiException(HttpStatus.CONFLICT, "NUDGE_COOLDOWN",
                    "오늘은 이미 재촉했어요. 내일 다시 보내주세요!");
        }
        Long groupId = groupIdRaw == null || groupIdRaw.isBlank() ? null
                : parseLong(groupIdRaw, "GROUP_NOT_FOUND", "모임을 찾을 수 없어요.");
        nudgeRepository.save(Nudge.builder()
                .fromUserId(userId).toUserId(targetUserId).groupId(groupId)
                .build());
    }

    /** 아직 확인 안 한 받은 재촉 — 홈 배너용. 문구는 서버가 만든다 (표기 규약) */
    public List<com.spark.backend.group.dto.GroupDtos.ReceivedNudgeResponse> receivedNudges(Long userId) {
        return nudgeRepository.findByToUserIdAndSeenAtIsNullOrderByCreatedAtDesc(userId).stream()
                .map(n -> {
                    String sender = userRepository.findById(n.getFromUserId())
                            .map(User::getNickname).orElse("친구");
                    return new com.spark.backend.group.dto.GroupDtos.ReceivedNudgeResponse(
                            String.valueOf(n.getId()),
                            sender + "님이 재촉했어요! 오늘도 운동해볼까요? 🔥",
                            n.getGroupId() != null ? String.valueOf(n.getGroupId()) : null);
                })
                .toList();
    }

    /** 배너를 닫거나 알림함을 열면 전부 확인 처리한다 */
    @Transactional
    public void acknowledgeNudges(Long userId) {
        nudgeRepository.findByToUserIdAndSeenAtIsNullOrderByCreatedAtDesc(userId)
                .forEach(Nudge::markSeen);
    }

    /** 알림함 — 받은 재촉 이력 (최근 50개, 확인 여부 포함) */
    public List<com.spark.backend.group.dto.GroupDtos.NudgeInboxItemResponse> nudgeInbox(Long userId) {
        return nudgeRepository.findTop50ByToUserIdOrderByCreatedAtDesc(userId).stream()
                .map(n -> {
                    String sender = userRepository.findById(n.getFromUserId())
                            .map(User::getNickname).orElse("친구");
                    return new com.spark.backend.group.dto.GroupDtos.NudgeInboxItemResponse(
                            String.valueOf(n.getId()),
                            sender + "님이 재촉했어요! 오늘도 운동해볼까요? 🔥",
                            com.spark.backend.common.LabelFormatter.whenLabel(n.getCreatedAt().toLocalDate()),
                            n.getSeenAt() != null);
                })
                .toList();
    }

    private FriendActivityResponse toActivity(User user, Long viewerId) {
        boolean isMe = user.getId().equals(viewerId);
        return new FriendActivityResponse(
                String.valueOf(user.getId()),
                user.getNickname(),
                user.getAvatarUrl(),
                groupService.memberStatusLabel(user.getId()),
                isMe,
                groupService.canNudge(viewerId, user.getId()));
    }

    private Long parseLong(String raw, String code, String message) {
        try {
            return Long.parseLong(raw);
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, code, message);
        }
    }
}
