'use client';

import Link from 'next/link';
import { useState } from 'react';

type MyProject = { id: string; title: string; updatedAt: string };

const DUMMY_MY_PROJECTS: MyProject[] = [
  { id: 'p-001', title: 'プロジェクト #1', updatedAt: '2024/08/10' },
  { id: 'p-002', title: 'プロジェクト #2', updatedAt: '2024/07/22' },
  { id: 'p-003', title: 'プロジェクト #3', updatedAt: '2024/05/03' },
];

export default function ProjectStart() {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* ヘッダー（ロゴ＋タイトル、左にユーザー名のダミー） */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <img src="/avatar.png" className="w-8 h-8 rounded-full" alt="user" />
            <div>
              <div className="font-medium text-gray-800">鈴木 理沙</div>
              <div className="text-xs text-gray-500">自治体担当・政策推進</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" className="h-8" alt="METIST" />
            <span className="text-2xl font-semibold tracking-wide text-sky-700">METIST</span>
          </div>
          <div className="w-20" />
        </div>

        {/* 中央の3ボタン */}
        <div className="max-w-xl mx-auto space-y-5 pt-6">
          <Link
            href="/project_start/new"
            className="block text-center rounded-full bg-slate-700 text-white py-3 px-6 shadow-sm hover:opacity-95"
          >
            新しいプロジェクトを立ち上げる
          </Link>

          <Link
            href="/project_start/search"
            className="block text-center rounded-full bg-slate-700 text-white/90 py-3 px-6 shadow-sm hover:opacity-95"
          >
            他のプロジェクトを検索する
          </Link>

          {/* 続きを進める（ディスクロージャ） */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full text-center rounded-full bg-slate-700 text-white py-3 px-6 shadow-sm hover:opacity-95 relative"
          >
            自分のプロジェクトの続きを進める
            <span className="absolute right-5 top-1/2 -translate-y-1/2 select-none">
              {open ? '▲' : '▼'}
            </span>
          </button>

          {open && (
            <div className="mt-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
              {DUMMY_MY_PROJECTS.map((p, idx) => (
                <Link
                  key={p.id}
                  href={`/project/}`}//のちに{`/project/${p.id}`}へ変更
                  className={`flex items-center justify-between px-5 py-3 text-gray-700 hover:bg-gray-50 ${
                    idx < DUMMY_MY_PROJECTS.length - 1 ? 'border-b border-gray-200/70' : ''
                  }`}
                >
                  <span>{p.title}</span>
                  <span className="text-xs text-gray-400">{p.updatedAt}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}