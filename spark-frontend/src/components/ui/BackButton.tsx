import { Pressable, StyleSheet } from 'react-native';

import { ChevronLeftIcon } from '@/components/illustrations/icons';
import { layout } from '@/theme/tokens';

/** 회원가입 화면 헤더의 뒤로가기. 시안 좌표 x=13, y=97, 24×24 */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="뒤로 가기"
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <ChevronLeftIcon size={layout.back.size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.back.size,
    height: layout.back.size,
    marginLeft: layout.back.x,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
