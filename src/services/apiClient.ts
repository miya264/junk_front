/**
 * 中央集権的なAPI管理クライアント
 * 本番=絶対URL直叩き / ローカル= /api 経由（Nextのrewrite）
 */

// 末尾スラッシュ除去して使う
const envEndpoint = (process.env.NEXT_PUBLIC_API_ENDPOINT || '').replace(/\/$/, '');

// 本番: ENV があればそのまま使う（クロスオリジンだが FastAPI(CORS *) で許可）
// 開発: ENV が無ければ Next の rewrite を使う（同一オリジン /api）
export const API_BASE_URL = envEndpoint || '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options, // ← mode/credentials は明示しない（余計な preflight を避ける）
    });

    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();

    if (!res.ok) {
      const msg = typeof data === 'object' && (data as any)?.detail
        ? (data as any).detail
        : typeof data === 'string'
          ? data
          : `HTTP ${res.status}`;
      throw new ApiError(res.status, msg, data);
    }

    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(0, e instanceof Error ? e.message : 'Network error');
  }
}

export const get  = <T>(e: string) => apiRequest<T>(e, { method: 'GET' });
export const post = <T>(e: string, body: any) => apiRequest<T>(e, { method: 'POST', body: JSON.stringify(body) });
export const put  = <T>(e: string, body: any) => apiRequest<T>(e, { method: 'PUT',  body: JSON.stringify(body) });
export const del  = <T>(e: string)         => apiRequest<T>(e, { method: 'DELETE' });

export const healthCheck   = () => get<{ message: string }>('/');
export const testConnection = async () => { try { await healthCheck(); return true; } catch { return false; } };
