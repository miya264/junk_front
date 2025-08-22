/**
 * 中央集権的なAPI管理クライアント（置き換え版）
 * - NEXT_PUBLIC_API_ENDPOINT が未設定でも落とさない
 * - 本番では /api にフォールバック（リバプロ前提）
 * - 開発では http://127.0.0.1:8000 にフォールバック
 * - 二重スラッシュを防止
 */

// ==== ベースURL解決 ====
let _RESOLVED_BASE: string | null = null;

const resolveApiBaseUrl = (): string => {
  if (_RESOLVED_BASE) return _RESOLVED_BASE;

  // 1) 環境変数（ビルド時に埋め込まれる）
  const env = process.env.NEXT_PUBLIC_API_ENDPOINT?.trim();
  if (env && env.length > 0) {
    _RESOLVED_BASE = env.replace(/\/+$/, ''); // 末尾スラッシュ除去
    return _RESOLVED_BASE;
  }

  // 2) 本番ホストで未設定 → /api にフォールバック（AppService 等でリバプロ設定を想定）
  if (typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.hostname)) {
    console.warn('[apiClient] NEXT_PUBLIC_API_ENDPOINT missing; fallback to "/api"');
    _RESOLVED_BASE = '/api';
    return _RESOLVED_BASE;
  }

  // 3) 開発デフォルト
  _RESOLVED_BASE = 'http://127.0.0.1:8000';
  console.warn('[apiClient] Using default dev endpoint:', _RESOLVED_BASE);
  return _RESOLVED_BASE;
};

export const API_BASE_URL = resolveApiBaseUrl();

const makeUrl = (endpoint: string): string => {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

// ==== エラーハンドリング ====
export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// ==== 共通リクエスト ====
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = makeUrl(endpoint);

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      const message =
        (typeof data === 'object' && (data as any)?.detail) ? (data as any).detail :
        (typeof data === 'string') ? data :
        `HTTP ${res.status}: ${res.statusText}`;
      throw new ApiError(res.status, message, data);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof TypeError && String(err.message).includes('fetch')) {
      throw new ApiError(0, 'ネットワークエラー: サーバーに接続できません');
    }
    throw new ApiError(0, `予期しないエラー: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

// ==== ヘルパー ====
export const get  = <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' });
export const post = <T>(endpoint: string, data: any) =>
  apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
export const put  = <T>(endpoint: string, data: any) =>
  apiRequest<T>(endpoint, { method: 'PUT',  body: JSON.stringify(data) });
export const del  = <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' });

// ==== ヘルスチェック ====
export async function healthCheck(): Promise<{ message: string }> {
  return await get<{ message: string }>('/');
}

export async function testConnection(): Promise<boolean> {
  try {
    await healthCheck();
    return true;
  } catch {
    return false;
  }
}
