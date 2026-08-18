package com.spark.backend.me;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** 마이페이지·설정·탈퇴·업로드 — docs/api-contract.md §8 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class MeFlowTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    String accessToken;
    String refreshToken;

    @BeforeEach
    void setUp() throws Exception {
        String body = mockMvc.perform(post("/auth/signup/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"me@spark.app\", \"password\": \"password1234\", \"name\": \"김홈트\" }"))
                .andReturn().getResponse().getContentAsString();
        var session = objectMapper.readTree(body);
        accessToken = session.get("accessToken").asString();
        refreshToken = session.get("refreshToken").asString();
    }

    @Test
    void 프로필_조회와_수정() throws Exception {
        mockMvc.perform(get("/me").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("김홈트"))
                .andExpect(jsonPath("$.statusMessage").value("오늘도 건강하게 운동 중 🔥"))
                .andExpect(jsonPath("$.streakDays").value(0))
                .andExpect(jsonPath("$.badgeCount").value(0))
                .andExpect(jsonPath("$.joinedGroupCount").value(0));

        mockMvc.perform(patch("/me").header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"nickname\": \"새이름\" }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nickname").value("새이름"));
    }

    @Test
    void 알림_설정은_기본값으로_시작하고_부분_수정된다() throws Exception {
        mockMvc.perform(get("/me/notification-settings").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reminderEnabled").value(true))
                .andExpect(jsonPath("$.reminderTime").value("오전 8:00"));

        mockMvc.perform(patch("/me/notification-settings").header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"reminderEnabled\": false }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reminderEnabled").value(false))
                .andExpect(jsonPath("$.reminderTime").value("오전 8:00"));
    }

    @Test
    void AI_PT_동의_토글() throws Exception {
        mockMvc.perform(get("/me/consents").header("Authorization", "Bearer " + accessToken))
                .andExpect(jsonPath("$.poseAnalysisAgreed").value(false));

        mockMvc.perform(patch("/me/consents").header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"poseAnalysisAgreed\": true }"))
                .andExpect(jsonPath("$.poseAnalysisAgreed").value(true));
    }

    @Test
    void 탈퇴하면_로그인과_refresh가_모두_막힌다() throws Exception {
        mockMvc.perform(delete("/me").header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/auth/login/email").contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"me@spark.app\", \"password\": \"password1234\" }"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"refreshToken\": \"" + refreshToken + "\" }"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 이미지_업로드는_URL을_돌려주고_이미지가_아니면_거절한다() throws Exception {
        var image = new MockMultipartFile("file", "avatar.png", "image/png",
                new byte[]{(byte) 0x89, 'P', 'N', 'G'});
        mockMvc.perform(MockMvcRequestBuilders.multipart("/uploads").file(image)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").isNotEmpty());

        var text = new MockMultipartFile("file", "note.txt", "text/plain", "hi".getBytes());
        mockMvc.perform(MockMvcRequestBuilders.multipart("/uploads").file(text)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("UNSUPPORTED_FILE_TYPE"));
    }
}
