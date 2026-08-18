import { router } from 'expo-router';

import { IntroScreen } from '@/components/ui/IntroScreen';
import { strings } from '@/constants/strings';
import { colors } from '@/theme/tokens';

/** 스플래쉬 — Figma `64:398` (주황 배경 + 밝은 주황 워터마크) */
export default function SplashScreen() {
  return (
    <IntroScreen
      backgroundColor={colors.main}
      watermarkColor={colors.splashAccent}
      title={strings.splash.title}
      subtitleLine1={strings.splash.subtitleLine1}
      subtitleLine2={strings.splash.subtitleLine2}
      cta={strings.splash.cta}
      onPress={() => router.replace('/onboarding')}
    />
  );
}
