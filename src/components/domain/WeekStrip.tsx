import { StyleSheet, Text, View } from 'react-native';

import { CheckIcon } from '@/components/illustrations/tabIcons';
import { colors, fontFamily } from '@/theme/tokens';
import type { DayAttendance } from '@/types/api';

/**
 * 주간 출석 스트립 — Figma `64:592`
 * 시안: 요일 라벨(#898989) + ⌀33 원 7개(간격 47).
 * 미완료는 메인 컬러 테두리만, 완료는 메인 컬러로 채우고 흰 체크.
 */
export function WeekStrip({ days }: { days: DayAttendance[] }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {days.map((day) => (
          <Text key={day.weekday} style={styles.weekday}>
            {day.weekday}
          </Text>
        ))}
      </View>

      <View style={[styles.row, styles.circleRow]}>
        {days.map((day) => (
          <View
            key={day.weekday}
            style={[styles.circle, day.completed && styles.circleDone]}
            accessibilityLabel={`${day.weekday}요일 ${day.completed ? '운동 완료' : '미완료'}`}
          >
            {day.completed ? <CheckIcon /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 120,
    borderRadius: 9.5,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingTop: 32,
    paddingHorizontal: 17,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleRow: {
    marginTop: 10,
  },
  weekday: {
    width: 33,
    textAlign: 'center',
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 17,
    color: colors.textSub,
  },
  circle: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
    borderWidth: 1,
    borderColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: colors.main,
  },
});
