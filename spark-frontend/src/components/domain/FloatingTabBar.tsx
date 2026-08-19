import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TabExerciseIcon,
  TabHomeIcon,
  TabPeopleIcon,
  TabProfileIcon,
} from '@/components/illustrations/tabIcons';
import { TabButton } from '@/components/ui/TabButton';
import { colors } from '@/theme/tokens';

type TabName = 'home' | 'workout' | 'community' | 'records';

/**
 * 탭 밖(상세 화면)에서도 항상 떠 있는 하단 메뉴 — 시안은 모든 페이지에 탭 바가 있다.
 * (tabs)/_layout.tsx의 알약 스타일과 동일하게 맞춘다.
 */
export function FloatingTabBar({ active }: { active?: TabName }) {
  const insets = useSafeAreaInsets();

  // 탭으로 나갈 때는 상세 스택을 정리한다
  const go = (href: Href) => router.replace(href);

  return (
    <View style={[styles.bar, { bottom: insets.bottom + 20 }]}>
      <TabButton
        icon={TabHomeIcon}
        isFocused={active === 'home'}
        accessibilityLabel="홈"
        onPress={() => go('/home')}
      />
      <TabButton
        icon={TabExerciseIcon}
        isFocused={active === 'workout'}
        accessibilityLabel="운동"
        onPress={() => go('/workout')}
      />
      <TabButton
        icon={TabPeopleIcon}
        isFocused={active === 'community'}
        accessibilityLabel="모임"
        onPress={() => go('/community')}
      />
      <TabButton
        icon={TabProfileIcon}
        isFocused={active === 'records'}
        accessibilityLabel="기록"
        onPress={() => go('/records')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    alignSelf: 'center',
    width: 358,
    maxWidth: '92%',
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
