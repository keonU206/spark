package com.spark.backend.group;

import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** 넛지 쿨다운 조회 — 같은 대상에게 하루 1회 (자정 기준) */
@Service
@RequiredArgsConstructor
public class NudgeQueryService {

    private final NudgeRepository nudgeRepository;

    public boolean canNudgeToday(Long fromUserId, Long toUserId) {
        return !nudgeRepository.existsByFromUserIdAndToUserIdAndCreatedAtAfter(
                fromUserId, toUserId, LocalDate.now().atStartOfDay());
    }
}
