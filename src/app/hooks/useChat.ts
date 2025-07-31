import { useState, useCallback } from 'react';

// シンプルな型定義
type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  searchType?: 'fact' | 'network' | 'normal';
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
};

// API設定 - Next.js環境変数を使用
const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:8000';

// API関数 - 環境変数を使用
const sendMessageToAPI = async (content: string, searchType: 'fact' | 'network' | 'normal' = 'normal') => {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      search_type: searchType
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

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
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(sessionId);
    return sessionId;
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
  }, []);

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

    // ユーザーメッセージを追加
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            messages: [...session.messages, userMessage],
            updatedAt: new Date()
          }
        : session
    ));
    
    setIsLoading(true);

    try {
      // バックエンドAPIにリクエストを送信
      const aiResponse = await sendMessageToAPI(content, searchType || 'normal');

      const assistantMessage: Message = {
        id: aiResponse.id,
        content: aiResponse.content,
        role: 'assistant',
        timestamp: new Date(aiResponse.timestamp),
        searchType: aiResponse.search_type,
      };

      // AIレスポンスを追加
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages: [...session.messages, assistantMessage],
              updatedAt: new Date()
            }
          : session
      ));
      
    } catch (error) {
      console.error('API request failed:', error);
      
      // エラー時のフォールバックメッセージ
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `申し訳ございません。リクエストの処理中にエラーが発生しました。\n\nエラー詳細: ${error instanceof Error ? error.message : 'Unknown error'}\n\nバックエンドサーバーが起動しているかご確認ください。`,
        role: 'assistant',
        timestamp: new Date(),
      };

      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              messages: [...session.messages, errorMessage],
              updatedAt: new Date()
            }
          : session
      ));
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, createNewSession]);

  return {
    sessions,
    currentSessionId,
    messages,
    sendMessage,
    selectSession,
    startNewChat,
    isLoading,
  };
};