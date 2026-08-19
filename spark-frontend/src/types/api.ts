/**
 * API 계약.
 *
 * **이 파일이 백엔드 인계 지점이다.** 화면은 여기 정의된 타입만 알고,
 * 실제 통신은 `services/api/*`가 담당한다. 백엔드가 붙으면 `services/`의
 * mock 구현만 HTTP 호출로 갈아끼우면 되고 화면 코드는 손대지 않는다.
 */

/** 홈 히어로의 오늘의 추천 루틴 */
export type RecommendedRoutine = {
  id: string;
  /** 예: "목/어깨 스트레칭 + 코어강화" */
  name: string;
  exerciseCount: number;
  estimatedMinutes: number;
};

/** 홈·커뮤니티의 친구 운동 현황 한 줄 */
export type FriendActivity = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  /** 예: "3일째 운동 완료 ✅" / "최신 운동 기록이 없어요 .." — 문구는 서버가 만든다 */
  statusLabel: string;
  /** 본인이면 "나" 배지가 붙고 재촉 버튼이 없다 */
  isMe: boolean;
  canNudge: boolean;
};

export type Weekday = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export type DayAttendance = {
  weekday: Weekday;
  completed: boolean;
};

/* ------------------------------------------------------------------ */
/* 운동 · 루틴                                                          */
/* ------------------------------------------------------------------ */

export type ExerciseCategory = {
  id: string;
  /** 칩에 노출되는 이름. 예: "스쿼트" */
  name: string;
};

export type Exercise = {
  id: string;
  categoryId: string;
  /** 목록에 노출되는 카테고리 이름 (조인 결과) */
  categoryName: string;
  name: string;
  thumbnailUrl: string | null;
  /** 예: "좌우 8~10회" — 표기 문자열은 서버가 만든다 */
  repsLabel: string;
  sets: number;
  durationMinutes: number;
};

export type Routine = {
  id: string;
  name: string;
  exerciseCount: number;
  estimatedMinutes: number;
  thumbnailUrl: string | null;
  /** 진행 화면이 순서대로 소비한다 */
  exercises: Exercise[];
};

/** `GET /exercises` 무한 스크롤 응답 */
export type ExercisePage = {
  items: Exercise[];
  /** 다음 페이지 커서. null이면 끝 */
  nextCursor: string | null;
};

/* ------------------------------------------------------------------ */
/* 운동 세션 (기록의 원천)                                              */
/* ------------------------------------------------------------------ */

export type SessionExerciseStatus = 'pending' | 'completed' | 'skipped';

export type SessionExercise = {
  exerciseId: string;
  name: string;
  status: SessionExerciseStatus;
};

/** `POST /sessions/{id}/complete` 응답 — 루틴 완료 화면(`81:1505`)이 그대로 쓴다 */
export type SessionResult = {
  sessionId: string;
  exercises: SessionExercise[];
  monthly: {
    /** 완료 루틴 (일) */
    completedRoutines: number;
    /** 중단 횟수 */
    abortedCount: number;
    /** 평균 시간 (분) */
    averageMinutes: number;
  };
};

/* ------------------------------------------------------------------ */
/* 내 운동 현황 (`81:887`)                                              */
/* ------------------------------------------------------------------ */

export type MonthlyAttendance = {
  /** "2026-07" */
  month: string;
  /** 운동한 날짜 (1~31) */
  completedDays: number[];
};

export type MyStatus = {
  /** 연속 운동일 */
  streakDays: number;
  /** 이번 달 완료 일수 */
  monthCompletedDays: number;
  attendance: MonthlyAttendance;
};

/* ------------------------------------------------------------------ */
/* 모임 (`77:1506` 커뮤니티 / `87:813` 상세 / `77:1982` 생성 / `77:2170` 참여)   */
/* ------------------------------------------------------------------ */

export type GroupSummary = {
  id: string;
  /**
   * 카드 제목. 시안은 모임명이 아니라 멤버 이름을 나열한다
   * ("유승연,김채린,고예원,김…") — 단톡방식 표기다.
   */
  title: string;
  /** 모임 소개문. 예: "우리 진짜 거북목 되지 말자" */
  description: string;
  coverUrl: string | null;
  memberCount: number;
  /** 예: "2일전" — 표기 문자열은 서버가 만든다 */
  lastActivityLabel: string;
  /** 8자리 초대코드 — 멤버 추가(+)가 이 코드를 보여준다. mock에는 없을 수 있다 */
  inviteCode?: string;
};

export type GroupMember = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
};

export type FeedReaction = {
  emoji: string;
  count: number;
};

export type FeedComment = {
  userId: string;
  nickname: string;
  body: string;
};

