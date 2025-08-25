/**
 * 中央集権的なAPI管理クライアント（修正版）
 * 本番 = 絶対URL直叩き / ローカル = /api 経由（Next の rewrite）
 */

type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | { [k: string]: JSONValue } | JSONValue[];

const rawEndpoint = (process.env.NEXT_PUBLIC_API_ENDPOINT ?? '').replace(/\/$/, '');
export const API_BASE_URL = rawEndpoint || '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

const isJsonLikeBody = (b: unknown): b is Record<string, unknown> | JSONValue => {
  // 文字列/Blob/FormData/URLSearchParams などは JSON 化しない
  if (
    typeof b === 'string' ||
    b instanceof Blob ||
    b instanceof FormData ||
    b instanceof URLSearchParams ||
    b instanceof ArrayBuffer ||
    b instanceof ReadableStream
  ) return false;
  // undefined や null はここでは body 無しとして扱う
  if (b === undefined || b === null) return false;
  // それ以外は JSON 化対象にする（配列 or オブジェクト想定）
  return typeof b === 'object';
};

type RequestOptions<B> =
  Omit<RequestInit, 'body' | 'headers' | 'method'> & {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: B;
    /** ms 指定のタイムアウト（省略時は無期限） */
    timeoutMs?: number;
  };

export async function apiRequest<T, B = unknown>(endpoint: string, options: RequestOptions<B> = {}): Promise<T> {
  const { method = 'GET', headers, body, timeoutMs, ...rest } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  // AbortController によるタイムアウト
  const controller = new AbortController();
  const timeoutId = typeof timeoutMs === 'number' && timeoutMs > 0
    ? setTimeout(() => controller.abort(), timeoutMs)
    : undefined;

  try {
    const init: RequestInit = {
      method,
      headers: { ...(headers ?? {}) },
      credentials: 'include', // Cookie を含める運用の場合は維持
      signal: controller.signal,
      ...rest,
    };

    // ボディ組み立て（JSON を賢くシリアライズ）
    if (body !== undefined) {
      if (isJsonLikeBody(body)) {
        init.headers = { 'Content-Type': 'application/json', ...init.headers };
        init.body = JSON.stringify(body);
      } else {
        // 文字列/Blob/FormData 等はそのまま
        init.body = body as unknown as BodyInit;
      }
    }

    const res = await fetch(url, init);

    // 204 No Content はそのまま返す
    if (res.status === 204) {
      return undefined as unknown as T;
    }

    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const parsed = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const message =
        (isJson && parsed && typeof parsed === 'object' && 'detail' in (parsed as Record<string, unknown>))
          ? String((parsed as Record<string, unknown>).detail)
          : typeof parsed === 'string'
            ? parsed
            : `HTTP ${res.status}`;
      throw new ApiError(res.status, message, parsed);
    }

    return (parsed as unknown) as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as Error).name === 'AbortError') {
      throw new ApiError(0, 'Request timeout');
    }
    throw new ApiError(0, e instanceof Error ? e.message : 'Network error');
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/** メソッド別ヘルパー */
export const get  = <T>(e: string, opt?: Omit<RequestOptions<never>, 'method' | 'body'>) =>
  apiRequest<T, never>(e, { method: 'GET', ...(opt ?? {}) });

export const del  = <T>(e: string, opt?: Omit<RequestOptions<never>, 'method' | 'body'>) =>
  apiRequest<T, never>(e, { method: 'DELETE', ...(opt ?? {}) });

export const post = <T, B = JSONValue>(e: string, body?: B, opt?: Omit<RequestOptions<B>, 'method' | 'body'>) =>
  apiRequest<T, B>(e, { method: 'POST', body, ...(opt ?? {}) });

export const put  = <T, B = JSONValue>(e: string, body?: B, opt?: Omit<RequestOptions<B>, 'method' | 'body'>) =>
  apiRequest<T, B>(e, { method: 'PUT', body, ...(opt ?? {}) });

export const patch = <T, B = JSONValue>(e: string, body?: B, opt?: Omit<RequestOptions<B>, 'method' | 'body'>) =>
  apiRequest<T, B>(e, { method: 'PATCH', body, ...(opt ?? {}) });

/** ヘルスチェック */
export const healthCheck = () => get<{ message: string }>('/');

/** 接続テスト（成功: true / 失敗: false） */
export const testConnection = async (): Promise<boolean> => {
  try {
    await healthCheck();
    return true;
  } catch {
    return false;
  }
};
