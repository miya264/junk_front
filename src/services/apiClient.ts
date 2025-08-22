/**
 * 中央集権的なAPI管理クライアント
 * 各ページ・コンポーネント間でのAPI接続を統一的に管理
 */

// 環境変数からAPIベースURLを取得
const getApiBaseUrl = (): string => {
  const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  
  if (typeof window !== 'undefined') {
    console.log('Current environment:', {
      hostname: window.location.hostname,
      envVariable: process.env.NEXT_PUBLIC_API_ENDPOINT,
      resolvedEndpoint: endpoint
    });
  }
  
  const defaultEndpoint = 'http://127.0.0.1:8000';
  const finalEndpoint = endpoint || defaultEndpoint;
  
  console.log('Using API endpoint:', finalEndpoint);
  return finalEndpoint;
};

export const API_BASE_URL = getApiBaseUrl();

// エラーハンドリングクラス
export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// 共通リクエスト関数
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`[API Request] ${options.method || 'GET'} ${url}`);
  if (options.body) {
    console.log('[API Request Body]:', options.body);
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    });

    console.log(`[API Response] ${response.status} ${response.statusText}`);

    // レスポンスのコンテンツを取得
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      console.error('[API Error Response]:', responseData);
      console.error('[API Error Context]:', {
        url: url,
        method: options.method || 'GET',
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseType: contentType
      });
      
      // エラーメッセージを抽出
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      if (typeof responseData === 'object' && responseData.detail) {
        errorMessage = responseData.detail;
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      }
      
      throw new ApiError(response.status, errorMessage, responseData);
    }

    console.log('[API Success Response]:', responseData);
    return responseData;
    
  } catch (error) {
    console.error('[API Request Failed]:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, 'ネットワークエラー: サーバーに接続できません');
    }
    
    throw new ApiError(0, `予期しないエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// GET リクエストのヘルパー
export function get<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

// POST リクエストのヘルパー
export function post<T>(endpoint: string, data: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// PUT リクエストのヘルパー
export function put<T>(endpoint: string, data: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DELETE リクエストのヘルパー
export function del<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

// ヘルスチェック
export async function healthCheck(): Promise<{ message: string }> {
  try {
    return await get<{ message: string }>('/');
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

// 接続テスト
export async function testConnection(): Promise<boolean> {
  try {
    await healthCheck();
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}