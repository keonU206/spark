package com.spark.backend.stats;

import static org.assertj.core.api.Assertions.assertThat;

import com.spark.backend.session.WorkoutSession;
import com.spark.backend.session.WorkoutSessionRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.YearMonth;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

/** 스트릭 계산 규칙 — docs/erd.md §8 */
@SpringBootTest
@Transactional
class StatsEngineTest {

    @Autowired
    StatsEngine statsEngine;
    @Autowired
    WorkoutSessionRepository sessionRepository;
    @Autowired
    EntityManager em;

    private static final Long USER = 777L;

    /** 완료 세션을 원하는 날짜로 심는다 (startedAt은 엔티티가 now로 잡으므로 직접 밀어넣는다) */
    private void completedOn(LocalDate date) {
        WorkoutSession session = WorkoutSession.builder().userId(USER).build();
        session.complete();
        sessionRepository.saveAndFlush(session);
        em.createQuery("update WorkoutSession s set s.startedAt = :at where s.id = :id")
                .setParameter("at", date.atTime(9, 0))
                .setParameter("id", session.getId())
                .executeUpdate();
        em.clear();
    }

    @Test
    void 오늘을_안_했어도_어제까지의_연속은_유지된다() {
        LocalDate today = LocalDate.now();
        completedOn(today.minusDays(1));
        completedOn(today.minusDays(2));
        completedOn(today.minusDays(3));
        completedOn(today.minusDays(5)); // 끊긴 날 이전 기록은 세지 않는다

        assertThat(statsEngine.streakDays(USER)).isEqualTo(3);
    }

    @Test
    void 오늘_완료하면_오늘부터_이어_센다() {
        LocalDate today = LocalDate.now();
        completedOn(today);
        completedOn(today.minusDays(1));

        assertThat(statsEngine.streakDays(USER)).isEqualTo(2);
    }

    @Test
    void 그제까지만_했으면_스트릭은_끊긴_것이다() {
        completedOn(LocalDate.now().minusDays(2));
        assertThat(statsEngine.streakDays(USER)).isZero();
    }

    @Test
    void 월간_최장_스트릭은_이번_달_안에서만_센다() {
        YearMonth month = YearMonth.now();
        // 이번 달 중순의 3일 연속 (미래 날짜가 되지 않도록 1~3일을 쓴다)
        completedOn(month.atDay(1));
        completedOn(month.atDay(2));
        completedOn(month.atDay(3));

        assertThat(statsEngine.monthBestStreak(USER, month)).isGreaterThanOrEqualTo(3);
        assertThat(statsEngine.completedDaysOfMonth(USER, month)).contains(1, 2, 3);
    }
}
