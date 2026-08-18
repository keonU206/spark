package com.spark.backend.auth;

import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** 인증·온보딩 전체 흐름 — docs/api-contract.md §2 규약 그대로 검증한다 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthFlowTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    private static final String SIGNUP_BODY = """
            { "email": "kim@spark.app", "password": "password1234", "name": "김민준" }
            """;

    private JsonNode postJson(String url, String body) throws Exception {
        String response = mockMvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response);
    }

    @Test
    void 이메일_가입은_새_계정과_미완료_설문_상태를_돌려준다() throws Exception {
        mockMvc.perform(post("/auth/signup/email").contentType(MediaType.APPLICATION_JSON).content(SIGNUP_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.isNewUser").value(true))
                .andExpect(jsonPath("$.surveyCompleted").value(false));
    }

    @Test
    void 중복_이메일_가입은_409를_돌려준다() throws Exception {
        postJson("/auth/signup/email", SIGNUP_BODY);
        mockMvc.perform(post("/auth/signup/email").contentType(MediaType.APPLICATION_JSON).content(SIGNUP_BODY))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_EXISTS"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void 잘못된_비밀번호_로그인은_400_INVALID_CREDENTIALS() throws Exception {
        postJson("/auth/signup/email", SIGNUP_BODY);
        mockMvc.perform(post("/auth/login/email").contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"kim@spark.app\", \"password\": \"wrong-password\" }"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
    }

    @Test
    void 로그인은_기존_계정_세션을_돌려준다() throws Exception {
        postJson("/auth/signup/email", SIGNUP_BODY);
        mockMvc.perform(post("/auth/login/email").contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"kim@spark.app\", \"password\": \"password1234\" }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isNewUser").value(false));
    }

    @Test
    void refresh는_새_토큰_쌍을_발급하고_쓴_토큰은_폐기한다() throws Exception {
        String refreshToken = postJson("/auth/signup/email", SIGNUP_BODY).get("refreshToken").asString();
        String refreshBody = "{ \"refreshToken\": \"" + refreshToken + "\" }";

        mockMvc.perform(post("/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").value(not(refreshToken)));

        // 회전: 한 번 쓴 refreshToken은 더 이상 유효하지 않다
        mockMvc.perform(post("/auth/refresh").contentType(MediaType.APPLICATION_JSON).content(refreshBody))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
    }

    @Test
    void 설문은_제출_후_surveyCompleted가_true가_되고_재제출은_409() throws Exception {
        String accessToken = postJson("/auth/signup/email", SIGNUP_BODY).get("accessToken").asString();
        String surveyBody = """
                { "fitnessLevel": "보통", "activityLevel": "주 1~2회",
                  "availableTime": "10~20분", "intensity": "가볍게", "painAreas": ["neckShoulder", "lowerBack"] }
                """;

        mockMvc.perform(post("/onboarding/survey").contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + accessToken).content(surveyBody))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/auth/login/email").contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"kim@spark.app\", \"password\": \"password1234\" }"))
                .andExpect(jsonPath("$.surveyCompleted").value(true));

        mockMvc.perform(post("/onboarding/survey").contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + accessToken).content(surveyBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("SURVEY_ALREADY_SUBMITTED"));
    }

    @Test
    void 통증없음은_다른_부위와_함께_선택할_수_없다() throws Exception {
        String accessToken = postJson("/auth/signup/email", SIGNUP_BODY).get("accessToken").asString();
        mockMvc.perform(post("/onboarding/survey").contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + accessToken)
                        .content("""
                                { "fitnessLevel": "보통", "activityLevel": "주 1~2회",
                                  "availableTime": "10~20분", "intensity": "가볍게", "painAreas": ["none", "kneeLeg"] }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 토큰_없는_보호_경로_접근은_401_규약_본문을_돌려준다() throws Exception {
        mockMvc.perform(post("/onboarding/survey").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("로그인이 필요해요."))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }
}
