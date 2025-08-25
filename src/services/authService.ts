/**
 * 認証関連のAPIサービス
 * ログイン、ユーザー情報取得、JWT管理の機能を提供
 */

import { get, post } from './apiClient';
import type { Coworker } from './projectService';

// 認証関連の型定義
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Coworker;
  expires_at: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  full_name: string;
  department_name: string;
  position?: string;
  token: string;
}

// 認証サービス
export class AuthService {
  
  /**
   * メールアドレスとパスワードでログイン
   */
  static async login(request: LoginRequest): Promise<LoginResponse> {
    console.log('[AuthService] Logging in user:', request.email);
    return await post<LoginResponse>('/api/auth/login', request);
  }

  /**
   * 現在のユーザー情報を取得
   */
  static async getCurrentUser(): Promise<Coworker> {
    console.log('[AuthService] Getting current user');
    return await get<Coworker>('/api/auth/me');
  }

  /**
   * メールアドレスでcoworkerを検索
   */
  static async getCoworkerByEmail(email: string): Promise<Coworker> {
    console.log('[AuthService] Getting coworker by email:', email);
    return await get<Coworker>(`/api/coworkers/by-email/${encodeURIComponent(email)}`);
  }

  /**
   * ログアウト
   */
  static async logout(): Promise<void> {
    console.log('[AuthService] Logging out');
    return await post<void>('/api/auth/logout', {});
  }

  /**
   * JWTトークンの有効性を確認
   */
  static async verifyToken(): Promise<{ valid: boolean; user?: Coworker }> {
    console.log('[AuthService] Verifying token');
    try {
      return await get<{ valid: boolean; user?: Coworker }>('/api/auth/verify');
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false };
    }
  }
}