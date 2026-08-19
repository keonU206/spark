package com.spark.backend.group;

import com.spark.backend.common.LabelFormatter;
import com.spark.backend.common.error.ApiException;
import com.spark.backend.group.dto.GroupDtos.FeedCommentResponse;
import com.spark.backend.group.dto.GroupDtos.FeedPostResponse;
import com.spark.backend.group.dto.GroupDtos.FeedReactionResponse;
import com.spark.backend.group.dto.GroupDtos.GroupAttendanceResponse;
import com.spark.backend.group.dto.GroupDtos.GroupDayAttendanceResponse;
import com.spark.backend.group.dto.GroupDtos.GroupDetailResponse;
import com.spark.backend.group.dto.GroupDtos.GroupMemberResponse;
import com.spark.backend.group.dto.GroupDtos.GroupMemberStatusResponse;
import com.spark.backend.group.dto.GroupDtos.GroupStatusResponse;
import com.spark.backend.group.dto.GroupDtos.GroupSummaryResponse;
import com.spark.backend.stats.StatsEngine;
import com.spark.backend.user.User;
import com.spark.backend.user.UserRepository;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GroupService {

    private static final String INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final WorkoutGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final FeedPostRepository feedPostRepository;
    private final UserRepository userRepository;
    private final StatsEngine statsEngine;
    private final NudgeQueryService nudgeQueryService;

    /* ---------------- 모임 목록·생성·참여 ---------------- */

    public List<GroupSummaryResponse> myGroups(Long userId) {
        return memberRepository.findByUserIdOrderByJoinedAtAsc(userId).stream()
                .map(gm -> summarize(gm.getGroup()))
                .toList();
    }

    @Transactional
    public GroupSummaryResponse create(Long userId, String name, String description) {
        WorkoutGroup group = groupRepository.save(WorkoutGroup.builder()
                .name(name)
                .description(description)
                .inviteCode(generateInviteCode())
                .createdBy(userId)
                .build());
        memberRepository.save(GroupMember.builder()
                .group(group).userId(userId).role(GroupMember.Role.OWNER)
                .build());
        return summarize(group);
    }

    @Transactional
    public GroupSummaryResponse join(Long userId, String inviteCode) {
        WorkoutGroup group = groupRepository.findByInviteCode(inviteCode.toUpperCase())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVALID_INVITE_CODE",
                        "초대코드를 다시 확인해주세요."));
        if (memberRepository.existsByGroupIdAndUserId(group.getId(), userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_JOINED", "이미 참여 중인 모임이에요.");
        }
        memberRepository.save(GroupMember.builder()
                .group(group).userId(userId).role(GroupMember.Role.MEMBER)
                .build());
        return summarize(group);
    }

    /* ---------------- 모임 상세(피드) ---------------- */

    public GroupDetailResponse detail(Long userId, Long groupId) {
        WorkoutGroup group = findGroupAsMember(userId, groupId);
        Map<Long, User> users = loadMembers(groupId);

        List<FeedPostResponse> feed = feedPostRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
                .map(post -> toFeedPost(post, userId, users))
                .toList();

        List<GroupMemberResponse> members = users.values().stream()
                .map(this::toMember)
                .toList();

        return new GroupDetailResponse(summarize(group), members, feed);
    }

    /** 응원 토글 — 이미 눌렀으면 취소된다. 본인 글에는 못 누른다 */
    @Transactional
    public void cheer(Long userId, Long groupId, Long postId) {
        findGroupAsMember(userId, groupId);
        FeedPost post = feedPostRepository.findByIdAndGroupId(postId, groupId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND",
                        "글을 찾을 수 없어요."));
        if (post.getAuthorId().equals(userId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "CANNOT_CHEER_OWN_POST",
                    "내 글에는 응원을 보낼 수 없어요.");
        }
        // 컬렉션을 통해 넣고 빼야 같은 트랜잭션 안의 조회와 어긋나지 않는다 (orphanRemoval이 삭제를 처리)
        var existing = post.getReactions().stream()
                .filter(r -> r.getUserId().equals(userId) && FeedReaction.CHEER_EMOJI.equals(r.getEmoji()))
                .findFirst();
        if (existing.isPresent()) {
            post.getReactions().remove(existing.get());
        } else {
            post.getReactions().add(FeedReaction.builder()
                    .post(post).userId(userId).emoji(FeedReaction.CHEER_EMOJI)
                    .build());
        }
    }

    /** 확장 API — 피드 글 작성 */
    @Transactional
    public FeedPostResponse createPost(Long userId, Long groupId, String body, String imageUrl) {
        findGroupAsMember(userId, groupId);
        FeedPost post = feedPostRepository.save(FeedPost.builder()
                .group(groupRepository.getReferenceById(groupId))
                .authorId(userId).body(body).imageUrl(imageUrl)
                .build());
        return toFeedPost(post, userId, loadMembers(groupId));
    }

    /** 확장 API — 댓글 작성 */
    @Transactional
    public void createComment(Long userId, Long groupId, Long postId, String body) {
        findGroupAsMember(userId, groupId);
        FeedPost post = feedPostRepository.findByIdAndGroupId(postId, groupId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "POST_NOT_FOUND",
                        "글을 찾을 수 없어요."));
        post.getComments().add(FeedComment.builder().post(post).userId(userId).body(body).build());
    }

    /* ---------------- 모임 운동 현황 ---------------- */

    public GroupStatusResponse status(Long userId, Long groupId) {
        WorkoutGroup group = findGroupAsMember(userId, groupId);
        Map<Long, User> users = loadMembers(groupId);
        YearMonth month = YearMonth.now();

        // intensity = 그날 운동한 멤버 수 ÷ 전체 멤버 수 (0이면 칠하지 않으므로 내려주지 않는다)
        // 날짜를 누르면 누가 운동했는지 보여줄 수 있게 멤버 이름도 함께 모은다
        Map<Integer, List<String>> dayMembers = new HashMap<>();
        for (User member : users.values()) {
            statsEngine.completedDaysOfMonth(member.getId(), month)
                    .forEach(day -> dayMembers.computeIfAbsent(day, k -> new java.util.ArrayList<>())
                            .add(member.getNickname()));
        }
        int total = Math.max(users.size(), 1);
        List<GroupDayAttendanceResponse> days = dayMembers.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new GroupDayAttendanceResponse(e.getKey(),
                        Math.round(e.getValue().size() * 100.0 / total) / 100.0,
                        List.copyOf(e.getValue())))
                .toList();

        List<GroupMemberStatusResponse> members = users.values().stream()
                .map(u -> new GroupMemberStatusResponse(
                        String.valueOf(u.getId()), u.getNickname(), u.getAvatarUrl(),
                        memberStatusLabel(u.getId()),
                        !u.getId().equals(userId) && nudgeQueryService.canNudgeToday(userId, u.getId())))
                .toList();

        return new GroupStatusResponse(summarize(group),
                new GroupAttendanceResponse(month.toString(), days), members);
    }

    /* ---------------- 내부 도우미 ---------------- */

    public String memberStatusLabel(Long memberId) {
        int streak = statsEngine.streakDays(memberId);
        boolean today = statsEngine.completedDays(memberId, LocalDate.now()).contains(LocalDate.now());
        return LabelFormatter.memberStatusLabel(streak, today);
    }

    private WorkoutGroup findGroupAsMember(Long userId, Long groupId) {
        WorkoutGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND",
                        "모임을 찾을 수 없어요."));
        if (!memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "NOT_GROUP_MEMBER", "참여 중인 모임이 아니에요.");
        }
        return group;
    }

    /** 가입 순서를 유지한 멤버 → User 매핑 */
    private Map<Long, User> loadMembers(Long groupId) {
        List<Long> memberIds = memberRepository.findByGroupIdOrderByJoinedAtAsc(groupId).stream()
                .map(GroupMember::getUserId)
                .toList();
        Map<Long, User> byId = userRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, User> ordered = new LinkedHashMap<>();
        memberIds.forEach(id -> {
            User user = byId.get(id);
            if (user != null && !user.isDeleted()) ordered.put(id, user);
        });
        return ordered;
    }

    public GroupSummaryResponse summarize(WorkoutGroup group) {
        Map<Long, User> users = loadMembers(group.getId());
        List<String> nicknames = users.values().stream().map(User::getNickname).toList();
        var lastActivity = feedPostRepository.findTop1ByGroupIdOrderByCreatedAtDesc(group.getId())
                .map(FeedPost::getCreatedAt)
                .orElse(group.getCreatedAt());
        return new GroupSummaryResponse(
                String.valueOf(group.getId()),
                LabelFormatter.groupTitle(group.getName(), nicknames),
                group.getDescription(),
                group.getCoverUrl(),
                users.size(),
                LabelFormatter.lastActivityLabel(lastActivity),
                group.getInviteCode());
    }

    private FeedPostResponse toFeedPost(FeedPost post, Long viewerId, Map<Long, User> users) {
        Map<String, Long> reactionCounts = post.getReactions().stream()
                .collect(Collectors.groupingBy(FeedReaction::getEmoji, LinkedHashMap::new, Collectors.counting()));
        List<FeedReactionResponse> reactions = reactionCounts.entrySet().stream()
                .map(e -> new FeedReactionResponse(e.getKey(), e.getValue().intValue()))
                .toList();

        List<FeedCommentResponse> comments = post.getComments().stream()
                .map(c -> new FeedCommentResponse(String.valueOf(c.getUserId()),
                        nickname(users, c.getUserId()), c.getBody()))
                .toList();

        return new FeedPostResponse(
                String.valueOf(post.getId()),
                new GroupMemberResponse(String.valueOf(post.getAuthorId()),
                        nickname(users, post.getAuthorId()),
                        users.containsKey(post.getAuthorId()) ? users.get(post.getAuthorId()).getAvatarUrl() : null),
                LabelFormatter.feedCreatedAtLabel(post.getCreatedAt()),
                post.getImageUrl(),
                post.getBody(),
                reactions,
                comments,
                !post.getAuthorId().equals(viewerId));
    }

    private GroupMemberResponse toMember(User user) {
        return new GroupMemberResponse(String.valueOf(user.getId()), user.getNickname(), user.getAvatarUrl());
    }

    private String nickname(Map<Long, User> users, Long userId) {
        User user = users.get(userId);
        if (user != null) return user.getNickname();
        // 탈퇴했거나 모임을 나간 작성자
        return userRepository.findById(userId).map(User::getNickname).orElse("알 수 없음");
    }

    private String generateInviteCode() {
        for (int attempt = 0; attempt < 20; attempt++) {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(INVITE_ALPHABET.charAt(RANDOM.nextInt(INVITE_ALPHABET.length())));
            }
            String code = sb.toString();
            if (!groupRepository.existsByInviteCode(code)) return code;
        }
        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                "초대코드 생성에 실패했어요. 다시 시도해주세요.");
    }
}
