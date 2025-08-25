// src/app/project_start/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ApiService, type Project } from '@/services';
import Header from '@/components/Header'; // ← 追加

export default function ProjectStart() {
  const [open, setOpen] = useState(false);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = 1; // TODO: 実際のログインユーザーIDを取得

  // 自分のプロジェクト一覧を取得
  const loadMyProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const projects = await ApiService.project.getProjectsByCoworker(currentUserId);
      setMyProjects(projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('プロジェクト一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && myProjects.length === 0) {
      loadMyProjects();
    }
  }, [open]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* ▼ 共通ヘッダー（ロゴ + ユーザー情報） */}
        <div className="mb-10">
          <Header />
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
              {loading && (
                <div className="px-5 py-4 text-center text-gray-500">プロジェクト一覧を読み込み中...</div>
              )}

              {error && <div className="px-5 py-4 text-center text-red-600">{error}</div>}

              {!loading && !error && myProjects.length === 0 && (
                <div className="px-5 py-4 text-center text-gray-500">参加しているプロジェクトがありません</div>
              )}

              {!loading && !error && myProjects.length > 0 && (
                <>
                  {myProjects.map((project, idx) => {
                    const updatedAt = new Date(project.updated_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    });

                    return (
                      <Link
                        key={project.id}
                        href={`/project?project_id=${project.id}`}
                        className={`flex items-center justify-between px-5 py-3 text-gray-700 hover:bg-gray-50 ${
                          idx < myProjects.length - 1 ? 'border-b border-gray-200/70' : ''
                        }`}
                      >
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-xs text-gray-500">オーナー: {project.owner_name}</div>
                        </div>
                        <span className="text-xs text-gray-400">{updatedAt}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}