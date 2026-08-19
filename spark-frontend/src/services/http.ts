import axios, { AxiosError } from 'axios';

/**
 * HTTP 클라이언트.
 *
 * 아직 서버가 없어 `services/api/*`는 mock을 반환한다. 이 파일은 백엔드가 붙었을 때
 * **화면을 고치지 않고** 갈아끼우기 위한 자리다. `USE_MOCK`을 끄면 여기로 흐른다.
 */

/** 실제 주소가 정해지면 `.env`의 `EXPO_PUBLIC_API_BASE_URL`로 넘긴다 */
const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export const http = axios.create({
  baseURL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

/** 토큰 공급자. 인증 붙일 때(Phase B) 여기에 secure-store 읽기를 연결한다. */
let getAccessToken: () => string | null = () => null;

export function setAccessTokenProvider(provider: () => string | null) {
  getAccessToken = provider;
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * 화면이 다루는 에러 타입.
 * 화면은 `AxiosError`를 알 필요가 없고 이 형태만 본다.
 */
export class ApiError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** 서버 에러 응답의 공통 형태 (백엔드와 합의 필요) */
type ErrorBody = {
  message?: string;
  code?: string;
};

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorBody>;
    const status = axiosError.response?.status;
    const body = axiosError.response?.data;

    if (axiosError.code === 'ECONNABORTED') {
      return new ApiError('응답이 너무 오래 걸려요. 잠시 후 다시 시도해주세요.', status);
    }
    if (!axiosError.response) {
      return new ApiError('네트워크에 연결할 수 없어요.', undefined, axiosError.code);
    }
    if (status === 401) {
      return new ApiError('로그인이 필요해요.', status, body?.code);
    }
    return new ApiError(body?.message ?? '요청을 처리하지 못했어요.', status, body?.code);
  }

  return new ApiError(error instanceof Error ? error.message : String(error));
}

/**
 * 401 처리자. AuthProvider가 "토큰을 지우고 로그인 화면으로" 를 등록한다.
 * 저장된 토큰이 만료·무효(서버 초기화 등)일 때 다시시도 루프에 갇히지 않게 한다.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error);
    if (apiError.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(apiError);
  },
);

/** mock 경로에서도 같은 에러 타입을 쓰기 위해 노출한다 */
export { toApiError };
