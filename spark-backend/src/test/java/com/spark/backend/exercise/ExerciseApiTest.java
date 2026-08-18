package com.spark.backend.exercise;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

/** 운동·루틴 조회 — 시드 데이터(운동 15개, 추천 루틴 3개) 기준 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExerciseApiTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        String body = mockMvc.perform(post("/auth/signup/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"ex@spark.app\", \"password\": \"password1234\", \"name\": \"운동\" }"))
                .andReturn().getResponse().getContentAsString();
        accessToken = objectMapper.readTree(body).get("accessToken").asString();
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder authed(String url) {
        return get(url).header("Authorization", "Bearer " + accessToken);
    }

    @Test
    void 카테고리_목록의_첫_항목은_전체다() throws Exception {
        mockMvc.perform(authed("/exercise-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("all"))
                .andExpect(jsonPath("$[0].name").value("전체"))
                .andExpect(jsonPath("$[1].name").value("스쿼트"))
                .andExpect(jsonPath("$.length()").value(5));
    }

    @Test
    void 운동_목록은_커서로_이어_받는다() throws Exception {
        // 15개 → 첫 페이지 10개 + nextCursor
        String firstPage = mockMvc.perform(authed("/exercises"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(10))
                .andExpect(jsonPath("$.nextCursor").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String cursor = objectMapper.readTree(firstPage).get("nextCursor").asString();
        mockMvc.perform(authed("/exercises?cursor=" + cursor))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(5))
                .andExpect(jsonPath("$.nextCursor").value((String) null));
    }

    @Test
    void 카테고리로_거른다_all은_전체와_같다() throws Exception {
        mockMvc.perform(authed("/exercises?categoryId=squat"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.items[0].categoryName").value("스쿼트"));

        mockMvc.perform(authed("/exercises?categoryId=all"))
                .andExpect(jsonPath("$.items.length()").value(10));
    }

    @Test
    void 운동_상세와_404() throws Exception {
        mockMvc.perform(authed("/exercises/e-2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("기본 스쿼트"))
                .andExpect(jsonPath("$.repsLabel").value("12~15회"))
                .andExpect(jsonPath("$.aiPtSupported").value(true));

        mockMvc.perform(authed("/exercises/no-such"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("EXERCISE_NOT_FOUND"));
    }

    @Test
    void 추천_루틴은_운동을_순서대로_담는다() throws Exception {
        mockMvc.perform(authed("/routines/recommended"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].id").value("routine-1"))
                .andExpect(jsonPath("$[0].exerciseCount").value(3))
                .andExpect(jsonPath("$[0].exercises[0].id").value("e-2"))
                .andExpect(jsonPath("$[0].exercises[1].id").value("e-7"))
                .andExpect(jsonPath("$[0].exercises[2].id").value("e-4"));
    }

    @Test
    void 루틴_상세() throws Exception {
        mockMvc.perform(authed("/routines/routine-3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("아침 기상 스트레칭"))
                .andExpect(jsonPath("$.estimatedMinutes").value(12))
                .andExpect(jsonPath("$.exercises.length()").value(3));
    }

    @Test
    void 토큰_없이는_401() throws Exception {
        mockMvc.perform(get("/exercises"))
                .andExpect(status().isUnauthorized());
    }
}
