package com.spark.backend.home;

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
import tools.jackson.databind.ObjectMapper;

/** 홈·기록·배지 — 화면 하나 = 응답 하나 (계약서 §3·§6) */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ScreenAssemblyTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;

    String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        String body = mockMvc.perform(post("/auth/signup/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"screen@spark.app\", \"password\": \"password1234\", \"name\": \"화면\" }"))
                .andReturn().getResponse().getContentAsString();
        accessToken = objectMapper.readTree(body).get("accessToken").asString();
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder authed(String url) {
        return get(url).header("Authorization", "Bearer " + accessToken);
    }

    private void completeOneRoutine() throws Exception {
        String response = mockMvc.perform(post("/sessions")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"routineId\": \"routine-1\" }"))
                .andReturn().getResponse().getContentAsString();
        String sessionId = objectMapper.readTree(response).get("sessionId").asString();
        mockMvc.perform(post("/sessions/" + sessionId + "/complete")
                .header("Authorization", "Bearer " + accessToken)).andExpect(status().isOk());
    }

    @Test
    void 홈은_화면_하나를_한_번에_돌려준다() throws Exception {
        completeOneRoutine();

        mockMvc.perform(authed("/home"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.streakDays").value(1))
                .andExpect(jsonPath("$.recommendedRoutine.id").isNotEmpty())
                .andExpect(jsonPath("$.recommendedRoutine.exerciseCount").value(3))
                .andExpect(jsonPath("$.friendActivities[0].isMe").value(true))
                .andExpect(jsonPath("$.friendActivities[0].statusLabel").value("1일째 운동 완료 ✅"))
                .andExpect(jsonPath("$.weeklyAttendance.length()").value(7))
                .andExpect(jsonPath("$.weeklyAttendance[0].weekday").value("월"));
    }

    @Test
    void 설문의_통증_부위가_추천_루틴에_반영된다() throws Exception {
        mockMvc.perform(post("/onboarding/survey")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "fitnessLevel": "보통", "activityLevel": "주 1~2회",
                                  "availableTime": "10~20분", "intensity": "가볍게", "painAreas": ["neckShoulder"] }
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(authed("/home"))
                .andExpect(jsonPath("$.recommendedRoutine.id").value("routine-1"))
                .andExpect(jsonPath("$.recommendedRoutine.name").value("목/어깨 스트레칭 + 코어강화"));
    }

    @Test
    void 기록_요약은_통계와_최근_기록을_담는다() throws Exception {
        completeOneRoutine();

        mockMvc.perform(authed("/stats/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSessions").value(1))
                .andExpect(jsonPath("$.streakDays").value(1))
                .andExpect(jsonPath("$.monthBestStreak").value(1))
                .andExpect(jsonPath("$.monthly.completedRoutines").value(1))
                .andExpect(jsonPath("$.monthly.skippedExercises").value(0))
                .andExpect(jsonPath("$.recent[0].routineName").value("목/어깨 스트레칭 + 코어강화"))
                .andExpect(jsonPath("$.recent[0].whenLabel").value("오늘"))
                .andExpect(jsonPath("$.recent[0].completedCount").value(3))
                .andExpect(jsonPath("$.recent[0].skippedCount").value(0));
    }

    @Test
    void 연속_출석_상세와_월_캘린더() throws Exception {
        completeOneRoutine();
        int today = java.time.LocalDate.now().getDayOfMonth();

        mockMvc.perform(authed("/stats/streak"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentStreakDays").value(1))
                .andExpect(jsonPath("$.monthCompletedCount").value(1))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.attendance.days[0].day").value(today))
                .andExpect(jsonPath("$.attendance.days[0].intensity").value(1.0))
                // 첫 운동 + 루틴 완성 + AI PT 도전 배지를 이미 얻었다
                .andExpect(jsonPath("$.achievements.length()").value(3));

        mockMvc.perform(authed("/stats/my-status"))
                .andExpect(jsonPath("$.streakDays").value(1))
                .andExpect(jsonPath("$.monthCompletedDays").value(1))
                .andExpect(jsonPath("$.attendance.completedDays[0]").value(today));
    }

    @Test
    void 배지는_획득_도전중_잠김으로_나뉜다() throws Exception {
        completeOneRoutine();

        mockMvc.perform(authed("/badges"))
                .andExpect(status().isOk())
                // 첫 운동 · 루틴 완성 · AI PT 도전(routine-1에 AI PT 운동 포함) 획득
                .andExpect(jsonPath("$.earned.length()").value(3))
                .andExpect(jsonPath("$.earned[0].statusLabel").value("획득 완료"))
                // 7일·21일 연속, 30일·100일 달성, 목표 달성자, 운동 마스터 — 도전 중
                .andExpect(jsonPath("$.inProgress.length()").value(6))
                .andExpect(jsonPath("$.inProgress[0].statusLabel").value("1/7일"))
                // 친구 독려왕(0/10) · 모임 챔피언(0/3) — 잠김
                .andExpect(jsonPath("$.locked.length()").value(2))
                .andExpect(jsonPath("$.locked[0].statusLabel").value("조건 미충족"));
    }

    @Test
    void AI_PT_운동을_완료하면_AI_PT_배지가_진행된다() throws Exception {
        completeOneRoutine(); // routine-1은 기본 스쿼트(e-2)·어깨 돌리기(e-7) 등 AI PT 운동 포함

        mockMvc.perform(authed("/badges"))
                .andExpect(jsonPath("$.earned[?(@.name == 'AI PT 도전')]").exists());
    }
}
