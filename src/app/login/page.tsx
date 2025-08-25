'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // 既にログイン済みの場合はproject_startにリダイレクト
      router.push('/project_start');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // リダイレクト中
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.png" alt="METIST" className="h-8 w-auto" />
          <span className="text-2xl font-semibold tracking-wide text-sky-700">METIST</span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}

