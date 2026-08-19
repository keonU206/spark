import { Pressable, StyleSheet } from 'react-native';

import { ChevronLeftIcon } from '@/components/illustrations/icons';
import { layout } from '@/theme/tokens';

/** 실제 터치 영역 — 아이콘(24)보다 훨씬 크게 잡는다 (권장 최소 44 이상) */
const TOUCH_SIZE = 48;

/** 화면 헤더의 뒤로가기. 아이콘 위치는 시안(x=13) 그대로, 터치 영역만 넓다 */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="뒤로 가기"
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
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
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
