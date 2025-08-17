'use client';
import Header from '@/components/Header';
import SearchForm, { Row } from '@/components/SearchForm';

const DUMMY_ROWS: Row[] = [
  { id: 'p-101', date: '2023/01/15', title: '再エネ導入支援', owner: '山口 真理子', bureau: 'エネルギー庁' },
  { id: 'p-102', date: '2023/02/20', title: 'サプライチェーン強靭化', owner: '木村 周太', bureau: '製造産業局 自動車課' },
  { id: 'p-103', date: '2023/03/10', title: 'データ利活用政策', owner: '伊藤 奈希', bureau: '商務情報政策局 情報経済課' },
];

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Header />
        <SearchForm rows={DUMMY_ROWS} />
      </div>
    </main>
  );
}