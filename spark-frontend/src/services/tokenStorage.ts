import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * 토큰 저장소.
 *
 * 네이티브에서는 `expo-secure-store`(iOS 키체인 / Android 키스토어)를 쓴다.
 * **웹에는 secure-store가 없다** — 개발 중 웹 미리보기가 동작하도록 `localStorage`로 대체한다.
 * 웹을 실제 배포 대상으로 삼는다면 토큰을 httpOnly 쿠키로 옮겨야 한다.
 */

const ACCESS_TOKEN_KEY = 'spark.accessToken';
const REFRESH_TOKEN_KEY = 'spark.refreshToken';

const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string) {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export const tokenStorage = {
  async save(tokens: TokenPair) {
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
      setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  },

  async load(): Promise<TokenPair | null> {
    const [accessToken, refreshToken] = await Promise.all([
      getItem(ACCESS_TOKEN_KEY),
      getItem(REFRESH_TOKEN_KEY),
    ]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },

  async clear() {
    await Promise.all([removeItem(ACCESS_TOKEN_KEY), removeItem(REFRESH_TOKEN_KEY)]);
  },
};
