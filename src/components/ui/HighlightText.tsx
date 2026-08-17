import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { colors, fontFamily } from '@/theme/tokens';

/**
 * 문장 일부만 메인 컬러로 강조하는 텍스트.
 * 시안의 온보딩·회원가입 타이틀이 전부 이 패턴이다.
 * (예: "바쁜 **당신**에게, **딱 맞는 운동**")
 */
export type TextSegment = {
  readonly text: string;
  readonly accent?: boolean;
};

type Props = {
  segments: readonly TextSegment[];
  style?: StyleProp<TextStyle>;
  accentColor?: string;
};

export function HighlightText({ segments, style, accentColor = colors.main }: Props) {
  return (
    <Text style={[styles.base, style]}>
      {segments.map((segment, i) => (
        <Text key={i} style={segment.accent ? { color: accentColor } : undefined}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamily.bold,
    color: colors.textMain,
    fontWeight: '800',
  },
});
