import { http } from '@/services/http';
import type { AiPtConsent, MyProfile, NotificationSettings } from '@/types/api';

/** mock ↔ 실서버 전환 스위치. `.env`의 `EXPO_PUBLIC_USE_MOCK=false`면 실서버로 붙는다. */
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
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
  if (USE_MOCK) return delay(profileMock);
  const { data } = await http.get<MyProfile>('/me');
  return data;
}

/**
 * 이미지 업로드 — 프로필 사진용.
 * 기기 로컬 경로(file://)를 서버가 이해하지 못하므로, 먼저 올려서 URL을 받는다.
 */
async function uploadImage(localUri: string): Promise<string> {
  const formData = new FormData();
  const filename = localUri.split('/').pop() ?? 'avatar.jpg';
  const ext = filename.includes('.') ? filename.split('.').pop() : 'jpg';
  // React Native의 FormData는 { uri, name, type } 객체를 파일로 처리한다
  formData.append('file', {
    uri: localUri,
    name: filename,
    type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  } as unknown as Blob);

  const { data } = await http.post<{ url: string }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}

/** `PATCH /me` — 표시 이름·프로필 사진 변경 */
export async function updateMyProfile(patch: {
  nickname?: string;
  /** 기기에서 고른 이미지의 로컬 경로. 서버 연동 시 업로드 후 URL로 바뀐다 */
  avatarUri?: string;
}): Promise<MyProfile> {
  if (USE_MOCK) {
    return delay({
      ...profileMock,
      nickname: patch.nickname ?? profileMock.nickname,
      avatarUrl: patch.avatarUri ?? profileMock.avatarUrl,
    });
  }

  // 로컬 파일이면 먼저 업로드해 공개 URL로 바꾼다
  let avatarUri = patch.avatarUri;
  if (avatarUri && !avatarUri.startsWith('http')) {
    avatarUri = await uploadImage(avatarUri);
  }

  const { data } = await http.patch<MyProfile>('/me', {
    nickname: patch.nickname,
    avatarUri,
  });
  return data;
}

/**
 * `DELETE /me` — 계정 삭제.
 * 되돌릴 수 없으므로 호출 전에 반드시 확인 절차를 거친다.
 */
export async function deleteAccount(): Promise<void> {
  if (USE_MOCK) {
    await delay(undefined);
    return;
  }
  await http.delete('/me');
}

/** `GET /me/notification-settings` */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  if (USE_MOCK) return delay(notificationSettingsMock);
  const { data } = await http.get<NotificationSettings>('/me/notification-settings');
  return data;
}

/** `PATCH /me/notification-settings` */
export async function updateNotificationSettings(
  patch: Partial<NotificationSettings>,
): Promise<NotificationSettings> {
  if (USE_MOCK) return delay({ ...notificationSettingsMock, ...patch });
  const { data } = await http.patch<NotificationSettings>('/me/notification-settings', patch);
  return data;
}

/** `GET /me/consents` */
export async function getAiPtConsent(): Promise<AiPtConsent> {
  if (USE_MOCK) return delay(aiPtConsentMock);
  const { data } = await http.get<AiPtConsent>('/me/consents');
  return data;
}

/** `PATCH /me/consents` */
export async function updateAiPtConsent(patch: Partial<AiPtConsent>): Promise<AiPtConsent> {
  if (USE_MOCK) return delay({ ...aiPtConsentMock, ...patch });
  const { data } = await http.patch<AiPtConsent>('/me/consents', patch);
  return data;
}
