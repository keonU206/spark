import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

/**
 * 온보딩 3종 일러스트.
 *
 * 좌표는 전부 Figma 프레임(390×844) 로컬 좌표계 그대로다.
 * (프레임 SVG export가 424×878 = 390×844 + 사방 17px 여백이라 17을 뺀 값)
 * 각 컴포넌트의 viewBox가 그 좌표 영역을 그대로 잘라낸다.
 */

const STROKE = 12;

type ArtProps = { width: number };

/* ------------------------------------------------------------------ */
/* 온보딩1 — 바쁜 당신에게, 딱 맞는 운동                                */
/* ------------------------------------------------------------------ */

const ART1 = { x: 58, y: 383, width: 305, height: 274 };

export function OnboardingArt1({ width }: ArtProps) {
  const height = (width / ART1.width) * ART1.height;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`${ART1.x} ${ART1.y} ${ART1.width} ${ART1.height}`}
      fill="none"
    >
      {/* 아이보리 판 */}
      <Rect x={70} y={390} width={259} height={259} fill={colors.main} fillOpacity={0.1} />

      {/* 판 네 귀퉁이의 브래킷 */}
      <Path d="M70 391H134" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M70 385V449" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M323 390V429" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M329 390H265" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M329 648H265" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M329 654V590" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M70 649V585" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M64 649H128" stroke={colors.main} strokeWidth={STROKE} />

      {/* 우상단 루틴 카드 */}
      <Path d="M265 434.5H357" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M265 503H357" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M271 503V429" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M351 503V429" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M290 457H331.5" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M290 480H311" stroke={colors.main} strokeWidth={STROKE} />

      {/* 로고 마크 */}
      <G transform="translate(119 466) scale(0.9979)">
        <Circle cx={87.2552} cy={28.56} r={22.6511} stroke={colors.main} strokeWidth={11.8179} />
        <Path
          d="M128.207 61.9391L127.968 62.9976C122.688 85.1119 100.701 99.1011 78.332 94.3556L77.2725 94.1169C55.5092 88.9204 41.6147 67.5432 45.7027 45.5446L45.9145 44.4804C45.9348 44.3848 45.9582 44.29 45.9791 44.1947L57.5402 46.6474C57.519 46.7426 57.4958 46.8375 57.4755 46.9332C54.0092 63.2729 64.4448 79.329 80.7845 82.7955C97.124 86.2617 113.18 75.826 116.647 59.4866C116.667 59.3909 116.685 59.2948 116.704 59.1992L128.264 61.6517C128.244 61.7473 128.227 61.8435 128.207 61.9391Z"
          fill={colors.main}
        />
        <Path d="M5.90843 41.7574L56.5699 51.7353" stroke={colors.main} strokeWidth={11.8179} />
        <Path
          d="M77.1006 133.742H27.4629L34.3018 121.924H56.6309L38.5498 90.6063L20.4697 121.924H20.5273L13.6885 133.742H0L38.5508 66.9705L77.1006 133.742Z"
          fill={colors.main}
        />
      </G>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* 온보딩2 — AI를 통해 내 운동을 보다 똑똑하게                          */
/* ------------------------------------------------------------------ */

const ART2 = { x: 60, y: 345, width: 270, height: 370 };
/** `82:2663` 그룹의 프레임 로컬 원점 */
const ART2_ORIGIN = { x: 67.5065, y: 355.0008 };

