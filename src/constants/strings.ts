/**
 * 화면 문구 모음.
 *
 * 시안 캔버스 메모에 "로고/네이밍 → 네이밍 정하면 앱 내 이름들 바꾸기"가 남아 있어,
 * 서비스명이 바뀌어도 한 곳만 고치면 되도록 문구를 전부 여기로 모았다.
 */

export const BRAND = '스파크';

export const strings = {
  splash: {
    title: '오늘도\n움직여볼까요?',
    // 시안에는 "채린님과"로 박혀 있으나, 스플래쉬는 로그인 이전 화면이라
    // 사용자 이름을 알 수 없다. 확정 문구는 "당신과".
    subtitleLine1: `${BRAND}가 당신과 어울리는`,
    subtitleLine2: '운동 루틴을 제공해드릴게요!',
    cta: '시작하기',
  },

  onboarding: {
    pages: [
      {
        key: 'routine',
        title: [
          { text: '바쁜 ' },
          { text: '당신', accent: true },
          { text: '에게,\n' },
          { text: '딱 맞는 운동', accent: true },
        ],
        subtitle: '짧고 간단하게\n홈트를 시작해보세요.',
      },
      {
        key: 'ai',
        title: [
          { text: 'AI', accent: true },
          { text: '를 통해\n내 ' },
          { text: '운동', accent: true },
          { text: '을 보다 ' },
          { text: '똑똑', accent: true },
          { text: '하게' },
        ],
        subtitle: '자세를 분석하고\n더 안전한 운동을 도와드려요.',
      },
      {
        key: 'friends',
        title: [
          { text: '친구', accent: true },
          { text: '와 함께\n' },
          { text: '습관화', accent: true },
          { text: '하는 운동' },
        ],
        subtitle: '친구와 함께하고\n서로 독려하면서 운동해요.',
      },
    ],
    cta: '운동하기',
  },

  login: {
    emailPlaceholder: 'Your email',
    passwordPlaceholder: 'Password',
    submit: '로그인',
    divider: 'or',
    google: '구글로 로그인하기',
    toSignup: '회원가입하기',
  },

  signup: {
    account: {
      title: [
        { text: BRAND, accent: true },
        { text: '와 함께\n운동을 시작해요.' },
      ],
      subtitle: '이메일과 비밀번호로\n자신의 홈트 루틴을 시작하세요!',
      email: '이메일',
      password: '비밀번호',
      passwordConfirm: '비밀번호 확인',
      cta: '생성하기',
    },
    name: {
      title: [
        { text: '이름을', accent: true },
        { text: '\n알려주세요!' },
      ],
      subtitle: `${BRAND}에서 쓸 이름을\n정해주세요!`,
      name: '이름',
      cta: '생성하기',
    },
  },

  /**
   * 초기 설문 — Figma `72:2466`(빈 상태) / `75:3079`(선택된 상태)
   *
   * 선택지 목록은 시안에 없다. 시안에 보이는 값(매우 낮음 / 거의 없음 / 10분 이내 / 가볍게)이
   * 각 항목의 첫 번째 선택지이고, 나머지는 그 흐름에 맞춰 채웠다. 확정되면 여기만 고치면 된다.
   */
  survey: {
    title: [
      { text: '자신의 ' },
      { text: '상태', accent: true },
      { text: '를\n알려주세요!' },
    ],
    subtitle: '입력한 정보를 바탕으로\n오늘에 맞는 루틴을 추천해요.',
    placeholder: '선택해주세요.',
    fields: [
      {
        key: 'fitnessLevel',
        label: [{ text: '현재 ' }, { text: '체력', accent: true }, { text: ' 수준' }],
        options: ['매우 낮음', '낮음', '보통', '높음', '매우 높음'],
      },
      {
        key: 'activityLevel',
        label: [{ text: '평소 ' }, { text: '활동량', accent: true }],
        options: ['거의 없음', '주 1~2회', '주 3~4회', '주 5회 이상'],
      },
      {
        key: 'availableTime',
        label: [{ text: '운동 가능 시간 (' }, { text: '하루', accent: true }, { text: ' 기준)' }],
        options: ['10분 이내', '10~20분', '20~30분', '30분 이상'],
      },
      {
        key: 'intensity',
        label: [{ text: '운동 ' }, { text: '강도', accent: true }, { text: ' 선호' }],
        options: ['가볍게', '보통', '강하게'],
      },
    ],
    pain: {
      title: [{ text: '통증 및 ' }, { text: '불편', accent: true }, { text: ' 부위' }],
      subtitle: '통증이 있는 부위를 선택해주세요.',
      /** `none`은 나머지와 동시에 선택될 수 없다 */
      options: [
        { key: 'neckShoulder', label: '목 / 어깨' },
        { key: 'lowerBack', label: '허리' },
        { key: 'kneeLeg', label: '무릎 / 다리' },
        { key: 'wristElbow', label: '손목 / 팔꿈치' },
        { key: 'none', label: '통증 없음' },
      ],
    },
    cta: '시작하기',
  },

  /** 홈 — Figma `64:592` */
  home: {
    heroTitle: "Today's\nWellness Routine",
    routineMeta: (count: number, minutes: number) => `${count}개 운동 · 약 ${minutes}분`,
    start: '시작하기',
    // 시안: "🔥 2일" 진하게 → "연속 출석" 메인 컬러 → "중!" 진하게
    streakLabel: '연속 출석',
    streakSuffix: ' 중!',
    streakSub: '오늘도 몸을 깨워봐요!',
    friends: {
      title: '친구의 운동 현황',
      subtitle: '내 친구의 운동을 응원해봐요',
    },
    myStatus: {
      title: '내 운동 현황',
      subtitle: '얼마나 운동했는지 확인해봐요',
    },
  },

  /** 설문 완료 — Figma `75:2804` */
  ready: {
    title: '준비가\n끝났어요!',
    subtitleLine1: `이제 ${BRAND}와 함께`,
    subtitleLine2: '홈트해봐요!',
    cta: '시작하기',
  },
} as const;

/** 화면에 노출되는 유효성 안내 문구 */
export const validation = {
  emailRequired: '이메일을 입력해주세요.',
  emailInvalid: '이메일 형식이 올바르지 않아요.',
  passwordRequired: '비밀번호를 입력해주세요.',
  passwordTooShort: '비밀번호는 8자 이상이어야 해요.',
  passwordMismatch: '비밀번호가 서로 달라요.',
  nameRequired: '이름을 입력해주세요.',
  // placeholder가 "선택해주세요."라서, 같은 문장을 쓰면 위아래로 두 번 보인다
  surveyFieldRequired: '아직 고르지 않았어요.',
  surveyPainRequired: '통증 부위를 선택해주세요. 없으면 "통증 없음"을 골라주세요.',
} as const;
