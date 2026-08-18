import {
  friendActivitiesMock,
  groupDetailMock,
  groupStatusMock,
  myGroupsMock,
} from '@/services/mock/group';
import { http } from '@/services/http';
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
 */
export async function createFeedPost(input: {
  groupId: string;
  body: string;
  sessionId?: string;
}): Promise<void> {
  if (USE_MOCK) {
    void input;
    await delay(undefined);
    return;
  }
  await http.post(`/groups/${input.groupId}/feed`, { body: input.body });
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

/** `POST /nudges` — 재촉하기 / 잡도리 / 깨우기 공통. 같은 대상에게 하루 1회 */
export async function sendNudge(targetUserId: string): Promise<void> {
  if (USE_MOCK) {
    void targetUserId;
    await delay(undefined);
    return;
  }
  await http.post('/nudges', { targetUserId });
}
