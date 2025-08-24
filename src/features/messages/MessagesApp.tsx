//元App.tsxです。移動して編集してます。250817
//export default function MessagesApp({ projectId, initialFlow }) に変更し、/messages 側からのクエリを受け取れるようにしました。
//送信時に messages:{projectId}:{flow} をセットし、/project のカード濃色表示と連動。
// 
'use client';

import React, { useEffect, useRef, useState } from 'react';
import ChatSidebar from './components/ChatSidebar';
import { ChatMessage } from './components/ChatMessage';   // ★ named import
import { ChatInput } from './components/ChatInput';       // ★ named import
import InitialView from './components/InitialView';   // ★ default import
import ContentOrganizer from './components/ContentOrganizer';
import { ConnectionTest } from '@/components/ConnectionTest';
import { useChat } from '@/hooks/useChat';
import type { FlowKey } from '@/types/flow';


export default function MessagesApp({
  projectId,
  initialFlow = 'analysis',
}: {
  projectId?: string;
  initialFlow?: FlowKey;
}) {
  // デバッグ用コンソールログ
  useEffect(() => {
    console.log('MessagesApp initialized with:', { projectId, initialFlow });
    if (projectId) {
      console.log('Project-specific chat mode enabled');
    } else {
      console.log('General chat mode (no project)');
    }
  }, [projectId, initialFlow]);

  // 既存チャットロジック
  const {
    sessions,
    currentSessionId,
    messages,
    sendMessage,
    selectSession,
    startNewChat,
    isLoading,
  } = useChat();

  // 選択中フロー（/messages?flow=... から初期化）
  const [selectedFlow, setSelectedFlow] = useState<FlowKey>(initialFlow);
  // 右側の内容整理パネル
  const [organizerOpen, setOrganizerOpen] = useState(false);
  
  // プロジェクト情報を取得
  const [project, setProject] = useState<any>(null);
  
  useEffect(() => {
    const loadProjectInfo = async () => {
      if (projectId) {
        try {
          const { ApiService } = await import('@/services');
          const projectData = await ApiService.project.getProject(projectId);
          setProject(projectData);
          console.log('Project data loaded:', projectData.name);
        } catch (error) {
          console.error('Failed to load project data:', error);
        }
      }
    };
    
    loadProjectInfo();
  }, [projectId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // フロー変更の保存（将来はDB/APIに置き換え）
  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`current:${projectId}`, JSON.stringify({ flow: selectedFlow }));
    }
  }, [projectId, selectedFlow]);

  const isInitialView = !currentSessionId || messages.length === 0;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* 左：サイドバー（フロー選択＋履歴＋「内容を整理する」ボタン） */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(sessionId) => selectSession(sessionId)}
        onNewChat={() => startNewChat()}
        selectedFlow={selectedFlow}                    // ★ アクティブ表示に使用
        onSelectFlow={(f) => setSelectedFlow(f)}       // ★ クリックで切替
        onToggleOrganizer={() => setOrganizerOpen(v => !v)} // ★ 右パネル開閉
        projectId={projectId}
      />

      {/* 中央：メッセージ本体 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* プロジェクト情報ヘッダー */}
        {project && (
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
                  <p className="text-sm text-gray-500">
                    {selectedFlow === 'analysis' && '現状分析・課題整理'}
                    {selectedFlow === 'objective' && '目的整理'}
                    {selectedFlow === 'concept' && 'コンセプト策定'}
                    {selectedFlow === 'plan' && '施策案作成'}
                    {selectedFlow === 'proposal' && '提案書作成'}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                オーナー: {project.owner_name}
              </div>
            </div>
          </div>
        )}
        {isInitialView ? (
          <InitialView 
            onSendMessage={(text, searchType) => sendMessage(text, searchType, selectedFlow, projectId)} 
            isLoading={isLoading} 
          />
        ) : (
          <>
            {/* メッセージ一覧 */}
            <div className="flex-1 overflow-y-auto px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
              <div className="max-w-4xl mx-auto py-6 space-y-1">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-4 p-4 animate-pulse">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
                    </div>
                    <div className="flex-1 max-w-3xl">
                      <div className="inline-block p-4 rounded-2xl bg-white border border-gray-200 rounded-bl-md">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 入力欄（送信時に進捗フラグを保存 → /project で濃色表示に使用） */}
            <ChatInput
              isLoading={isLoading}
              onSendMessage={async (text: string, searchType?: 'fact' | 'network') => {
                if (projectId) {
                  try {
                    localStorage.setItem(`messages:${projectId}:${selectedFlow}`, '1');
                  } catch {}
                }
                await sendMessage(text, searchType, selectedFlow, projectId);
              }}
            />
          </>
        )}
      </div>

      {/* 右：内容整理パネル（トグル表示） */}
      {organizerOpen && (
        <ContentOrganizer
          projectId={projectId}
          flow={selectedFlow} 
          onSaved={() => {
            if (!projectId) return;
            try {
              localStorage.setItem(`organizer:${projectId}:${selectedFlow}`, '1');
            } catch {}
          }}
        />
      )}
    </div>
  );
}