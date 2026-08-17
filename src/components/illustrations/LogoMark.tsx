import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

/** Figma 로고 마크 원본 좌표계 */
export const LOGO_VIEWBOX = { width: 128.268, height: 133.742 } as const;

type Props = {
  width?: number;
  color?: string;
};

/**
 * 스파크 로고 마크. Figma `72:2317`(로그인 화면 로고) SVG export 그대로다.
 * 스플래쉬 워터마크도 같은 마크를 확대·색만 바꿔 쓴다.
 */
export function LogoMark({ width = LOGO_VIEWBOX.width, color = colors.main }: Props) {
  const height = (width / LOGO_VIEWBOX.width) * LOGO_VIEWBOX.height;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${LOGO_VIEWBOX.width} ${LOGO_VIEWBOX.height}`}
      fill="none"
    >
      <Circle cx={87.2552} cy={28.56} r={22.6511} stroke={color} strokeWidth={11.8179} />
      <Path
        d="M128.207 61.9391L127.968 62.9976C122.688 85.1119 100.701 99.1011 78.332 94.3556L77.2725 94.1169C55.5092 88.9204 41.6147 67.5432 45.7027 45.5446L45.9145 44.4804C45.9348 44.3848 45.9582 44.29 45.9791 44.1947L57.5402 46.6474C57.519 46.7426 57.4958 46.8375 57.4755 46.9332C54.0092 63.2729 64.4448 79.329 80.7845 82.7955C97.124 86.2617 113.18 75.826 116.647 59.4866C116.667 59.3909 116.685 59.2948 116.704 59.1992L128.264 61.6517C128.244 61.7473 128.227 61.8435 128.207 61.9391Z"
        fill={color}
      />
      <Path
        d="M5.90843 41.7574L56.5699 51.7353"
        stroke={color}
        strokeWidth={11.8179}
      />
      <Path
        d="M77.1006 133.742H27.4629L34.3018 121.924H56.6309L38.5498 90.6063L20.4697 121.924H20.5273L13.6885 133.742H0L38.5508 66.9705L77.1006 133.742Z"
        fill={color}
      />
    </Svg>
  );
}
