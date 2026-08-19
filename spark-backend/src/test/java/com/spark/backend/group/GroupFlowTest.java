package com.spark.backend.group;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** 모임 생성→초대→피드→응원→넛지 전체 흐름 — docs/api-contract.md §7 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class GroupFlowTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    String ownerToken;
    String friendToken;
    String friendUserId;

    @BeforeEach
    void setUp() throws Exception {
        ownerToken = signup("owner@spark.app", "모임장");
        friendToken = signup("friend@spark.app", "친구");
        friendUserId = subOf(friendToken);
    }

    private String signup(String email, String name) throws Exception {
        String body = mockMvc.perform(post("/auth/signup/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"" + email + "\", \"password\": \"password1234\", \"name\": \"" + name + "\" }"))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("accessToken").asString();
    }

    private String subOf(String token) throws Exception {
        String payload = new String(java.util.Base64.getUrlDecoder().decode(token.split("\\.")[1]));
        return objectMapper.readTree(payload).get("sub").asString();
    }

    private JsonNode postJson(String token, String url, String body) throws Exception {
        var builder = post(url).header("Authorization", "Bearer " + token);
        if (body != null) builder = builder.contentType(MediaType.APPLICATION_JSON).content(body);
        String response = mockMvc.perform(builder).andReturn().getResponse().getContentAsString();
        return response.isEmpty() ? null : objectMapper.readTree(response);
    }

    /** 모임을 만들고 초대코드로 친구를 들인다 */
    private String createGroupAndInviteFriend() throws Exception {
        JsonNode group = postJson(ownerToken, "/groups", "{ \"name\": \"거북목 탈출단\" }");
        String groupId = group.get("id").asString();

        String inviteCode = groupRepository.findById(Long.parseLong(groupId)).orElseThrow().getInviteCode();
        mockMvc.perform(post("/groups/join").header("Authorization", "Bearer " + friendToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"inviteCode\": \"" + inviteCode + "\" }"))
                .andExpect(status().isOk());
        return groupId;
    }

    @Autowired
    WorkoutGroupRepository groupRepository;

    @Test
    void 모임_생성_응답은_GroupSummary_형태다() throws Exception {
        mockMvc.perform(post("/groups").header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"name\": \"거북목 탈출단\" }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("거북목 탈출단"))
                .andExpect(jsonPath("$.memberCount").value(1))
                .andExpect(jsonPath("$.lastActivityLabel").value("오늘"));
    }

    @Test
    void 잘못된_초대코드는_404_이미_참여는_409() throws Exception {
        String groupId = createGroupAndInviteFriend();
        String inviteCode = groupRepository.findById(Long.parseLong(groupId)).orElseThrow().getInviteCode();

        mockMvc.perform(post("/groups/join").header("Authorization", "Bearer " + friendToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"inviteCode\": \"" + inviteCode + "\" }"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ALREADY_JOINED"));

        mockMvc.perform(post("/groups/join").header("Authorization", "Bearer " + friendToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"inviteCode\": \"WRONG123\" }"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("INVALID_INVITE_CODE"));
    }

    @Test
    void 피드_작성과_응원_토글_본인_글_응원_금지() throws Exception {
        String groupId = createGroupAndInviteFriend();

        JsonNode 글 = postJson(ownerToken, "/groups/" + groupId + "/feed",
                "{ \"body\": \"오늘 스쿼트 20개 3세트 완료!\" }");
        String postId = 글.get("id").asString();

        // 본인 글에는 응원 불가
        mockMvc.perform(post("/groups/" + groupId + "/feed/" + postId + "/cheer")
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("CANNOT_CHEER_OWN_POST"));

        // 친구가 응원 → 카운트 1
        mockMvc.perform(post("/groups/" + groupId + "/feed/" + postId + "/cheer")
                        .header("Authorization", "Bearer " + friendToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/groups/" + groupId).header("Authorization", "Bearer " + friendToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.feed[0].reactions[0].emoji").value("🩷"))
                .andExpect(jsonPath("$.feed[0].reactions[0].count").value(1))
                .andExpect(jsonPath("$.feed[0].canCheer").value(true));

        // 다시 누르면 취소(토글)
        mockMvc.perform(post("/groups/" + groupId + "/feed/" + postId + "/cheer")
                        .header("Authorization", "Bearer " + friendToken))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/groups/" + groupId).header("Authorization", "Bearer " + friendToken))
                .andExpect(jsonPath("$.feed[0].reactions.length()").value(0));
    }

    @Test
    void 같은_운동은_같은_모임에_한_번만_공유된다() throws Exception {
        String groupId = createGroupAndInviteFriend();
        String sessionId = postJson(ownerToken, "/sessions", "{ \"routineId\": \"routine-1\" }")
                .get("sessionId").asString();
        postJson(ownerToken, "/sessions/" + sessionId + "/complete", null);

        String shareBody = "{ \"body\": \"오운완\", \"sessionId\": \"" + sessionId + "\" }";
        mockMvc.perform(post("/groups/" + groupId + "/feed")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(shareBody))
                .andExpect(status().isOk());

        mockMvc.perform(post("/groups/" + groupId + "/feed")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON).content(shareBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ALREADY_SHARED"));
    }

    @Test
    void 댓글_작성이_상세에_보인다() throws Exception {
        String groupId = createGroupAndInviteFriend();
        String postId = postJson(ownerToken, "/groups/" + groupId + "/feed",
                "{ \"body\": \"오운완\" }").get("id").asString();

        mockMvc.perform(post("/groups/" + groupId + "/feed/" + postId + "/comments")
                        .header("Authorization", "Bearer " + friendToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"body\": \"다음에 같이 운동하자\" }"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/groups/" + groupId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(jsonPath("$.feed[0].comments[0].nickname").value("친구"))
                .andExpect(jsonPath("$.feed[0].comments[0].body").value("다음에 같이 운동하자"))
                .andExpect(jsonPath("$.feed[0].comments[0].isMine").value(false));

        // 같은 사람이 또 보내면 새로 달리지 않고 내용이 수정된다 (1인 1응원)
        mockMvc.perform(post("/groups/" + groupId + "/feed/" + postId + "/comments")
                        .header("Authorization", "Bearer " + friendToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"body\": \"대단해!\" }"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/groups/" + groupId).header("Authorization", "Bearer " + friendToken))
                .andExpect(jsonPath("$.feed[0].comments.length()").value(1))
                .andExpect(jsonPath("$.feed[0].comments[0].body").value("대단해!"))
                .andExpect(jsonPath("$.feed[0].comments[0].isMine").value(true));
    }

    @Test
    void 내_글은_삭제되고_남의_글은_403() throws Exception {
        String groupId = createGroupAndInviteFriend();
        String postId = postJson(ownerToken, "/groups/" + groupId + "/feed",
                "{ \"body\": \"지울 글\" }").get("id").asString();

        // 남의 글 삭제 시도 → 403
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .delete("/groups/" + groupId + "/feed/" + postId)
                        .header("Authorization", "Bearer " + friendToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("NOT_POST_AUTHOR"));

        // 본인 삭제 → 204, 상세에서 사라짐
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .delete("/groups/" + groupId + "/feed/" + postId)
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/groups/" + groupId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(jsonPath("$.feed.length()").value(0));
    }

    @Test
    void 멤버가_아니면_모임_조회_403() throws Exception {
        String groupId = postJson(ownerToken, "/groups", "{ \"name\": \"비공개\" }").get("id").asString();
        String outsiderToken = signup("outsider@spark.app", "외부인");

        mockMvc.perform(get("/groups/" + groupId).header("Authorization", "Bearer " + outsiderToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("NOT_GROUP_MEMBER"));
    }

    @Test
    void 친구_현황은_나를_맨_앞에_두고_넛지는_쿨다운이_있다() throws Exception {
        createGroupAndInviteFriend();

        mockMvc.perform(get("/friends/activities").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].isMe").value(true))
                .andExpect(jsonPath("$[0].canNudge").value(false))
                .andExpect(jsonPath("$[1].nickname").value("친구"))
                .andExpect(jsonPath("$[1].statusLabel").value("최신 운동 기록이 없어요 .."))
                .andExpect(jsonPath("$[1].canNudge").value(true));

        // 넛지 1회 성공
        mockMvc.perform(post("/nudges").header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"targetUserId\": \"" + friendUserId + "\" }"))
                .andExpect(status().isNoContent());

        // 같은 날 재시도 → 쿨다운
        mockMvc.perform(post("/nudges").header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"targetUserId\": \"" + friendUserId + "\" }"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("NUDGE_COOLDOWN"));

        // 쿨다운이 canNudge에도 반영된다
        mockMvc.perform(get("/friends/activities").header("Authorization", "Bearer " + ownerToken))
                .andExpect(jsonPath("$[1].canNudge").value(false));
    }

    @Test
    void 받은_재촉은_배너로_보이고_닫으면_사라진다() throws Exception {
        createGroupAndInviteFriend();
        postJson(ownerToken, "/nudges", "{ \"targetUserId\": \"" + friendUserId + "\" }");

        mockMvc.perform(get("/nudges/received").header("Authorization", "Bearer " + friendToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].message").value("모임장님이 재촉했어요! 오늘도 운동해볼까요? 🔥"));

        // 보낸 사람 쪽에는 아무것도 없다
        mockMvc.perform(get("/nudges/received").header("Authorization", "Bearer " + ownerToken))
                .andExpect(jsonPath("$.length()").value(0));

        // 배너를 닫으면 확인 처리되어 다시 안 보인다
        mockMvc.perform(post("/nudges/received/ack").header("Authorization", "Bearer " + friendToken))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/nudges/received").header("Authorization", "Bearer " + friendToken))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void 모임_밖의_사람에게는_넛지를_보낼_수_없다() throws Exception {
        String outsiderToken = signup("stranger@spark.app", "낯선이");
        String outsiderId = subOf(outsiderToken);
        createGroupAndInviteFriend();

        mockMvc.perform(post("/nudges").header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"targetUserId\": \"" + outsiderId + "\" }"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("NOT_GROUP_MATE"));
    }

    @Test
    void 모임_현황은_멤버_상태와_출석_캘린더를_담는다() throws Exception {
        String groupId = createGroupAndInviteFriend();

        // 모임장이 오늘 운동 완료
        String sessionId = postJson(ownerToken, "/sessions", "{ \"routineId\": \"routine-1\" }")
                .get("sessionId").asString();
        postJson(ownerToken, "/sessions/" + sessionId + "/complete", null);

        mockMvc.perform(get("/groups/" + groupId + "/status").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary.memberCount").value(2))
                .andExpect(jsonPath("$.attendance.days[0].intensity").value(0.5))
                .andExpect(jsonPath("$.members[0].statusLabel").value("1일째 운동 완료 ✅"))
                .andExpect(jsonPath("$.members[1].statusLabel").value("최신 운동 기록이 없어요 .."));
    }
}
