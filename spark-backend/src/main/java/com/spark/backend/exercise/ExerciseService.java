package com.spark.backend.exercise;

import com.spark.backend.common.error.ApiException;
import com.spark.backend.exercise.dto.ExerciseDtos.CategoryResponse;
import com.spark.backend.exercise.dto.ExerciseDtos.ExercisePageResponse;
import com.spark.backend.exercise.dto.ExerciseDtos.ExerciseResponse;
import com.spark.backend.exercise.dto.ExerciseDtos.RoutineResponse;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExerciseService {

    /** 첫 항목 "전체"는 저장하지 않고 API가 붙여준다 */
    public static final String CATEGORY_ALL = "all";

    private static final int PAGE_SIZE = 10;

    private final CategoryRepository categoryRepository;
    private final ExerciseRepository exerciseRepository;
    private final RoutineRepository routineRepository;

    public List<CategoryResponse> categories() {
        List<CategoryResponse> result = new ArrayList<>();
        result.add(new CategoryResponse(CATEGORY_ALL, "전체"));
        categoryRepository.findAllByOrderBySortOrderAsc()
                .forEach(c -> result.add(new CategoryResponse(c.getId(), c.getName())));
        return result;
    }

    /** 커서 = 마지막 항목의 sortOrder. 첫 페이지는 cursor 없이 요청한다 */
    public ExercisePageResponse exercises(String categoryId, String cursor) {
        int cursorValue = parseCursor(cursor);
        var pageable = PageRequest.of(0, PAGE_SIZE + 1);

        List<Exercise> found = (categoryId == null || CATEGORY_ALL.equals(categoryId))
                ? exerciseRepository.findPage(cursorValue, pageable)
                : exerciseRepository.findPageByCategory(categoryId, cursorValue, pageable);

        boolean hasNext = found.size() > PAGE_SIZE;
        List<Exercise> page = hasNext ? found.subList(0, PAGE_SIZE) : found;
        String nextCursor = hasNext ? String.valueOf(page.get(page.size() - 1).getSortOrder()) : null;

        return new ExercisePageResponse(page.stream().map(ExerciseResponse::from).toList(), nextCursor);
    }

    public ExerciseResponse exercise(String id) {
        return exerciseRepository.findById(id)
                .map(ExerciseResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "EXERCISE_NOT_FOUND",
                        "운동을 찾을 수 없어요."));
    }

    public List<RoutineResponse> recommendedRoutines() {
        return routineRepository.findByOwnerIdIsNullOrderByIdAsc().stream()
                .map(RoutineResponse::from)
                .toList();
    }

    public RoutineResponse routine(String id) {
        return routineRepository.findById(id)
                .map(RoutineResponse::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ROUTINE_NOT_FOUND",
                        "루틴을 찾을 수 없어요."));
    }

    private int parseCursor(String cursor) {
        if (cursor == null || cursor.isBlank()) return Integer.MIN_VALUE;
        try {
            return Integer.parseInt(cursor);
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CURSOR", "잘못된 페이지 요청이에요.");
        }
    }
}
