import { useState, useCallback, useEffect } from 'react';
import { Message, ChatSession, ApiMessage } from '../types/Message';
import { api, ApiError } from '../utils/api';

// セッション管理をローカルストレージに永続化
const STORAGE_KEY = 'chat_sessions';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    searchType: apiMsg.search_type as 'fact' | 'network' | undefined,
  });

  const sendMessage = useCallback(async (content: string, searchType?: 'fact' | 'network') => {
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
      searchType,
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
      const response = await api.sendMessage({
        content,
        search_type: searchType || 'normal',
      });

      const assistantMessage = convertApiMessageToMessage(response);

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
      
      let errorMessage = 'メッセージの送信に失敗しました。';
      
      if (err instanceof ApiError) {
        if (err.status === 500) {
          errorMessage = 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
        } else if (err.status === 0 || err.message.includes('Network error')) {
          errorMessage = 'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。';
        }
      } else if (err instanceof Error && err.message.includes('Network error')) {
        errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
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
  };
};