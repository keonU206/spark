import { homeSummaryMock } from '@/services/mock/home';
import type { HomeSummary } from '@/types/api';

/** mock ↔ 실서버 전환 스위치. 백엔드가 붙으면 false로 바꾼다. */
const USE_MOCK = true;

/**
 * `GET /home`
 *
 * 백엔드 연동 시 아래 mock 분기만 실제 HTTP 호출로 교체한다.
 * 반환 타입(`HomeSummary`)이 곧 응답 스펙이므로 화면은 영향받지 않는다.
 */
export async function getHome(): Promise<HomeSummary> {
  if (USE_MOCK) {
    // 로딩 상태가 실제로 보이도록 약간의 지연을 준다
    await new Promise((resolve) => setTimeout(resolve, 250));
    return homeSummaryMock;
  }

  throw new Error('GET /home 아직 연결되지 않음 — services/api/home.ts 참고');
}
