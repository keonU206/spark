import type { AiPtConsent, MyProfile, NotificationSettings } from '@/types/api';

/** mock ↔ 실서버 전환 스위치. 백엔드가 붙으면 false로 바꾼다. */
const USE_MOCK = true;

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function notConnected(endpoint: string): never {
  throw new Error(`${endpoint} 아직 연결되지 않음 — services/api/me.ts 참고`);
}

/** 값은 Figma `69:1383` / `69:1650` / `69:1695`에 그려진 것 그대로 */
const profileMock: MyProfile = {
  nickname: '김홈트',
  statusMessage: '오늘도 건강하게 운동 중 🔥',
  avatarUrl: null,
  streakDays: 12,
  monthCompletedCount: 18,
  badgeCount: 5,
  joinedGroupCount: 2,
};

const notificationSettingsMock: NotificationSettings = {
  reminderEnabled: true,
  reminderTime: '오전 8:00',
  friendNudgeEnabled: true,
  groupActivityEnabled: true,
  devicePermissionGranted: true,
};

const aiPtConsentMock: AiPtConsent = {
  cameraPermissionGranted: false,
  poseAnalysisAgreed: false,
};

/** `GET /me` */
export async function getMyProfile(): Promise<MyProfile> {
  if (!USE_MOCK) notConnected('GET /me');
  return delay(profileMock);
}

/** `PATCH /me` — 표시 이름·프로필 사진 변경 */
export async function updateMyProfile(patch: {
  nickname?: string;
  /** 기기에서 고른 이미지의 로컬 경로. 실제 연동 시 업로드 후 URL로 바꾼다 */
  avatarUri?: string;
}): Promise<MyProfile> {
  if (!USE_MOCK) notConnected('PATCH /me');
  return delay({
    ...profileMock,
    nickname: patch.nickname ?? profileMock.nickname,
    avatarUrl: patch.avatarUri ?? profileMock.avatarUrl,
  });
}

/**
 * `DELETE /me` — 계정 삭제.
 * 되돌릴 수 없으므로 호출 전에 반드시 확인 절차를 거친다.
 */
export async function deleteAccount(): Promise<void> {
  if (!USE_MOCK) notConnected('DELETE /me');
  await delay(undefined);
}

/** `GET /me/notification-settings` */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  if (!USE_MOCK) notConnected('GET /me/notification-settings');
  return delay(notificationSettingsMock);
}

/** `PATCH /me/notification-settings` */
export async function updateNotificationSettings(
  patch: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  if (!USE_MOCK) notConnected('PATCH /me/notification-settings');
  return delay({ ...notificationSettingsMock, ...patch });
}

/** `GET /me/consents` */
export async function getAiPtConsent(): Promise<AiPtConsent> {
  if (!USE_MOCK) notConnected('GET /me/consents');
  return delay(aiPtConsentMock);
}

/** `PATCH /me/consents` */
export async function updateAiPtConsent(patch: Partial<AiPtConsent>): Promise<AiPtConsent> {
  if (!USE_MOCK) notConnected('PATCH /me/consents');
  return delay({ ...aiPtConsentMock, ...patch });
}
