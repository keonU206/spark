/**
 * 디자인 토큰 — Figma `iKS9VJhsIwlFGaK9JAcIFB` Section 2(`71:878`)에서 추출.
 * `colors.main` / `bg` / `textMain` / `textSub` / `gray2` / `gray6` 는 Figma 변수 정의 그대로이고,
 * 나머지는 프레임 SVG export에서 읽은 실제 fill 값이다. 눈대중 추정값은 없다.
 */

export const colors = {
  /** 메인 (Figma 변수) */
  main: '#FE6007',
  /** 배경 (Figma 변수) */
  bg: '#FCF7F4',
  /** 폰트 메인 (Figma 변수) — 스플래쉬 CTA 배경으로도 쓰인다 */
  textMain: '#1F2937',
  /** 폰트 보조 (Figma 변수) */
  textSub: '#898989',
  /** Gray2 (Figma 변수) */
  gray2: '#2B2B2B',
  /** Gray6 (Figma 변수) — 인디케이터 비활성 */
  gray6: '#CACACA',
  white: '#FFFFFF',
  black: '#000000',

  /** 스플래쉬 워터마크 로고 + 하이라이트 박스 (`64:398` export 기준) */
  splashAccent: '#FF9051',
  /** 입력 필드 테두리 */
  inputBorder: '#E5E0DC',
  /** 홈 카드 테두리 (`64:592` export 기준) */
  cardBorder: '#ECECEC',
} as const;

/**
 * 폰트.
 *
 * Figma 변수는 `SF Pro Text`(iOS 시스템 폰트)로 잡혀 있으나 Android에는 존재하지 않아
 * 그대로 쓰면 폰트가 깨진다. 현재는 플랫폼 시스템 폰트로 렌더하며,
 * Pretendard 도입 시 이 객체만 채우면 전체에 반영된다.
 * (`assets/fonts/`에 otf 배치 → `app/_layout.tsx`에서 `expo-font`로 로드)
 */
export const fontFamily: {
  regular?: string;
  medium?: string;
  bold?: string;
} = {};

export const typography = {
  /** 스플래쉬·회원가입 대제목 */
  display: { fontSize: 30, lineHeight: 42 },
  /** 온보딩 타이틀 */
  title: { fontSize: 20, lineHeight: 26 },
  /** 온보딩·회원가입 서브카피 */
  body: { fontSize: 14, lineHeight: 21 },
  /** 스플래쉬 서브카피 */
  bodySmall: { fontSize: 13, lineHeight: 24 },
  /** 입력 라벨 */
  label: { fontSize: 13, lineHeight: 17 },
  /** 입력 값 */
  input: { fontSize: 15, lineHeight: 20 },
  /** CTA 버튼 */
  button: { fontSize: 18, lineHeight: 26 },
  /** 보조 버튼 */
  buttonSmall: { fontSize: 14, lineHeight: 20 },
} as const;

export const radius = {
  input: 8,
  pill: 35.5,
  card: 12,
} as const;

/**
 * 시안 프레임 기준값. 모든 화면이 390×844로 그려져 있어
 * 이 값을 기준으로 좌표·크기를 옮긴다.
 */
export const frame = {
  width: 390,
  height: 844,
} as const;

/** 화면 공통 배치 (프레임 좌표 그대로) */
export const layout = {
  /** CTA 버튼 — 모든 화면에서 x=20, y=736, 350×71 */
  cta: { x: 20, y: 736, width: 350, height: 71 },
  /** 온보딩 페이지 인디케이터 y좌표 */
  indicatorY: 768,
  /** 뒤로가기 버튼 */
  back: { x: 13, y: 97, size: 24 },
} as const;
