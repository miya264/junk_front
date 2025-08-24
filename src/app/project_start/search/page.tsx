'use client';
import Header from '@/components/Header';
import SearchForm, { Row } from '@/components/SearchForm';
import { useRouter } from 'next/navigation';

const DUMMY_ROWS: Row[] = [
  { id: 'p-101', date: '2023/01/15', title: '再エネ導入支援', owner: '山口 真理子', bureau: 'エネルギー庁' },
  { id: 'p-102', date: '2023/02/20', title: 'サプライチェーン強靭化', owner: '木村 周太', bureau: '製造産業局 自動車課' },
  { id: 'p-103', date: '2023/03/10', title: 'データ利活用政策', owner: '伊藤 奈希', bureau: '商務情報政策局 情報経済課' },
];

// 戻るボタンコンポーネント
function BackButtons() {
  const router = useRouter();
  return (
    <div className="flex gap-2 my-6 justify-end"> {/* ← 右寄せ */}
      <button
        onClick={() => router.push('/project')}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        プロジェクト一覧へ
      </button>
      <button
        onClick={() => router.push('/project_start')}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        新規プロジェクトへ
      </button>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Header />

        {/* ★ ロゴの下・検索枠の上に右寄せで配置 */}
        <BackButtons />

        <SearchForm rows={DUMMY_ROWS} />
      </div>
    </main>
  );
}