export type FeedPost = {
  id: string;
  author: GroupMember;
  /** 예: "2026.08.23 · 오후 6:30" */
  createdAtLabel: string;
  imageUrl: string | null;
  body: string;
  reactions: FeedReaction[];
  comments: FeedComment[];
  /** 본인 글에는 응원 버튼이 없다 */
  canCheer: boolean;
};

export type GroupDetail = {
  summary: GroupSummary;
  members: GroupMember[];
  feed: FeedPost[];
};

/**
 * 모임 출석 캘린더의 하루 (`81:1817`)
 * 시안에서 칸마다 주황 농도가 다르다 — 그날 운동한 멤버 비율로 본다.
 */
export type GroupDayAttendance = {
  day: number;
  /** 0~1. 0이면 칠하지 않는다 */
  intensity: number;
  /** 그날 운동한 멤버 닉네임 — 날짜를 누르면 보여준다. mock에는 없을 수 있다 */
  members?: string[];
};

export type GroupMemberStatus = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  /** 예: "3일째 운동 완료 ✅" — 문구는 서버가 만든다 */
  statusLabel: string;
  canNudge: boolean;
};

/** `GET /groups/{id}/status` — 모임 운동현황(`81:1817`) 화면 */
export type GroupStatus = {
  summary: GroupSummary;
  attendance: {
    /** "2026-07" */
    month: string;
    days: GroupDayAttendance[];
  };
  members: GroupMemberStatus[];
};

/* ------------------------------------------------------------------ */
/* 기록 · 통계 (`69:1437` / `69:727` / `69:1533`)                        */
/* ------------------------------------------------------------------ */

export type RecentSession = {
  id: string;
  routineName: string;
  /** 예: "오늘" / "어제" / "3일 전" — 표기 문자열은 서버가 만든다 */
  whenLabel: string;
  minutes: number;
  completedCount: number;
  skippedCount: number;
};

/** `GET /stats/summary` — 운동 기록/통계(`69:1437`) 화면 */
export type WorkoutStats = {
  totalSessions: number;
  totalHours: number;
  streakDays: number;
  /** 이번 달 최장 연속 기록 */
  monthBestStreak: number;
  weeklyAttendance: DayAttendance[];
  monthly: {
    completedRoutines: number;
    skippedExercises: number;
    averageMinutes: number;
  };
  recent: RecentSession[];
};

export type Achievement = {
  id: string;
  title: string;
  /** 예: "7일 연속 완료" */
  subtitle: string;
};

/** `GET /stats/streak` — 연속 출석 현황(`69:727`) */
export type StreakDetail = {
  currentStreakDays: number;
  monthCompletedCount: number;
  /** 카드 하단 격려 문구 */
  message: string;
  attendance: {
    month: string;
    days: GroupDayAttendance[];
  };
  achievements: Achievement[];
};

export type BadgeState = 'earned' | 'inProgress' | 'locked';

export type Badge = {
  id: string;
  name: string;
  state: BadgeState;
  /** 예: "획득 완료" / "14/21일" / "조건 미충족" */
  statusLabel: string;
  iconUrl: string | null;
};

/** `GET /badges` — 배지 목록(`69:1533`) */
export type BadgeList = {
  earned: Badge[];
  inProgress: Badge[];
  locked: Badge[];
};

/* ------------------------------------------------------------------ */
/* 마이 (`69:1383` / `69:1603` / `69:1650` / `69:1695`)                  */
/* ------------------------------------------------------------------ */

/** `GET /me` — 마이페이지(`69:1383`) */
export type MyProfile = {
  nickname: string;
  /** 예: "오늘도 건강하게 운동 중 🔥" */
  statusMessage: string;
  avatarUrl: string | null;
  streakDays: number;
  monthCompletedCount: number;
  badgeCount: number;
  /** 프로필 편집의 "참여 중인 모임 N개" */
  joinedGroupCount: number;
};

/** `GET/PATCH /me/notification-settings` (`69:1650`) */
export type NotificationSettings = {
  reminderEnabled: boolean;
  /** 예: "오전 8:00" */
  reminderTime: string;
  friendNudgeEnabled: boolean;
  groupActivityEnabled: boolean;
  /** 기기 알림 권한 — 앱에서 바꿀 수 없고 상태만 보여준다 */
  devicePermissionGranted: boolean;
};

/** `GET/PATCH /me/consents` (`69:1695`) */
export type AiPtConsent = {
  /** 기기 카메라 권한 — 앱에서 바꿀 수 없고 상태만 보여준다 */
  cameraPermissionGranted: boolean;
  poseAnalysisAgreed: boolean;
};

/** `GET /home` — 홈 화면 1회 로드로 완성되는 응답 */
export type HomeSummary = {
  /** 연속 출석 일수 (파생값이므로 서버 계산) */
  streakDays: number;
  recommendedRoutine: RecommendedRoutine;
  friendActivities: FriendActivity[];
  /** 월~일 7개 고정 */
  weeklyAttendance: DayAttendance[];
};
