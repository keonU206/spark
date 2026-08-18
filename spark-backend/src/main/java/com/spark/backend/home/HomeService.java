package com.spark.backend.home;

import com.spark.backend.exercise.Routine;
import com.spark.backend.exercise.RoutineRepository;
import com.spark.backend.group.FriendService;
import com.spark.backend.group.dto.GroupDtos.FriendActivityResponse;
import com.spark.backend.home.dto.HomeDtos.HomeSummaryResponse;
import com.spark.backend.home.dto.HomeDtos.RecommendedRoutineResponse;
import com.spark.backend.home.dto.HomeDtos.WeekdayAttendanceResponse;
import com.spark.backend.stats.StatsEngine;
import com.spark.backend.survey.SurveyEnums.PainArea;
import com.spark.backend.survey.SurveyResponseRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** GET /home — 홈 화면 하나를 1회 요청으로 완성한다 (계약서 §3) */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeService {

    private final StatsEngine statsEngine;
    private final FriendService friendService;
    private final RoutineRepository routineRepository;
    private final SurveyResponseRepository surveyResponseRepository;

    public HomeSummaryResponse summary(Long userId) {
        List<FriendActivityResponse> friends = friendService.activities(userId);
        List<WeekdayAttendanceResponse> weekly = statsEngine.weeklyAttendance(userId).stream()
                .map(d -> new WeekdayAttendanceResponse(d.weekday(), d.completed()))
                .toList();
        return new HomeSummaryResponse(
                statsEngine.streakDays(userId),
                recommend(userId),
                friends,
                weekly);
    }

    /**
     * 오늘의 추천 루틴 — 설문의 통증 부위를 우선 반영하고, 해당 없으면 날마다 돌아가며 추천한다.
     * 목/어깨 → routine-1, 허리 → routine-3(스트레칭), 무릎/다리 → routine-2(하체)
     */
    private RecommendedRoutineResponse recommend(Long userId) {
        List<Routine> routines = routineRepository.findByOwnerIdIsNullOrderByIdAsc();
        if (routines.isEmpty()) {
            return new RecommendedRoutineResponse("", "루틴 준비 중", 0, 0);
        }

        Set<PainArea> painAreas = surveyResponseRepository.findByUserId(userId)
                .map(s -> Set.copyOf(s.getPainAreas()))
                .orElse(Set.of());

        Routine picked = null;
        if (painAreas.contains(PainArea.neckShoulder)) picked = byId(routines, "routine-1");
        else if (painAreas.contains(PainArea.lowerBack)) picked = byId(routines, "routine-3");
        else if (painAreas.contains(PainArea.kneeLeg)) picked = byId(routines, "routine-2");
        if (picked == null) {
            picked = routines.get(LocalDate.now().getDayOfYear() % routines.size());
        }

        return new RecommendedRoutineResponse(
                picked.getId(), picked.getName(), picked.getExercises().size(), picked.getEstimatedMinutes());
    }

    private Routine byId(List<Routine> routines, String id) {
        return routines.stream().filter(r -> r.getId().equals(id)).findFirst().orElse(null);
    }
}