export function OnboardingArt2({ width }: ArtProps) {
  const height = (width / ART2.width) * ART2.height;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`${ART2.x} ${ART2.y} ${ART2.width} ${ART2.height}`}
      fill="none"
    >
      {/* 차트 안쪽 강조 바 */}
      <Rect x={128} y={452} width={151} height={37} fill={colors.main} fillOpacity={0.5} />

      <G transform={`translate(${ART2_ORIGIN.x} ${ART2_ORIGIN.y})`}>
        {/* 차트 프레임 */}
        <Path d="M55.4325 95.6032L217.586 95.6033" stroke={colors.main} strokeWidth={15.2018} />
        <Path d="M55.4325 133.61L217.586 133.61" stroke={colors.main} strokeWidth={15.2018} />
        <Path d="M55.4325 242.553L217.586 242.553" stroke={colors.main} strokeWidth={15.2018} />
        <Path
          d="M3.49262 228.62L95.3371 175.413L131.441 198.849L183.381 175.413"
          stroke={colors.main}
          strokeWidth={13.935}
        />
        <Path d="M61.7648 88.0004L61.7648 161.476" stroke={colors.main} strokeWidth={15.2018} />
        <Path d="M211.25 88.0004L211.25 250.153" stroke={colors.main} strokeWidth={15.2018} />

        {/* 좌상단 반짝임 */}
        <Path d="M3.49262 31.2441H65.9926" stroke={colors.main} strokeWidth={12} />
        <Path d="M56.8364 53.3496L12.6422 9.15544" stroke={colors.main} strokeWidth={12} />
        <Path d="M12.642 53.3418L56.8362 9.14762" stroke={colors.main} strokeWidth={12} />
        <Path d="M34.7377 62.5L34.7377 0" stroke={colors.main} strokeWidth={12} />

        {/* 십자 2개 */}
        <Path d="M82.4926 42.9961H122.493" stroke={colors.main} strokeWidth={12} />
        <Path d="M102.49 63L102.49 23" stroke={colors.main} strokeWidth={11} />
        <Path d="M130.493 329.996H170.493" stroke={colors.main} strokeWidth={12} />
        <Path d="M150.49 350L150.49 310" stroke={colors.main} strokeWidth={11} />

        {/* 우하단 반짝임 */}
        <Path d="M189.493 306.244H251.993" stroke={colors.main} strokeWidth={12} />
        <Path d="M242.836 328.35L198.642 284.155" stroke={colors.main} strokeWidth={12} />
        <Path d="M198.642 328.342L242.836 284.148" stroke={colors.main} strokeWidth={12} />
        <Path d="M220.738 337.5L220.738 275" stroke={colors.main} strokeWidth={12} />
      </G>
    </Svg>
  );
}

/* ------------------------------------------------------------------ */
/* 온보딩3 — 친구와 함께 습관화하는 운동                                */
/* ------------------------------------------------------------------ */

const ART3 = { x: 56, y: 392, width: 278, height: 250 };

/** 사람 1명 (101.333 × 122.445). 원 중심은 그룹 기준 (51.5111, 32.0893). */
function Person({ x, y }: { x: number; y: number }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      <Circle cx={51.5111} cy={32.0893} r={26.0889} stroke={colors.main} strokeWidth={STROKE} />
      <Path
        d="M51.3213 71.7821C79.002 72.1326 101.333 94.6813 101.333 122.445H89.333C89.333 101.09 72.0219 83.7784 50.667 83.7782C29.312 83.7782 12 101.09 12 122.445H0C0 94.4628 22.6846 71.7782 50.667 71.7782L51.3213 71.7821Z"
        fill={colors.main}
      />
    </G>
  );
}

export function OnboardingArt3({ width }: ArtProps) {
  const height = (width / ART3.width) * ART3.height;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`${ART3.x} ${ART3.y} ${ART3.width} ${ART3.height}`}
      fill="none"
    >
      {/* 덤벨 */}
      <Path d="M162 435H224" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M165 404V466" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M224 404V466" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M147 412V457" stroke={colors.main} strokeWidth={STROKE} />
      <Path d="M242 412V457" stroke={colors.main} strokeWidth={STROKE} />

      {/* 가운데 사람이 뒤, 양옆이 앞 */}
      <Person x={143.911} y={513.332} />
      <Person x={62} y={488} />
      <Person x={226.666} y={488} />
    </Svg>
  );
}

export const ONBOARDING_ART = [OnboardingArt1, OnboardingArt2, OnboardingArt3] as const;

/** 각 일러스트의 시안상 가로 크기 (390 프레임 기준) */
export const ONBOARDING_ART_WIDTH = [ART1.width, ART2.width, ART3.width] as const;
