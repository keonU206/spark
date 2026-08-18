import { homeSummaryMock } from '@/services/mock/home';
import { http } from '@/services/http';
import type { HomeSummary } from '@/types/api';

/** mock ↔ 실서버 전환 스위치. `.env`의 `EXPO_PUBLIC_USE_MOCK=false`면 실서버로 붙는다. */
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

/** `GET /home` — 홈 화면 하나를 1회 요청으로 완성한다 */
export async function getHome(): Promise<HomeSummary> {
  if (USE_MOCK) {
    // 로딩 상태가 실제로 보이도록 약간의 지연을 준다
    await new Promise((resolve) => setTimeout(resolve, 250));
    return homeSummaryMock;
  }

  const { data } = await http.get<HomeSummary>('/home');
  return data;
}
