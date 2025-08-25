'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchForm, { Row } from '@/components/SearchForm';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserId } from '@/utils/userUtils';
import { ApiService } from '@/services';
import type { Project } from '@/services';

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
  const { user } = useAuth();
  const [userProjects, setUserProjects] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProjects = async () => {
      if (!user) return;

      try {
        const currentUserId = getUserId(user);
        const projects = await ApiService.project.getProjectsByCoworker(currentUserId);
        
        // Project型をRow型に変換
        const rows: Row[] = projects.map(project => ({
          id: project.id,
          date: new Date(project.created_at).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }),
          title: project.name,
          owner: project.owner_name,
          bureau: '所属部署' // TODO: 実際の部署情報に置き換え
        }));
        
        setUserProjects(rows);
      } catch (error) {
        console.error('Failed to load user projects:', error);
        // エラー時はダミーデータを使用
        setUserProjects(DUMMY_ROWS);
      } finally {
        setLoading(false);
      }
    };

    loadUserProjects();
  }, [user]);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <Header />

          {/* ★ ロゴの下・検索枠の上に右寄せで配置 */}
          <BackButtons />

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">プロジェクトを読み込み中...</p>
            </div>
          ) : (
            <SearchForm rows={userProjects} />
          )}
        </div>
      </main>
    </AuthGuard>
  );
}