import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/theme/tokens';

/**
 * 홈 히어로의 알림 종. 미확인 재촉이 있으면 빨간 점이 깜빡여서 멀리서도 눈에 띈다.
 * 누르면 알림함(/alerts)으로 간다.
 */
export function NotificationBell({
  hasUnread,
  onPress,
  top,
}: {
  hasUnread: boolean;
  onPress: () => void;
  top: number;
}) {
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hasUnread) {
      blink.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.15, duration: 500, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hasUnread, blink]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hasUnread ? '새 알림 있음' : '알림'}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, { top }, pressed && styles.pressed]}
    >
      <Text style={styles.bell}>🔔</Text>
      {hasUnread ? <Animated.View style={[styles.dot, { opacity: blink }]} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    // 프로필 버튼(right: 16, 38px) 왼쪽에 나란히
    right: 16 + 38 + 10,
    zIndex: 1,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  bell: {
    fontSize: 17,
    lineHeight: 22,
  },
  dot: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: colors.white,
  },
});
