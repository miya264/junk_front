//250813かんちゃん変更

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Home, ClipboardList, Target, Lightbulb, Settings2, FileText, ChevronDown } from 'lucide-react';
import { ConnectionTest } from '@/components/ConnectionTest';
import type { FlowKey } from '@/types/flow';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type Props = {
  // 既存 useChat() 連携
  sessions: Array<{ id: string; title: string; updatedAt: Date; messages: Array<{ id: string; content: string; role: string; timestamp: Date }> }>;
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;

  // 追加：フロー連動
  selectedFlow: FlowKey;
  onSelectFlow: (key: FlowKey) => void;

  // 追加：「内容を整理する」開閉
  onToggleOrganizer: () => void;
  // 現在のプロジェクトID（ホームで戻る先）
  projectId?: string;
};

export default function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  selectedFlow,
  onSelectFlow,
  onToggleOrganizer,
  projectId,
}: Props) {
  const router = useRouter(); 

  const items: { key: FlowKey; label: string; icon: React.ReactNode }[] = [
    { key: 'analysis',  label: '現状分析・課題整理', icon: <ClipboardList size={16} /> },
    { key: 'objective', label: '目的整理',           icon: <Target size={16} /> },
    { key: 'concept',   label: 'コンセプト策定',     icon: <Lightbulb size={16} /> },
    { key: 'plan',      label: '施策立案',           icon: <Settings2 size={16} /> },
    { key: 'proposal',  label: '資料作成',           icon: <FileText size={16} /> },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* ユーザー */}
      <UserSection />

      {/* ホーム＝新規チャット */}
      <div className="px-4 pt-4">
        <button
          onClick={() => {
            onNewChat?.();
            if (projectId) {
              router.push(`/project?project_id=${encodeURIComponent(projectId)}`);
            } else {
              router.push('/project_start');
            }
          }}
          className="w-full inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-slate-700 text-white hover:opacity-90 transition"
        >
          <Home size={16} />
          ホーム
        </button>
      </div>

      {/* フロー */}
      <div className="px-4 py-4">
        <div className="text-xs font-medium text-gray-500 mb-2">政策立案フロー</div>
        <nav className="space-y-2">
          {items.map((it) => {
            const active = it.key === selectedFlow;
            return (
              <button
                key={it.key}
                onClick={() => onSelectFlow(it.key)}
                className={
                  'w-full inline-flex items-center gap-2 px-3 py-2 rounded-md border transition ' +
                  (active
                    ? 'bg-slate-700 text-white border-slate-700 shadow'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200')
                }
              >
                {it.icon}
                <span className="text-sm">{it.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 内容を整理する */}
      <div className="px-4 pb-2">
        <button
          onClick={onToggleOrganizer}
          className="w-full py-2 rounded-lg bg-sky-100 text-sky-700 border border-sky-200 hover:bg-sky-50 transition"
        >
          内容を整理する
        </button>
      </div>

      {/* 履歴 */}
      <div className="px-4 mt-auto pb-4">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between text-xs text-gray-500 py-2">
            <span>チャット履歴</span>
            <ChevronDown size={16} className="transition-transform group-open:rotate-180 text-gray-400" />
          </summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-auto pr-1">
            {sessions?.length ? (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectSession(s.id)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-md border ${
                    currentSessionId === s.id
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s.title || '無題のチャット'}
                </button>
              ))
            ) : (
              <div className="text-xs text-gray-400 px-1 py-2">履歴はまだありません</div>
            )}
          </div>
        </details>
      </div>

      {/* 接続テスト */}
      <div className="px-4 pb-4">
        <ConnectionTest />
      </div>
    </aside>
  );
}

function UserSection() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) {
    return (
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-300" />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-800 truncate">ゲスト</div>
          <div className="text-xs text-gray-500 truncate">未ログイン</div>
        </div>
      </div>
    );
  }

  const initials = (user.full_name || user.name).slice(0, 1);

  return (
    <div className="px-4 py-4 border-b border-gray-100" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center text-sm font-semibold select-none">
          {initials}
        </div>
        <div className="min-w-0 text-left">
          <div className="text-sm font-semibold text-gray-800 truncate">{user.full_name || user.name}</div>
          <div className="text-xs text-gray-500 truncate">{user.department_name || user.email}</div>
        </div>
      </button>
      {open && (
        <div className="mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-100">
            <div className="font-medium text-gray-800">{user.full_name || user.name}</div>
            <div className="text-xs text-gray-500">{user.department_name}</div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
          <div className="p-2">
            <button
              onClick={async () => { await logout(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}