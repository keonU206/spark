import {
  friendActivitiesMock,
  groupDetailMock,
  groupStatusMock,
  myGroupsMock,
} from '@/services/mock/group';
import { http } from '@/services/http';
import { uploadImage } from '@/services/api/upload';
import type { FriendActivity, GroupDetail, GroupStatus, GroupSummary } from '@/types/api';

/** mock ↔ 실서버 전환 스위치. `.env`의 `EXPO_PUBLIC_USE_MOCK=false`면 실서버로 붙는다. */
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/** `GET /friends/activities` — 친구 = 내가 속한 모든 모임의 멤버 합집합. 내가 맨 앞 */
export async function getFriendActivities(): Promise<FriendActivity[]> {
  if (USE_MOCK) return delay(friendActivitiesMock);
  const { data } = await http.get<FriendActivity[]>('/friends/activities');
  return data;
}

/** `GET /groups/mine` */
export async function getMyGroups(): Promise<GroupSummary[]> {
  if (USE_MOCK) return delay(myGroupsMock);
  const { data } = await http.get<GroupSummary[]>('/groups/mine');
  return data;
}

/** `GET /groups/{id}` */
export async function getGroup(id: string): Promise<GroupDetail> {
  if (USE_MOCK) return delay({ ...groupDetailMock, summary: { ...groupDetailMock.summary, id } });
  const { data } = await http.get<GroupDetail>(`/groups/${id}`);
  return data;
}

/** `GET /groups/{id}/status` — 모임 운동현황(`81:1817`) */
export async function getGroupStatus(id: string): Promise<GroupStatus> {
  if (USE_MOCK) return delay({ ...groupStatusMock, summary: { ...groupStatusMock.summary, id } });
  const { data } = await http.get<GroupStatus>(`/groups/${id}/status`);
  return data;
}

/** `POST /groups` — 모임 만들기(`77:1982`) */
export async function createGroup(name: string): Promise<GroupSummary> {
  if (USE_MOCK) {
    return delay({
      id: `g-${Date.now()}`,
      title: name,
      description: '',
      coverUrl: null,
      memberCount: 1,
      lastActivityLabel: '방금',
    });
  }
  const { data } = await http.post<GroupSummary>('/groups', { name });
  return data;
}

/** `POST /groups/join` — 모임 참여(`77:2170`, 8자리 초대코드) */
export async function joinGroup(inviteCode: string): Promise<GroupSummary> {
  if (USE_MOCK) {
    const group = myGroupsMock[0];
    if (!group) throw new Error('참여할 수 있는 모임이 없어요.');
    void inviteCode;
    return delay(group);
  }
  const { data } = await http.post<GroupSummary>('/groups/join', { inviteCode });
  return data;
}

/**
 * `POST /groups/{groupId}/feed` — 모임 피드에 글 올리기.
 *
 * 별도 작성 화면을 두지 않고 **운동 완료 직후 공유**하는 흐름으로 만들었다.
 * 시안의 피드 글이 "오늘 스쿼트 20개 3세트 완료!"처럼 운동 기록 자체이기 때문이다.
 * 같은 세션을 같은 모임에 다시 공유하면 서버가 409(이미 공유했어요)를 돌려준다.
 */
export async function createFeedPost(input: {
  groupId: string;
  body: string;
  sessionId?: string;
  /** 첨부한 사진의 기기 로컬 경로 — 있으면 업로드 후 URL로 바꿔 보낸다 */
  imageUri?: string;
}): Promise<void> {
  if (USE_MOCK) {
    void input;
    await delay(undefined);
    return;
  }

  let imageUrl: string | undefined;
  if (input.imageUri) {
    imageUrl = input.imageUri.startsWith('http')
      ? input.imageUri
      : await uploadImage(input.imageUri);
  }

  await http.post(`/groups/${input.groupId}/feed`, {
    body: input.body,
    sessionId: input.sessionId,
    imageUrl,
  });
}

/** `DELETE /groups/{groupId}/feed/{postId}` — 내가 쓴 글 삭제 (응원·댓글도 함께 삭제) */
export async function deleteFeedPost(groupId: string, postId: string): Promise<void> {
  if (USE_MOCK) {
    void groupId;
    void postId;
    await delay(undefined);
    return;
  }
  await http.delete(`/groups/${groupId}/feed/${postId}`);
}

/** `POST /groups/{groupId}/feed/{postId}/comments` — 응원 문구 달기 (피드에 댓글로 표시) */
export async function addComment(groupId: string, postId: string, body: string): Promise<void> {
  if (USE_MOCK) {
    void groupId;
    void postId;
    void body;
    await delay(undefined);
    return;
  }
  await http.post(`/groups/${groupId}/feed/${postId}/comments`, { body });
}

/** `POST /groups/{groupId}/feed/{postId}/cheer` — 응원 보내기 (다시 누르면 취소) */
export async function cheerPost(groupId: string, postId: string): Promise<void> {
  if (USE_MOCK) {
    void groupId;
    void postId;
    await delay(undefined);
    return;
  }
  await http.post(`/groups/${groupId}/feed/${postId}/cheer`);
}

export type ReceivedNudge = {
  id: string;
  /** "최지호님이 재촉했어요! 오늘도 운동해볼까요? 🔥" — 문구는 서버가 만든다 */
  message: string;
  groupId: string | null;
};

/** `GET /nudges/received` — 아직 확인 안 한 받은 재촉 (홈 배너) */
export async function getReceivedNudges(): Promise<ReceivedNudge[]> {
  if (USE_MOCK) return delay([]);
  const { data } = await http.get<ReceivedNudge[]>('/nudges/received');
  return data;
}

export type NudgeInboxItem = {
  id: string;
  message: string;
  /** "오늘" / "어제" / "3일 전" */
  whenLabel: string;
  /** 아직 확인 전이면 false — 목록에서 강조 표시 */
  seen: boolean;
};

/** `GET /nudges/inbox` — 받은 재촉 이력 (알림함) */
export async function getNudgeInbox(): Promise<NudgeInboxItem[]> {
  if (USE_MOCK) return delay([]);
  const { data } = await http.get<NudgeInboxItem[]>('/nudges/inbox');
  return data;
}

/** `POST /nudges/received/ack` — 배너 닫기·알림함 열기(전부 확인 처리) */
export async function ackReceivedNudges(): Promise<void> {
  if (USE_MOCK) {
    await delay(undefined);
    return;
  }
  await http.post('/nudges/received/ack');
}

/** `POST /nudges` — 재촉하기 / 잡도리 / 깨우기 공통. 같은 대상에게 하루 1회 */
export async function sendNudge(targetUserId: string): Promise<void> {
  if (USE_MOCK) {
    void targetUserId;
    await delay(undefined);
    return;
  }
  await http.post('/nudges', { targetUserId });
}
