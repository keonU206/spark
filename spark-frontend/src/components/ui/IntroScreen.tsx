import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/illustrations/LogoMark';
import { ArrowRightIcon } from '@/components/illustrations/icons';
import { PillButton } from '@/components/ui/PillButton';
import { colors, fontFamily } from '@/theme/tokens';

/**
 * 스플래쉬(`64:398`)와 설문 완료(`75:2804`)가 완전히 같은 레이아웃이라 하나로 묶었다.
 * 배경색과 워터마크 로고 색만 다르다.
 *
 * 시안 좌표: 워터마크 (-44, 114) 325.6×339.5 / 타이틀 y=523 /
 * 서브 y=629(2행, 2행에만 하이라이트) / CTA y=736 350×71
 */
type Props = {
  backgroundColor: string;
  watermarkColor: string;
  title: string;
  subtitleLine1: string;
  subtitleLine2: string;
  cta: string;
  onPress: () => void;
};

export function IntroScreen({
  backgroundColor,
  watermarkColor,
  title,
  subtitleLine1,
  subtitleLine2,
  cta,
  onPress,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* 시안에서 화면 왼쪽 밖으로 넘어간다 */}
      <View style={[styles.watermark, { top: insets.top + 54 }]} pointerEvents="none">
        <LogoMark width={325.6} color={watermarkColor} />
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 37 }]}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.subtitle}>
          <Text style={styles.subtitleLine}>{subtitleLine1}</Text>
          <Text style={[styles.subtitleLine, styles.subtitleHighlight]}>{subtitleLine2}</Text>
        </View>

        <PillButton label={cta} variant="dark" onPress={onPress} trailing={<ArrowRightIcon />} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  watermark: {
    position: 'absolute',
    left: -44,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontWeight: '800',
    fontSize: 30,
    lineHeight: 42,
    color: colors.textMain,
    marginLeft: 12,
  },
  subtitle: {
    marginTop: 16,
    marginLeft: 12,
    marginBottom: 59,
    alignItems: 'flex-start',
  },
  subtitleLine: {
    fontFamily: fontFamily.medium,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 24,
    color: colors.textMain,
  },
  subtitleHighlight: {
    backgroundColor: colors.splashAccent,
  },
});
