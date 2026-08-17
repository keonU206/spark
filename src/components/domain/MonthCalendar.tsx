import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';
import type { GroupDayAttendance } from '@/types/api';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const ROW_HEIGHT = 53;

/**
 * 월별 출석 캘린더 — Figma `81:887`(내 운동 현황) / `81:1817`(모임 운동현황)
 *
 * 시안의 특징 두 가지:
 *  1. 완료한 날을 칸마다 따로 칠하지 않고, **한 주 안에서 연속된 날을 하나의 주황 막대로 병합**한다.
 *     (`x=168 w=222`는 4칸이 이어진 블록)
 *  2. 모임 화면에서는 칸마다 **주황 농도가 다르다** — 그날 운동한 멤버 비율.
 *
 * 그래서 주 단위로 "농도가 같은 연속 구간"을 찾아 막대 하나씩 그린다.
 */
type Run = { start: number; length: number; intensity: number };

function findRuns(cells: (number | null)[], intensityOf: (day: number) => number): Run[] {
  const runs: Run[] = [];
  let start = -1;
  let current = 0;

  const flush = (end: number) => {
    if (start !== -1) runs.push({ start, length: end - start, intensity: current });
    start = -1;
  };

  cells.forEach((day, i) => {
    const intensity = day === null ? 0 : intensityOf(day);
    if (intensity <= 0) {
      flush(i);
      return;
    }
    if (start === -1) {
      start = i;
      current = intensity;
    } else if (intensity !== current) {
      // 농도가 바뀌면 막대를 끊는다
      flush(i);
      start = i;
      current = intensity;
    }
  });

  flush(cells.length);
  return runs;
}

/** 해당 월을 주 단위 배열로 만든다. 앞뒤 빈 칸은 null */
function buildWeeks(year: number, month: number): (number | null)[][] {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function MonthCalendar({
  month,
  days,
}: {
  /** "2026-07" */
  month: string;
  days: GroupDayAttendance[];
}) {
  const { width } = useWindowDimensions();
  const cellWidth = width / 7;

  const [yearText, monthText] = month.split('-');
  const weeks = buildWeeks(Number(yearText), Number(monthText));

  const byDay = new Map(days.map((d) => [d.day, d.intensity]));
  const intensityOf = (day: number) => byDay.get(day) ?? 0;

  return (
    <View>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((label) => (
          <Text key={label} style={[styles.weekday, { width: cellWidth }]}>
            {label}
          </Text>
        ))}
      </View>

      {weeks.map((cells, weekIndex) => (
        <View key={weekIndex} style={styles.week}>
          {findRuns(cells, intensityOf).map((run) => (
            <View
              key={run.start}
              style={[
                styles.runBar,
                {
                  left: run.start * cellWidth,
                  width: run.length * cellWidth,
                  opacity: run.intensity,
                },
              ]}
            />
          ))}

          {cells.map((day, i) => (
            <View key={i} style={[styles.cell, { width: cellWidth }]}>
              {day !== null ? (
                <Text style={[styles.day, intensityOf(day) >= 0.6 && styles.dayOnFill]}>{day}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  weekdayRow: {
    flexDirection: 'row',
  },
  weekday: {
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 30,
    color: colors.textSub,
  },
  week: {
    flexDirection: 'row',
    height: ROW_HEIGHT,
  },
  runBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.main,
  },
  cell: {
    height: ROW_HEIGHT,
    paddingTop: 6,
    paddingLeft: 6,
  },
  day: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.main,
  },
  /** 진한 칸 위에서는 글자를 흰색으로 */
  dayOnFill: {
    color: colors.white,
    fontWeight: '700',
  },
});
