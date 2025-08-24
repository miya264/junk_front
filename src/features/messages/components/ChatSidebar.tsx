'use client';

import React from 'react';
import { Home, ClipboardList, Target, Lightbulb, Settings2, FileText, ChevronDown } from 'lucide-react';
import { ConnectionTest } from '@/components/ConnectionTest';
import type { FlowKey } from '@/types/flow';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { NameAvatar } from '@/components/NameAvatar';

type Props = {
  sessions: any[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;

  selectedFlow: FlowKey;
  onSelectFlow: (key: FlowKey) => void;

  onToggleOrganizer: () => void;
  projectId?: string; // ★ 追加
};

export default function ChatSidebar(props: Props) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const {
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    selectedFlow,
    onSelectFlow,
    onToggleOrganizer,
    projectId,
  } = props;

  const items: { key: FlowKey; label: string; icon: React.ReactNode }[] = [
    { key: 'analysis',  label: '現状分析・課題整理', icon: <ClipboardList size={16} /> },
    { key: 'objective', label: '目的整理',           icon: <Target size={16} /> },
    { key: 'concept',   label: 'コンセプト策定',     icon: <Lightbulb size={16} /> },
    { key: 'plan',      label: '施策立案',           icon: <Settings2 size={16} /> },
    { key: 'proposal',  label: '資料作成',           icon: <FileText size={16} /> },
  ];

  const displayName = user?.name ?? 'ゲスト';
  const displayDept = user?.dept ?? '（部署未設定）';

  // ホームボタン押下時の遷移処理
  const handleHomeClick = () => {
    if (projectId && projectId.trim().length > 0) {
      router.push(`/project?project_id=${encodeURIComponent(projectId)}`);
    } else {
      router.push('/project');
    }
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* ユーザー */}
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <NameAvatar name={displayName} src={user?.imageUrl} size={40} />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-800 truncate">{displayName}</div>
          <div className="text-xs text-gray-500 truncate">{displayDept}</div>
        </div>
      </div>

      {/* ホーム＝新規チャット（編集中プロジェクトへ戻る） */}
      <div className="px-4 pt-4">
        <button
          onClick={handleHomeClick}
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
              sessions.map((s: any) => (
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
