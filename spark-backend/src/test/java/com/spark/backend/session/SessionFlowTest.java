package com.spark.backend.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.spark.backend.stats.StatsEngine;
import java.time.YearMonth;
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

/** 세션 시작→완료/중단 흐름과 월간 집계·스트릭 — docs/api-contract.md §5 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SessionFlowTest {

    @Autowired
    MockMvc mockMvc;
    @Autowired
    ObjectMapper objectMapper;
    @Autowired
    StatsEngine statsEngine;

    String accessToken;
    Long userId;

    @BeforeEach
    void setUp() throws Exception {
        String body = mockMvc.perform(post("/auth/signup/email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"email\": \"session@spark.app\", \"password\": \"password1234\", \"name\": \"세션\" }"))
                .andReturn().getResponse().getContentAsString();
        JsonNode session = objectMapper.readTree(body);
        accessToken = session.get("accessToken").asString();
        // JWT subject가 userId다
        String payload = new String(java.util.Base64.getUrlDecoder()
                .decode(accessToken.split("\\.")[1]));
        userId = objectMapper.readTree(payload).get("sub").asLong();
    }

    private String startSession() throws Exception {
        return startSession("routine-1");
    }

    private String startSession(String routineId) throws Exception {
        String response = mockMvc.perform(post("/sessions")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"routineId\": \"" + routineId + "\" }"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("sessionId").asString();
    }

    @Test
    void 루틴으로_시작하면_구성_운동이_스냅샷된다() throws Exception {
        String sessionId = startSession();

        mockMvc.perform(post("/sessions/" + sessionId + "/complete")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessionId").value(sessionId))
                .andExpect(jsonPath("$.exercises.length()").value(3))
                .andExpect(jsonPath("$.exercises[0].exerciseId").value("e-2"))
                .andExpect(jsonPath("$.exercises[0].status").value("completed"))
                .andExpect(jsonPath("$.monthly.completedRoutines").value(1))
                .andExpect(jsonPath("$.monthly.abortedCount").value(0));
    }

    @Test
    void 건너뛴_운동을_보고하면_skipped로_기록된다() throws Exception {
        String sessionId = startSession();

        mockMvc.perform(post("/sessions/" + sessionId + "/complete")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"skippedExerciseIds\": [\"e-7\"] }"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exercises[1].exerciseId").value("e-7"))
                .andExpect(jsonPath("$.exercises[1].status").value("skipped"))
                .andExpect(jsonPath("$.exercises[0].status").value("completed"));

        assertThat(statsEngine.monthlyStats(userId, YearMonth.now()).skippedExercises()).isEqualTo(1);
    }

    @Test
    void 중단하면_aborted로_집계된다() throws Exception {
        String sessionId = startSession();
        mockMvc.perform(post("/sessions/" + sessionId + "/abort")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        StatsEngine.MonthlyStats monthly = statsEngine.monthlyStats(userId, YearMonth.now());
        assertThat(monthly.abortedCount()).isEqualTo(1);
        assertThat(monthly.completedRoutines()).isZero();
    }

    @Test
    void 닫힌_세션을_다시_닫으면_409() throws Exception {
        String sessionId = startSession();
        mockMvc.perform(post("/sessions/" + sessionId + "/complete")
                .header("Authorization", "Bearer " + accessToken)).andExpect(status().isOk());

        mockMvc.perform(post("/sessions/" + sessionId + "/complete")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("SESSION_ALREADY_CLOSED"));
    }

    @Test
    void 남의_세션이나_없는_세션은_404() throws Exception {
        mockMvc.perform(post("/sessions/999999/complete")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("SESSION_NOT_FOUND"));

        mockMvc.perform(post("/sessions/not-a-number/abort")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void 단일_운동은_운동_id_그대로_시작한다() throws Exception {
        // 프론트 session.tsx는 `routineId ?? exerciseId`를 보낸다 — 운동 상세에서는 맨 운동 id
        String sessionId = startSession("e-10");

        mockMvc.perform(post("/sessions/" + sessionId + "/complete")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exercises.length()").value(1))
                .andExpect(jsonPath("$.exercises[0].exerciseId").value("e-10"))
                .andExpect(jsonPath("$.exercises[0].name").value("플랭크"))
                // 단일 운동은 "완료 루틴" 수를 늘리지 않는다
                .andExpect(jsonPath("$.monthly.completedRoutines").value(0));
    }

    @Test
    void single_접두사_형식도_같은_단일_운동으로_해석한다() throws Exception {
        // getRoutineForExercise가 만드는 가짜 루틴 id 형식
        String sessionId = startSession("single-e-10");
        mockMvc.perform(post("/sessions/" + sessionId + "/complete")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exercises[0].exerciseId").value("e-10"));
    }

    @Test
    void 루틴도_운동도_아닌_id로_시작하면_404() throws Exception {
        mockMvc.perform(post("/sessions")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"routineId\": \"no-such-thing\" }"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ROUTINE_NOT_FOUND"));
    }

    @Test
    void 없는_루틴으로_시작하면_404() throws Exception {
        mockMvc.perform(post("/sessions")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{ \"routineId\": \"no-such\" }"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ROUTINE_NOT_FOUND"));
    }

    @Test
    void 오늘_완료하면_스트릭과_주간_출석에_반영된다() throws Exception {
        assertThat(statsEngine.streakDays(userId)).isZero();

        String sessionId = startSession();
        mockMvc.perform(post("/sessions/" + sessionId + "/complete")
                .header("Authorization", "Bearer " + accessToken)).andExpect(status().isOk());

        assertThat(statsEngine.streakDays(userId)).isEqualTo(1);
        long completedToday = statsEngine.weeklyAttendance(userId).stream()
                .filter(StatsEngine.DayAttendance::completed).count();
        assertThat(completedToday).isEqualTo(1);
        assertThat(statsEngine.monthBestStreak(userId, YearMonth.now())).isEqualTo(1);
        assertThat(statsEngine.completedDaysOfMonth(userId, YearMonth.now()))
                .containsExactly(java.time.LocalDate.now().getDayOfMonth());
    }
}
