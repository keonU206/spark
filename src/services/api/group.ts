import {
  friendActivitiesMock,
  groupDetailMock,
  groupStatusMock,
  myGroupsMock,
} from '@/services/mock/group';
import type { FriendActivity, GroupDetail, GroupStatus, GroupSummary } from '@/types/api';

/** mock ↔ 실서버 전환 스위치. 백엔드가 붙으면 false로 바꾼다. */
const USE_MOCK = true;

function delay<T>(value: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function notConnected(endpoint: string): never {
  throw new Error(`${endpoint} 아직 연결되지 않음 — services/api/group.ts 참고`);
}

/** `GET /friends/activities` */
export async function getFriendActivities(): Promise<FriendActivity[]> {
  if (!USE_MOCK) notConnected('GET /friends/activities');
  return delay(friendActivitiesMock);
}

/** `GET /groups/mine` */
export async function getMyGroups(): Promise<GroupSummary[]> {
  if (!USE_MOCK) notConnected('GET /groups/mine');
  return delay(myGroupsMock);
}

/** `GET /groups/{id}` */
export async function getGroup(id: string): Promise<GroupDetail> {
  if (!USE_MOCK) notConnected('GET /groups/{id}');
  return delay({ ...groupDetailMock, summary: { ...groupDetailMock.summary, id } });
}

/** `GET /groups/{id}/status` — 모임 운동현황(`81:1817`) */
export async function getGroupStatus(id: string): Promise<GroupStatus> {
  if (!USE_MOCK) notConnected('GET /groups/{id}/status');
  return delay({ ...groupStatusMock, summary: { ...groupStatusMock.summary, id } });
}

/** `POST /groups` — 모임 만들기(`77:1982`) */
export async function createGroup(name: string): Promise<GroupSummary> {
  if (!USE_MOCK) notConnected('POST /groups');
  return delay({
    id: `g-${Date.now()}`,
    title: name,
    description: '',
    coverUrl: null,
    memberCount: 1,
    lastActivityLabel: '방금',
  });
}

/** `POST /groups/join` — 모임 참여(`77:2170`, 8자리 초대코드) */
export async function joinGroup(inviteCode: string): Promise<GroupSummary> {
  if (!USE_MOCK) notConnected('POST /groups/join');

  const group = myGroupsMock[0];
  if (!group) throw new Error('참여할 수 있는 모임이 없어요.');
  void inviteCode;
  return delay(group);
}

/** `POST /groups/{groupId}/feed/{postId}/cheer` — 모임 피드 응원보내기 */
export async function cheerPost(groupId: string, postId: string): Promise<void> {
  if (!USE_MOCK) notConnected('POST /groups/{id}/feed/{postId}/cheer');
  void groupId;
  void postId;
  await delay(undefined);
}

/** `POST /nudges` — 재촉하기 / 잡도리 / 깨우기 공통 */
export async function sendNudge(targetUserId: string): Promise<void> {
  if (!USE_MOCK) notConnected('POST /nudges');
  void targetUserId;
  await delay(undefined);
}
