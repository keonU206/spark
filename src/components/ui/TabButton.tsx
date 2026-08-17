import { forwardRef, type ComponentType } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

/**
 * 하단 탭 버튼. `expo-router/ui`의 `TabTrigger asChild`가 `isFocused`를 넘겨준다.
 *
 * 활성 표시 주의 — 시안(`64:592`)에서는 어느 화면이든 "모임" 아이콘만 100% 불투명도로
 * 그려져 있다. 같은 탭 바 컴포넌트를 복사해 둔 것으로 보여, 실제 선택된 탭을 활성으로 칠한다.
 */
type Props = PressableProps & {
  isFocused?: boolean;
  icon: ComponentType<{ active?: boolean }>;
};

export const TabButton = forwardRef<View, Props>(function TabButton(
  { isFocused, icon: Icon, style, ...rest },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      // `accessibilityState`만으로는 react-native-web이 aria-selected를 붙이지 않는다
      aria-selected={!!isFocused}
      accessibilityState={{ selected: !!isFocused }}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
      {...rest}
    >
      <Icon active={isFocused} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
