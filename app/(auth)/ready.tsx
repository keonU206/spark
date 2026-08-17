import { router } from 'expo-router';

import { IntroScreen } from '@/components/ui/IntroScreen';
import { strings } from '@/constants/strings';
import { colors } from '@/theme/tokens';

/**
 * 설문 완료 — Figma `75:2804`
 *
 * 프레임 이름은 "스플래쉬"지만 문구가 "준비가 끝났어요!"이고
 * 시안 배치상 설문조사 다음 칸이라 설문 완료 화면으로 본다.
 * 스플래쉬와 레이아웃은 같고 배경(아이보리)·워터마크 색(진한 주황)만 다르다.
 */
export default function ReadyScreen() {
  return (
    <IntroScreen
      backgroundColor={colors.bg}
      watermarkColor={colors.main}
      title={strings.ready.title}
      subtitleLine1={strings.ready.subtitleLine1}
      subtitleLine2={strings.ready.subtitleLine2}
      cta={strings.ready.cta}
      onPress={() => router.replace('/home')}
    />
  );
}
