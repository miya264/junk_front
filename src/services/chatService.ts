/**
 * チャット・メッセージ関連のAPIサービス
 * チャット、政策立案エージェント、セッション管理の機能を提供
 */

import { get, post } from './apiClient';

// チャット関連の型定義
export interface MessageRequest {
  content: string;
  search_type?: 'fact' | 'network';
  flow_step?: 'analysis' | 'objective' | 'concept' | 'plan' | 'proposal';
  context?: any;
  session_id?: string;
  project_id?: string;
}

export interface MessageResponse {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: string;
  search_type?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface FlexiblePolicyResponse {
  id: string;
  content: string;
  step: string;
  timestamp: string;
  session_id: string;
  project_id?: string;
  full_state?: {
    analysis_result?: string;
    objective_result?: string;
    concept_result?: string;
    plan_result?: string;
    proposal_result?: string;
    last_updated_step?: string;
    step_timestamps?: Record<string, string>;
  };
}

export interface SessionState {
  session_id: string;
  project_id?: string;
  analysis_result?: string;
  objective_result?: string;
  concept_result?: string;
  plan_result?: string;
  proposal_result?: string;
  last_updated_step?: string;
  step_timestamps?: Record<string, string>;
}

// チャットサービス
export class ChatService {
  
  /**
   * チャットメッセージを送信
   */
  static async sendMessage(request: MessageRequest): Promise<MessageResponse> {
    console.log('[ChatService] Sending message:', request);
    return await post<MessageResponse>('/api/chat', request);
  }

  /**
   * 政策立案エージェントメッセージを送信
   */
  static async sendFlexiblePolicyMessage(request: MessageRequest): Promise<FlexiblePolicyResponse> {
    console.log('[ChatService] Sending flexible policy message:', request);
    return await post<FlexiblePolicyResponse>('/api/policy-flexible', request);
  }

  /**
   * セッション一覧を取得
   */
  static async getSessions(): Promise<ChatSession[]> {
    console.log('[ChatService] Getting sessions');
    return await get<ChatSession[]>('/api/sessions');
  }

  /**
   * 新しいセッションを作成
   */
  static async createSession(): Promise<ChatSession> {
    console.log('[ChatService] Creating session');
    return await post<ChatSession>('/api/sessions', {});
  }

  /**
   * セッション状態を取得
   */
  static async getSessionState(sessionId: string): Promise<SessionState> {
    console.log('[ChatService] Getting session state:', sessionId);
    return await get<SessionState>(`/api/session-state/${sessionId}`);
  }
}