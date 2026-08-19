import { router, type Href } from 'expo-router';

/**
 * 뒤로가기. 히스토리가 없으면(앱 리로드로 화면이 복원된 직후 등) fallback으로 나간다.
 * router.back()은 갈 곳이 없을 때 조용히 아무 일도 하지 않아 사용자가 화면에 갇힌다.
 */
export function goBack(fallback: Href) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
