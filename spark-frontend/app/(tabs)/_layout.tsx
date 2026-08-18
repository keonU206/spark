import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
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

/**
 * 하단 탭 — Figma `64:592`(Frame 3)
 * 시안: 흰 알약(x=16, y=946, 358×70, radius 35)이 콘텐츠 위에 떠 있다.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs>
      <TabSlot />

      {/* TabList asChild는 스타일 배열을 받지 못해 미리 합쳐서 넘긴다 */}
      <TabList asChild>
        <View style={StyleSheet.flatten([styles.bar, { bottom: insets.bottom + 20 }])}>
          <TabTrigger name="home" href="/home" asChild>
            <TabButton icon={TabHomeIcon} accessibilityLabel="홈" />
          </TabTrigger>
          <TabTrigger name="workout" href="/workout" asChild>
            <TabButton icon={TabExerciseIcon} accessibilityLabel="운동" />
          </TabTrigger>
          <TabTrigger name="community" href="/community" asChild>
            <TabButton icon={TabPeopleIcon} accessibilityLabel="모임" />
          </TabTrigger>
          <TabTrigger name="records" href="/records" asChild>
            <TabButton icon={TabProfileIcon} accessibilityLabel="기록" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
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
    // 콘텐츠 위에 떠 있어 경계가 필요하다
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
