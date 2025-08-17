'use client';
import Link from 'next/link';
import { useState } from 'react';

export type SimpleProject = { id: string; title: string };

export default function TopActions({
  others = [
    { id: 'p-101', title: 'プロジェクト #1' },
    { id: 'p-102', title: 'プロジェクト #2' },
    { id: 'p-103', title: 'プロジェクト #3' },
  ],
  searchHref = '/project_start/search', 
}: { others?: SimpleProject[]; searchHref?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8 flex items-center justify-center gap-6">
      <Link href="/project_start/new" className="rounded-full bg-slate-700 text-white px-6 py-2 shadow-sm hover:opacity-95">
        新しいプロジェクト
      </Link>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-slate-700 text-white px-6 py-2 shadow-sm hover:opacity-95"
        >
          他のプロジェクト <span className="select-none">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="absolute left-0 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden min-w-[240px]">
            {others.map((p, i) => (
              <Link
                key={p.id}
                href={`/project/${p.id}`}
                className={`block px-4 py-3 text-gray-700 hover:bg-gray-50 ${i < others.length - 1 ? 'border-b border-gray-100' : ''}`}
                onClick={() => setOpen(false)}
              >
                {p.title}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link href={searchHref} className="rounded-full bg-slate-700 text-white px-6 py-2 shadow-sm hover:opacity-95">
        他のプロジェクトを検索する
      </Link>
    </div>
  );
}