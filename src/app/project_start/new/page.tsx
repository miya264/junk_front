'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Plus, User } from 'lucide-react';
import Header from '@/components/Header';  
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import { getUserId, getDepartmentName } from '@/utils/userUtils';
import { ApiService, type Coworker, type ProjectCreateRequest } from '@/services';

export default function NewProject() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Coworker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentQuery, setDepartmentQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Coworker[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // ログインユーザーをCoworker型に変換
  const currentUser: Coworker = {
    id: getUserId(user),
    name: user?.name || 'Unknown User',
    email: user?.email || '',
    department_name: getDepartmentName(user)
  };

  // 検索実行
  const handleSearch = async () => {
    if (!searchQuery.trim() && !departmentQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const results = await ApiService.project.searchCoworkers(searchQuery, departmentQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError('検索に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'));
    } finally {
      setIsSearching(false);
    }
  };

  // 検索結果からメンバーを追加
  const addMember = (coworker: Coworker) => {
    if (selectedMembers.find(m => m.id === coworker.id)) {
      return; // 既に追加済み
    }
    setSelectedMembers(prev => [...prev, coworker]);
  };

  // メンバーを削除
  const removeMember = (coworkerId: number) => {
    setSelectedMembers(prev => prev.filter(m => m.id !== coworkerId));
  };

  // プロジェクト作成
  const handleCreateProject = async () => {
    if (!name.trim()) {
      setError('プロジェクト名を入力してください');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const request: ProjectCreateRequest = {
        name: name.trim(),
        description: description.trim(),
        owner_coworker_id: currentUser.id,
        member_ids: selectedMembers.map(m => m.id),
      };

      const project = await ApiService.project.createProject(request);
      
      // 成功時はプロジェクト詳細ページへ遷移
      router.push(`/project?project_id=${project.id}`);
    } catch (err) {
      console.error('Project creation failed:', err);
      setError('プロジェクトの作成に失敗しました: ' + (err instanceof Error ? err.message : '不明なエラー'));
    } finally {
      setIsCreating(false);
    }
  };

  // エンターキーで検索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || departmentQuery) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, departmentQuery]);

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Header />

        <div className="space-y-6 mt-12">
          {/* プロジェクト名 */}
          <div className="rounded-2xl border border-sky-200 bg-white p-6">
            <label className="block text-sm text-gray-500 mb-1">プロジェクト名</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="プロジェクト名を入力してください"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* プロジェクト概要 */}
          <div className="rounded-2xl border border-sky-200 bg-white p-6">
            <label className="block text-sm text-gray-500 mb-1">プロジェクト概要（任意）</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300 resize-none"
              placeholder="プロジェクトの概要を入力してください"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* プロジェクトオーナー */}
          <div className="rounded-2xl border border-sky-200 bg-white p-6">
            <label className="block text-sm text-gray-500 mb-3">プロジェクトオーナー</label>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">{currentUser.name}</div>
                <div className="text-sm text-blue-600">{currentUser.department_name}</div>
              </div>
            </div>
          </div>

          {/* メンバー検索 */}
          <div className="rounded-2xl border border-sky-200 bg-white p-6">
            <label className="block text-sm text-gray-500 mb-3">メンバー検索・追加</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder="名前で検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-sky-300"
                  placeholder="部署名で検索"
                  value={departmentQuery}
                  onChange={(e) => setDepartmentQuery(e.target.value)}
                />
              </div>
            </div>

            {/* 検索結果 */}
            {isSearching && (
              <div className="text-center py-4 text-gray-500">検索中...</div>
            )}
            
            {!isSearching && searchResults.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">検索結果 ({searchResults.length}件)</div>
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  {searchResults.map((coworker) => (
                    <div
                      key={coworker.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div>
                        <div className="font-medium">{coworker.name}</div>
                        <div className="text-sm text-gray-500">
                          {coworker.department_name} {coworker.position && `• ${coworker.position}`}
                        </div>
                      </div>
                      <button
                        onClick={() => addMember(coworker)}
                        disabled={selectedMembers.some(m => m.id === coworker.id)}
                        className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 選択されたメンバー */}
            <div>
              <div className="text-sm text-gray-600 mb-2">選択されたメンバー ({selectedMembers.length}人)</div>
              {selectedMembers.length === 0 ? (
                <div className="text-gray-400 py-4 text-center border rounded-lg">
                  メンバーを検索して追加してください
                </div>
              ) : (
                <div className="space-y-2 border rounded-lg p-3">
                  {selectedMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.department_name}</div>
                      </div>
                      <button
                        onClick={() => removeMember(member.id)}
                        className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* ボタン */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/project_start"
            className="px-6 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            戻る
          </Link>
          <button
            onClick={handleCreateProject}
            disabled={isCreating || !name.trim()}
            className="px-10 py-2 rounded-full bg-slate-800 text-white hover:bg-slate-900 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreating ? '作成中...' : 'プロジェクト作成'}
          </button>
        </div>
      </div>
    </main>
    </AuthGuard>
  );
}