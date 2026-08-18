import Svg, { G, Path } from 'react-native-svg';

import { colors } from '@/theme/tokens';

type IconProps = {
  size?: number;
  color?: string;
};

/** 스플래쉬 CTA의 오른쪽 화살표 (`ep:right`) */
export function ArrowRightIcon({ size = 23, color = colors.main }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 12H20M20 12L13.5 5.5M20 12L13.5 18.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 회원가입 헤더의 뒤로가기 (`mingcute:right-line` 을 좌향으로 배치) */
export function ChevronLeftIcon({ size = 24, color = colors.textMain }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 5L8 12L15 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 설문조사 선택 필드 오른쪽의 펼침 표시 */
export function ChevronDownIcon({ size = 24, color = colors.gray6 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9.5L12 15.5L18 9.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 로그인 이메일 입력 아이콘 */
export function MailIcon({ size = 18, color = colors.textSub }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7.5C3 6.39543 3.89543 5.5 5 5.5H19C20.1046 5.5 21 6.39543 21 7.5V16.5C21 17.6046 20.1046 18.5 19 18.5H5C3.89543 18.5 3 17.6046 3 16.5V7.5Z"
        stroke={color}
        strokeWidth={1.6}
      />
      <Path
        d="M4 7L12 12.5L20 7"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** 로그인 비밀번호 입력 아이콘 */
export function KeyIcon({ size = 18, color = colors.textSub }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15.5 3.5C18.2614 3.5 20.5 5.73858 20.5 8.5C20.5 11.2614 18.2614 13.5 15.5 13.5C14.9584 13.5 14.4368 13.4139 13.9482 13.2544L11.5 15.7026H9.5V17.7026H7.5V19.7026H4V16.2026L10.7456 9.45703C10.5861 8.96843 10.5 8.44684 10.5 7.90527C10.5 5.42 12.5147 3.5 15.5 3.5Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M16.5 7.5H16.51" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * 구글 로고. Figma `72:2457`(구글로 로그인하기 버튼) SVG export 그대로다.
 * 원본 4개 벡터를 아이콘 원점(135.0004, 602.9993) 기준으로 옮겨 합쳤다.
 */
export function GoogleIcon({ size = 16 }: { size?: number }) {
  const scale = size / 12.7484;

  return (
    <Svg width={12.5123 * scale} height={size} viewBox="0 0 12.5123 12.7484" fill="none">
      <Path
        d="M12.4303 5.35002C12.4095 5.21944 12.2952 5.12582 12.1629 5.12582H11.8999C11.8926 5.12582 11.8867 5.1199 11.8867 5.11259C11.8867 5.10529 11.8808 5.09936 11.8735 5.09936H7.53101C6.82693 5.09936 6.25616 5.67013 6.25616 6.37421C6.25616 7.07828 6.82693 7.64905 7.53101 7.64905H7.72557C8.73639 7.64905 9.40864 8.68109 8.6341 9.3306C7.9874 9.8729 7.15967 10.1987 6.25616 10.1987C4.18318 10.1987 2.50247 8.4863 2.50247 6.37421C2.50247 4.26211 4.18318 2.54968 6.25616 2.54968C6.77628 2.54968 7.27089 2.65835 7.7205 2.85402C8.34926 3.12767 9.12599 3.13152 9.60632 2.64213C10.1063 2.13275 10.0966 1.29889 9.48994 0.922884C8.54678 0.338319 7.4411 0 6.25616 0C2.8012 0 0 2.85405 0 6.37421C0 9.89436 2.8012 12.7484 6.25616 12.7484C9.71113 12.7484 12.5123 9.89436 12.5123 6.37421C12.5123 6.02544 12.4836 5.68347 12.4303 5.35002Z"
        fill="#FFC107"
      />
      <G transform="translate(0.7217 0)">
        <Path
          d="M0.187548 2.55056C-0.158063 3.01958 -0.00290266 3.66306 0.463802 4.01179C1.09208 4.48125 2.0039 4.20628 2.55703 3.65025C3.23396 2.96976 4.1632 2.54968 5.18968 2.54968C5.70979 2.54968 6.2044 2.65835 6.65401 2.85402C7.28277 3.12767 8.0595 3.13152 8.53983 2.64213C9.03978 2.13275 9.03011 1.29889 8.42345 0.922884C7.48029 0.338319 6.37461 0 5.18968 0C3.14333 0 1.32836 1.0024 0.187548 2.55056Z"
          fill="#FF3D00"
        />
      </G>
      <G transform="translate(0.6866 3.2364)">
        <Path
          d="M5.25167 4.32582C6.34089 4.32582 7.36303 4.03955 8.25362 3.53915C8.94039 3.15327 8.9231 2.22015 8.32647 1.70575C7.85133 1.29611 7.15952 1.30418 6.57424 1.53004C6.1544 1.69206 5.70651 1.7765 5.25167 1.77614C4.20108 1.77614 3.25285 1.33547 2.57265 0.62612C2.01698 0.0466336 1.0675 -0.242351 0.435982 0.253393C-0.00268528 0.59775 -0.147329 1.21099 0.174039 1.66677C1.30872 3.27602 3.15835 4.32582 5.25167 4.32582Z"
          fill="#4CAF50"
        />
      </G>
      <G transform="translate(6.2559 5.0997)">
        <Path
          d="M6.17418 0.250652C6.15333 0.120074 6.03902 0.026453 5.90679 0.026453H5.64378C5.63647 0.026453 5.63055 0.0205313 5.63055 0.0132265C5.63055 0.00592171 5.62463 0 5.61732 0H1.27484C0.570765 0 0 0.570766 0 1.27484C0 1.97892 0.570766 2.54968 1.27484 2.54968H1.46797C2.47879 2.54968 3.15088 3.5828 2.37504 4.23075C2.33644 4.26299 2.29716 4.29449 2.25722 4.32522C2.25778 4.32484 2.25852 4.32488 2.25902 4.32532L3.0452 5.00314C3.65792 5.53141 4.72984 5.54378 5.17836 4.87049C5.70953 4.07316 6.25617 2.86397 6.25617 1.27484C6.25617 0.926076 6.22742 0.584103 6.17418 0.250652Z"
          fill="#1976D2"
        />
      </G>
    </Svg>
  );
}
