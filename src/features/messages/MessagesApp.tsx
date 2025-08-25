//元App.tsxです。移動して編集してます。250817
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ChatSidebar from './components/ChatSidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import InitialView from './components/InitialView';
import ContentOrganizer from './components/ContentOrganizer';
import { ConnectionTest } from '@/components/ConnectionTest';
import { useChat } from '@/hooks/useChat';
import type { FlowKey } from '@/types/flow';

import PeopleSearchReply from './components/PeopleSearchReply';
import PeopleDetailsReply from './components/PeopleDetailsReply'; // 新しいコンポーネントをインポート

import CandidateList, { type Candidate } from './components/CandidateList';

// ---- 人物カードをメッセージIDに紐づけて保持 ----
type PeopleCard = { id: string; query: string; items: Candidate[]; narrative?: string; isLoading: boolean };
type PeopleCardMap = Record<string, PeopleCard>; // key = parent user message id
// ------------------------------------------------

export default function MessagesApp({
  projectId,
  initialFlow = 'analysis',
}: {
  projectId?: string;
  initialFlow?: FlowKey;
}) {
  useEffect(() => {
    console.log('MessagesApp initialized with:', { projectId, initialFlow });
  }, [projectId, initialFlow]);

  const {
    sessions,
    currentSessionId,
    messages,
    sendMessage,
    selectSession,
    startNewChat,
    isLoading,
    setMessages
  } = useChat();

  const [selectedFlow, setSelectedFlow] = useState<FlowKey>(initialFlow);
  const [organizerOpen, setOrganizerOpen] = useState(false);

  const [peopleCardsByMsg, setPeopleCardsByMsg] = useState<PeopleCardMap>({});
  const pendingNetworkQueue = useRef<Array<{ query: string }>>([]); // network送信の仮置き
  const networkLock = useRef(false);

  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const loadProjectInfo = async () => {
      if (!projectId) return;
      try {
        const { ApiService } = await import('@/services');
        const projectData = await ApiService.project.getProject(projectId);
        setProject(projectData);
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    };
    loadProjectInfo();
  }, [projectId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [messages, peopleCardsByMsg]);

  useEffect(() => {
    if (projectId) {
      localStorage.setItem(`current:${projectId}`, JSON.stringify({ flow: selectedFlow }));
    }
  }, [projectId, selectedFlow]);

  // セッション切替で人物カードはクリア（セッション内履歴）
  useEffect(() => {
    setPeopleCardsByMsg({});
  }, [currentSessionId]);

  // assistant の network 返信は表示しない（人物検索はカードだけを見せる）
  const visibleMessages = useMemo(() => {
    return messages.filter((m: any) => {
      const role = m?.role || m?.sender || '';
      const st =
        m?.searchType ??
        m?.type ??
        m?.meta?.searchType ??
        (Array.isArray(m?.tags) && m.tags.includes('network') ? 'network' : undefined);
      if ((role === 'assistant' || role === 'ai') && st === 'network') return false;
      return true;
    });
  }, [messages]);

  const isInitialView = !currentSessionId || messages.length === 0;

  // 新しいメッセージを追加するための関数を定義
  const addReplyMessage = useCallback((msg: any) => {
    setMessages((prevMessages) => [...prevMessages, msg]);
  }, [setMessages]);

  // --- ここがポイント：送信の共通ハンドラ（InitialView も ChatInput もこれを使う） ---
  const handleSend = async (text: string, searchType?: 'fact' | 'network') => {
    if (projectId) {
      try {
        localStorage.setItem(`messages:${projectId}:${selectedFlow}`, '1');
      } catch {}
    }

    // 人脈検索：カード挿入のため pendingQueue → user メッセージ確定後に紐づける
    if (searchType === 'network') {
      if (networkLock.current) return;
      networkLock.current = true;

      // network送信をキューに積む（userメッセージIDは後で拾う）
      pendingNetworkQueue.current.push({ query: text.trim() });

      // ユーザー発話は並行で送信（awaitしない）
      sendMessage(text, searchType, selectedFlow, projectId)
        .catch((e: any) => console.error('sendMessage(network) failed', e))
        .finally(() => {
          networkLock.current = false;
        });
      return;
    }

    // 通常/ファクト
    await sendMessage(text, searchType, selectedFlow, projectId);
  };
  // --------------------------------------------------------------------

  // pendingQueue と追加済みメッセージを突き合わせ、カードを親メッセージ直下に差し込む
  useEffect(() => {
    if (pendingNetworkQueue.current.length === 0) return;

    const reversed = [...messages].reverse();

    while (pendingNetworkQueue.current.length > 0) {
      const { query } = pendingNetworkQueue.current[0];

      const targetUserMsg = reversed.find((m: any) => {
        const role = m?.role || m?.sender;
        const text = (m?.content ?? m?.text ?? '').trim();
        const st =
          m?.searchType ??
          m?.type ??
          m?.meta?.searchType ??
          (Array.isArray(m?.tags) && m.tags.includes('network') ? 'network' : undefined);

        // st==='network' を“任意”にしつつ、本文一致で絞る
        const isNetworkLike = st === 'network' || true; // ← フォールバックで許容
        return role === 'user' && isNetworkLike && text === query && !peopleCardsByMsg[m.id];
      });


      if (!targetUserMsg) break;

      const parentId = targetUserMsg.id as string;
      const cardId = crypto.randomUUID();

      // 仮カードを挿入
      setPeopleCardsByMsg((prev) => ({
        ...prev,
        [parentId]: { id: cardId, query, items: [], narrative: undefined, isLoading: true },
      }));

      // APIで上書き（★ここを /api/people/ask に差し替え）
      (async () => {
        try {
          const res = await fetch('/api/people/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: query,
              top_k: 5,
              coworker_id: 0, // 必要なら実ユーザIDに差し替え
            }),
          });
          const ask = await res.json().catch(() => ({}));
          const items: Candidate[] = Array.isArray(ask?.candidates) ? ask.candidates : [];
          const narrative: string | undefined = typeof ask?.narrative === 'string' ? ask.narrative : undefined;
          setPeopleCardsByMsg((prev) =>
            prev[parentId] ? { ...prev, [parentId]: { ...prev[parentId], items, narrative, isLoading: false } } : prev
          );
        } catch (e) {
          console.error('人物検索に失敗しました', e);
          setPeopleCardsByMsg((prev) =>
            prev[parentId] ? { ...prev, [parentId]: { ...prev[parentId], items: [], isLoading: false } } : prev
          );
        }
      })();

      pendingNetworkQueue.current.shift();
    }
  }, [messages, peopleCardsByMsg, addReplyMessage]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(sessionId) => selectSession(sessionId)}
        onNewChat={() => {
          setPeopleCardsByMsg({});
          startNewChat();
        }}
        selectedFlow={selectedFlow}
        onSelectFlow={(f) => setSelectedFlow(f)}
        onToggleOrganizer={() => setOrganizerOpen((v) => !v)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {project && (
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href={`/project?project_id=${projectId}`}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">プロジェクトに戻る</span>
                </Link>
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
              <div className="text-xs text-gray-400">オーナー: {project.owner_name}</div>
            </div>
          </div>
        )}

        {isInitialView ? (
          // ★ ここを sendMessage 直呼びから「共通ハンドラ」に変更
          <InitialView onSendMessage={handleSend} isLoading={isLoading} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
              <div className="max-w-4xl mx-auto py-6 space-y-1">
                {visibleMessages.map((message: any) => {
                  const card = peopleCardsByMsg[message.id as string];
                  return (
                    <React.Fragment key={message.id}>
                      <ChatMessage message={message} />
                      {card && (
                        <div className="flex gap-4 p-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs">
                            AI
                          </div>
                          <div className="flex-1 max-w-3xl">
                            <div className="inline-block p-4 rounded-2xl bg-white border border-gray-200 rounded-bl-md w-full">
                              <div className="text-xs text-gray-500 mb-2">「{card.query}」の人物検索結果</div>
                              {card.isLoading ? (
                                <div className="text-sm text-gray-500">検索中…</div>
                              ) : (
                                // onSendMessage propsを追加
                                <PeopleSearchReply items={card.items} narrative={card.narrative} />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

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

            {/* チャット入力も同じ共通ハンドラを使用 */}
            <ChatInput isLoading={isLoading} onSendMessage={handleSend} />
          </>
        )}
      </div>

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