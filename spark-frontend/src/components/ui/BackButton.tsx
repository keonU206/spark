import { Pressable, StyleSheet } from 'react-native';

import { ChevronLeftIcon } from '@/components/illustrations/icons';
import { layout } from '@/theme/tokens';

/** 실제 터치 영역 — 아이콘(24)보다 훨씬 크게 잡는다 (권장 최소 44 이상) */
const TOUCH_SIZE = 64;

/**
 * 화면 헤더의 뒤로가기. 아이콘은 시안 좌표에 그대로 두고 터치 영역만 넓다.
 *
 * 헤더 화면들은 래퍼가 하단 기준(bottom)으로 붙어 있어 아이콘을 컨테이너 아래에,
 * 가입 흐름처럼 위에서부터 쌓이는 화면은 `align="top"`으로 아이콘을 위에 붙인다.
 * (컨테이너가 커져도 아이콘이 원래 자리를 지키게 하기 위함)
 */
export function BackButton({
  onPress,
  align = 'bottom',
}: {
  onPress: () => void;
  align?: 'bottom' | 'top';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="뒤로 가기"
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [
        styles.button,
        align === 'bottom' ? styles.alignBottom : styles.alignTop,
        pressed && styles.pressed,
      ]}
    >
      <ChevronLeftIcon size={layout.back.size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: TOUCH_SIZE,
    height: TOUCH_SIZE,
    // 아이콘이 시안 좌표(x=13)에 그대로 오도록 컨테이너 여백을 보정한다
    marginLeft: layout.back.x - (TOUCH_SIZE - layout.back.size) / 2,
    alignItems: 'center',
  },
  alignBottom: {
    justifyContent: 'flex-end',
  },
  alignTop: {
    justifyContent: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
});
