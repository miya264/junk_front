/**
 * ユーザー関連のユーティリティ機能
 * ログインユーザーの情報を統一的に管理
 */

import type { User } from '@/contexts/AuthContext';

/**
 * ログインユーザーからAPIで使用するユーザーIDを取得
 * 認証済みユーザーから実際のIDを返す
 */
export function getUserId(user: User | null): number {
  if (!user) {
    return 1; // デフォルトID
  }
  
  // 認証システムから取得した実際のユーザーIDを使用
  return user.id;
}

/**
 * ログインユーザーの表示名を取得
 */
export function getDisplayName(user: User | null): string {
  if (!user) {
    return 'ゲストユーザー';
  }
  
  return user.name || user.email.split('@')[0];
}

/**
 * ログインユーザーの部署名を取得
 * 認証システムから取得した部署情報を使用
 */
export function getDepartmentName(user: User | null): string {
  if (!user) {
    return '未設定';
  }
  
  // 認証システムから取得した実際の部署名を使用
  return user.department_name || '未設定';
}