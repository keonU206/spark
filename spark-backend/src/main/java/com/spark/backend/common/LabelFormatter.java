package com.spark.backend.common;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

/**
 * 표기 문자열은 서버가 만든다 — docs/api-contract.md §1.
 * 문구는 전부 mock(시안)과 동일한 형식을 따른다. 화면에 그대로 노출되므로 형식을 함부로 바꾸지 말 것.
 */
public final class LabelFormatter {

    private static final DateTimeFormatter FEED_DATE =
            DateTimeFormatter.ofPattern("yyyy.MM.dd · a h:mm", Locale.KOREAN);

    private LabelFormatter() {
    }

    /** "오늘" / "어제" / "N일 전" — 기록 목록의 whenLabel */
    public static String whenLabel(LocalDate date) {
        long days = ChronoUnit.DAYS.between(date, LocalDate.now());
        if (days <= 0) return "오늘";
        if (days == 1) return "어제";
        return days + "일 전";
    }

    /** "오늘" / "1일전" / "N일전" — 모임 카드의 lastActivityLabel (시안은 붙여 쓴다) */
    public static String lastActivityLabel(LocalDateTime at) {
        long days = ChronoUnit.DAYS.between(at.toLocalDate(), LocalDate.now());
        if (days <= 0) return "오늘";
        return days + "일전";
    }

    /** "2026.08.23 · 오후 6:30" — 피드 글의 createdAtLabel */
    public static String feedCreatedAtLabel(LocalDateTime at) {
        return FEED_DATE.format(at);
    }

    /**
     * 친구/멤버의 운동 상태 한 줄.
     * 오늘 완료 → "N일째 운동 완료 ✅" · 어제까지 이어짐 → "N일째 운동 중 🔥" · 기록 없음 → "최신 운동 기록이 없어요 .."
     */
    public static String memberStatusLabel(int streakDays, boolean workedOutToday) {
        if (streakDays <= 0) return "최신 운동 기록이 없어요 ..";
        if (workedOutToday) return streakDays + "일째 운동 완료 ✅";
        return streakDays + "일째 운동 중 🔥";
    }

    /** 연속 출석 카드 하단 격려 문구 */
    public static String streakMessage(int streakDays) {
        if (streakDays <= 0) return "오늘 3분 루틴으로 다시 시작해봐요!";
        if (streakDays < 3) return "좋은 출발이에요. 내일도 이어가봐요!";
        if (streakDays < 7) return "지금 페이스가 아주 좋아요. 내일도 이어가봐요!";
        if (streakDays < 21) return "습관이 만들어지고 있어요. 이 기세를 지켜요!";
        return "대단해요! 이미 운동이 생활이 됐어요 🔥";
    }

    /**
     * 모임 카드 제목. 모임명이 있으면 그것을, 없으면 멤버 이름을 단톡방식으로 나열한다.
     * 예: "유승연,김채린,고예원,김…"
     */
    public static String groupTitle(String groupName, java.util.List<String> memberNicknames) {
        if (groupName != null && !groupName.isBlank()) return groupName;
        String joined = String.join(",", memberNicknames);
        if (joined.length() > 14) return joined.substring(0, 13) + "…";
        return joined.isEmpty() ? "새 모임" : joined;
    }
}
