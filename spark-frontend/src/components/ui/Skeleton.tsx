import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue } from 'react-native';

import { colors } from '@/theme/tokens';

/**
 * 로딩 자리표시. 스피너 대신 실제 배치와 비슷한 회색 덩어리를 보여줘
 * 데이터가 도착했을 때 화면이 덜 튀게 한다.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = 6,
  style,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

/** 카드 안의 목록 한 줄 (아바타 + 두 줄 텍스트) */
export function SkeletonRow({ avatar = true }: { avatar?: boolean }) {
  return (
    <View style={styles.row}>
      {avatar ? <Skeleton width={40} height={40} radius={20} /> : null}
      <View style={styles.rowTexts}>
        <Skeleton width="55%" height={14} />
        <Skeleton width="35%" height={11} style={styles.rowSecondLine} />
      </View>
    </View>
  );
}

/** 흰 카드 + 줄 여러 개 */
export function SkeletonCard({ rows = 3, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <View style={styles.card}>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} avatar={avatar} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.cardBorder,
  },
  row: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTexts: {
    flex: 1,
    marginLeft: 13,
  },
  rowSecondLine: {
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 9.5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
