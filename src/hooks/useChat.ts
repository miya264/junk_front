import { useState, useCallback, useEffect } from 'react';
import { Message, ChatSession, ApiMessage } from '@/types/Message';
import { api, ApiError, SessionState, MessageRequest } from '@/utils/api';
import type { FlowKey } from '@/types/flow';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://127.0.0.1:8000';

// セッション管理をローカルストレージに永続化
const STORAGE_KEY = 'chat_sessions';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // ローカルストレージからセッションを読み込み
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(STORAGE_KEY);
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        // Date オブジェクトを復元
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(sessionsWithDates);
      }
    } catch (error) {
      console.error('Failed to load sessions from localStorage:', error);
    }
  }, []);

  // セッションをローカルストレージに保存
  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
    }
  }, []);

  const createNewSession = useCallback((firstMessage: string) => {
    const sessionId = Date.now().toString();
    const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
    
    const newSession: ChatSession = {
      id: sessionId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions(prevSessions => {
      const newSessions = [newSession, ...prevSessions];
      saveSessions(newSessions);
      return newSessions;
    });
    setCurrentSessionId(sessionId);
    return sessionId;
  }, [saveSessions]);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setError(null);
  }, []);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setError(null);
  }, []);

  const convertApiMessageToMessage = (apiMsg: ApiMessage): Message => ({
    id: apiMsg.id,
    content: apiMsg.content,
    role: apiMsg.type === 'ai' ? 'assistant' : 'user',
    timestamp: new Date(apiMsg.timestamp),
    searchType: (apiMsg.search_type === 'fact' || apiMsg.search_type === 'network') ? apiMsg.search_type : undefined,
  });

  const sendMessage = useCallback(async (content: string, searchType?: 'fact' | 'network', flowStep?: FlowKey, projectId?: string) => {
    let sessionId = currentSessionId;
    
    // 新しいセッションを作成（初回メッセージの場合）
    if (!sessionId) {
      sessionId = createNewSession(content);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      searchType: (searchType === 'fact' || searchType === 'network') ? searchType : undefined,
    };

    // ユーザーメッセージを追加（関数型更新を使用）
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages: [...session.messages, userMessage],
              updatedAt: new Date()
            }
          : session
      );
      saveSessions(updatedSessions);
      return updatedSessions;
    });
    
    setIsLoading(true);
    setError(null);

    try {
      // バックエンドにメッセージを送信
      const requestData: MessageRequest = {
        content,
        search_type: searchType,
        flow_step: flowStep,
        session_id: sessionId!,
        project_id: projectId,
      };
      
      let response;
      let assistantMessage;
      
      // 検索タイプが指定されている場合はRAG/通常チャットAPIを優先
      // （バックエンド側は search_type 優先で処理されるため flow_step 同送でも問題なし）
      if (searchType === 'fact' || searchType === 'network') {
        response = await api.sendMessage(requestData);
        assistantMessage = convertApiMessageToMessage(response);
      } else if (flowStep) {
        // フローステップがある場合は柔軟なポリシーシステムを使用
        const flexibleResponse = await api.sendFlexiblePolicyMessage(requestData);

        // セッション状態を更新
        if (flexibleResponse.full_state) {
          setSessionState({
            session_id: flexibleResponse.session_id,
            project_id: flexibleResponse.project_id,
            ...flexibleResponse.full_state
          });
        }

        assistantMessage = {
          id: flexibleResponse.id,
          content: flexibleResponse.content,
          role: 'assistant' as const,
          timestamp: new Date(flexibleResponse.timestamp),
          searchType: undefined,
        };
      } else {
        response = await api.sendMessage(requestData);
        assistantMessage = convertApiMessageToMessage(response);
      }

      // AIレスポンスを追加（関数型更新を使用）
      setSessions(prevSessions => {
        const finalSessions = prevSessions.map(session => 
          session.id === sessionId 
            ? { 
                ...session, 
                messages: [...session.messages, assistantMessage],
                updatedAt: new Date()
              }
            : session
        );
        saveSessions(finalSessions);
        return finalSessions;
      });
      
    } catch (err) {
      console.error('Failed to send message:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        apiEndpoint: API_BASE_URL || process.env.NEXT_PUBLIC_API_ENDPOINT
      });
      
      let errorMessage = 'メッセージの送信に失敗しました。';
      
      if (err instanceof ApiError) {
        console.log(`API Error - Status: ${err.status}, Message: ${err.message}`);
        if (err.status === 500) {
          errorMessage = `サーバーエラーが発生しました。(Status: ${err.status}) しばらく待ってから再試行してください。`;
        } else if (err.status === 404) {
          errorMessage = `APIエンドポイントが見つかりません。(Status: ${err.status}) サーバー設定を確認してください。`;
        } else if (err.status === 0) {
          errorMessage = `ネットワーク接続エラーです。CORS設定またはサーバーの起動状況を確認してください。`;
        } else {
          errorMessage = `API エラー (Status: ${err.status}): ${err.message}`;
        }
      } else if (err instanceof Error) {
        console.log(`Generic Error: ${err.message}`);
        if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          errorMessage = `ネットワークエラーが発生しました。API URL: ${API_BASE_URL || process.env.NEXT_PUBLIC_API_ENDPOINT}への接続を確認してください。`;
        } else if (err.message.includes('CORS')) {
          errorMessage = 'CORS エラーが発生しました。サーバーのCORS設定を確認してください。';
        } else {
          errorMessage = `エラーが発生しました: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      
      // エラーメッセージを追加（関数型更新を使用）
      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ ${errorMessage}`,
        role: 'assistant',
        timestamp: new Date(),
      };

      setSessions(prevSessions => {
        const errorSessions = prevSessions.map(session => 
          session.id === sessionId 
            ? { 
                ...session, 
                messages: [...session.messages, errorMessageObj],
                updatedAt: new Date()
              }
            : session
        );
        saveSessions(errorSessions);
        return errorSessions;
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, createNewSession, saveSessions]);

  return {
    sessions,
    currentSessionId,
    messages,
    sendMessage,
    selectSession,
    startNewChat,
    isLoading,
    error,
    sessionState,
  };
};