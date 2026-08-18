import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ONBOARDING_ART,
  ONBOARDING_ART_WIDTH,
} from '@/components/illustrations/OnboardingArt';
import { HighlightText } from '@/components/ui/HighlightText';
import { PageIndicator } from '@/components/ui/PageIndicator';
import { PillButton } from '@/components/ui/PillButton';
import { strings } from '@/constants/strings';
import { colors, fontFamily, frame } from '@/theme/tokens';

const PAGES = strings.onboarding.pages;

/**
 * 온보딩 — Figma `69:2046`(1) / `72:2166`(2) / `72:2202`(3)
 *
 * 가로 스와이프 3페이지. 시안대로 1·2페이지는 하단에 인디케이터,
 * 마지막 페이지는 같은 자리를 CTA가 대신한다.
 */
export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const isLast = index === PAGES.length - 1;

  /**
   * `onScroll`로 인덱스를 잡는다. `onMomentumScrollEnd`는 react-native-web에서
   * 발화하지 않아 마지막 페이지의 CTA가 뜨지 않는다.
   */
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    const clamped = Math.max(0, Math.min(PAGES.length - 1, next));
    if (clamped !== index) setIndex(clamped);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {PAGES.map((page, i) => {
          const Art = ONBOARDING_ART[i];
          const artWidth = ONBOARDING_ART_WIDTH[i];

          return (
            <View key={page.key} style={[styles.page, { width, paddingTop: insets.top + 109 }]}>
              <HighlightText segments={page.title} style={styles.title} />
              <Text style={styles.subtitle}>{page.subtitle}</Text>

              <View style={styles.artArea}>
                {Art && artWidth ? (
                  <Art width={Math.min(artWidth, width - 40) * (width / frame.width)} />
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 37 }]}>
        {isLast ? (
          <PillButton
            label={strings.onboarding.cta}
            variant="primary"
            onPress={() => router.replace('/login')}
          />
        ) : (
          <View style={styles.indicatorSlot}>
            <PageIndicator count={PAGES.length} index={index} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  page: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSub,
    textAlign: 'center',
    marginTop: 25,
  },
  artArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    alignItems: 'center',
  },
  /** CTA(71px)와 같은 높이를 차지해 페이지 전환 시 하단이 흔들리지 않게 한다 */
  indicatorSlot: {
    height: 71,
    justifyContent: 'center',
  },
});
