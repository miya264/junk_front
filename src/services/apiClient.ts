/**
 * 中央集権的なAPI管理クライアント
 * すべて /api に投げ、Next の rewrites に任せる
 */

// もう “http://127.0.0.1:8000” などは使わず固定で /api
export const API_BASE_URL = '/api';

// エラーハンドリング
export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// 共通リクエスト
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      // ← rewrites 経由で同一オリジンになるので mode 指定は不要
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const msg =
        typeof data === 'object' && data?.detail
          ? data.detail
          : typeof data === 'string'
          ? data
          : `HTTP ${response.status}`;
      throw new ApiError(response.status, msg, data);
    }

    return data as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, err instanceof Error ? err.message : 'Network error');
  }
}

export const get = <T>(e: string) => apiRequest<T>(e, { method: 'GET' });
export const post = <T>(e: string, body: any) =>
  apiRequest<T>(e, { method: 'POST', body: JSON.stringify(body) });
export const put = <T>(e: string, body: any) =>
  apiRequest<T>(e, { method: 'PUT', body: JSON.stringify(body) });
export const del = <T>(e: string) => apiRequest<T>(e, { method: 'DELETE' });

export async function healthCheck(): Promise<{ message: string }> {
  return get<{ message: string }>('/');
}
export async function testConnection(): Promise<boolean> {
  try {
    await healthCheck();
    return true;
  } catch {
    return false;
  }
}
