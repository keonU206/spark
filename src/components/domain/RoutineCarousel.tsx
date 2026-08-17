import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { PageIndicator } from '@/components/ui/PageIndicator';
import { PillButton } from '@/components/ui/PillButton';
import { colors, fontFamily } from '@/theme/tokens';
import type { Routine } from '@/types/api';

/**
 * 오늘의 추천 운동 캐러셀 — Figma `61:768`
 * 시안: 카드 351×125(x=21), 아바타 39, 이름, 구분선(y=70),
 * "5개 운동 · 약 20분" + `운동하기` 버튼 76×30, 하단 인디케이터.
 */
export function RoutineCarousel({
  routines,
  onStart,
}: {
  routines: Routine[];
  onStart: (routine: Routine) => void;
}) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const pageWidth = width - 40;

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const clamped = Math.max(0, Math.min(routines.length - 1, next));
    if (clamped !== index) setIndex(clamped);
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.track}
      >
        {routines.map((routine) => (
          <View key={routine.id} style={[styles.card, { width: pageWidth }]}>
            <View style={styles.cardTop}>
              <View style={styles.avatar} />
              <Text style={styles.name} numberOfLines={1}>
                {routine.name}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBottom}>
              <Text style={styles.meta}>
                {`${routine.exerciseCount}개 운동 · 약 ${routine.estimatedMinutes}분`}
              </Text>
              <PillButton
                label="운동하기"
                variant="primary"
                height={30}
                width={76}
                onPress={() => onStart(routine)}
                style={styles.startButton}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicator}>
        <PageIndicator count={routines.length} index={index} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    height: 125,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  avatar: {
    width: 39,
    height: 39,
    borderRadius: 19.5,
    backgroundColor: colors.splashAccent,
  },
  name: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 21,
    color: colors.textMain,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginTop: 15,
  },
  cardBottom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  meta: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 17,
    color: colors.textSub,
  },
  startButton: {
    borderRadius: 15,
  },
  indicator: {
    marginTop: 14,
  },
});
