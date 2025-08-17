'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';  

export default function NewProject() {
  const [name, setName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Header />

        {/* 入力の枠 */}
        <div className="space-y-6 mt-12">
          <div className="rounded-2xl border border-sky-200 bg-white p-6">
            <label className="block text-sm text-gray-500 mb-1">プロジェクト名</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none"
              placeholder="プロジェクト名を入力してください"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-6">
            <label className="block text-sm text-gray-500 mb-1">プロジェクトメンバー</label>
            <div className="rounded-lg border border-gray-300 px-3 py-8 text-gray-400">
              プロジェクトメンバーを選択してください
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/project_start"
            className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700"
          >
            戻る
          </Link>
          <button
            className="px-10 py-2 rounded-full bg-slate-800 text-white"
            onClick={() => {
              // 仮IDを採番
              const id = `p-${Date.now().toString(36)}`;

              // 入力値をダミー保存（ページ側で復元）
              localStorage.setItem(
                `project:${id}`,
                JSON.stringify({
                  id,
                  title: name || '（無題プロジェクト）',
                  members: members.length ? members : ['伊藤 彩香', '木村 翔太'],
                })
              );

              // プロジェクトページへ　のちに(`/project/${id}`)へ変更
              router.push(`/project/`);
            }}
          >
            決定
          </button>
        </div>
      </div>
    </main>
  );
}