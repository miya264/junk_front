'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiService, type Project } from '@/services';

export default function TopActions({ searchHref = '/project_start/search' }: { searchHref?: string }) {
  const [open, setOpen] = useState(false);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = 1;

  useEffect(() => {
    const load = async () => {
      if (!open || myProjects.length > 0) return;
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
    load();
  }, [open, myProjects.length]);

  //幅を統一（例: 240px）
  const buttonClass =
    'w-[240px] text-center rounded-full bg-slate-700 text-white px-6 py-2 shadow-sm hover:opacity-95';

  return (
    <div className="mt-8 flex items-center justify-center gap-6">
      <Link href="/project_start/new" className={buttonClass}>
        新しいプロジェクト
      </Link>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className={buttonClass + ' inline-flex items-center justify-center gap-2'}
        >
          他のプロジェクト <span className="select-none">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="absolute left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden min-w-[240px] z-50 max-h-64 overflow-y-auto">
            {loading && <div className="px-4 py-3 text-gray-500 text-sm">読み込み中...</div>}
            {error && <div className="px-4 py-3 text-red-600 text-sm">{error}</div>}
            {!loading && !error && myProjects.length === 0 && (
              <div className="px-4 py-3 text-gray-500 text-sm">参加しているプロジェクトがありません</div>
            )}
            {!loading &&
              !error &&
              myProjects.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/project?project_id=${p.id}`}
                  className={`block px-4 py-3 text-gray-700 hover:bg-gray-50 ${
                    i < myProjects.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {p.name}
                </Link>
              ))}
          </div>
        )}
      </div>

      <Link href={searchHref} className={buttonClass}>
        他のプロジェクトを検索する
      </Link>
    </div>
  );
}