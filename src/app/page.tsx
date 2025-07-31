'use client';

import dynamic from 'next/dynamic';

// クライアントコンポーネントを動的インポート
const ChatApp = dynamic(() => import('./components/ChatApp'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">読み込み中...</p>
    </div>
  </div>
});

export default function Page() {
  return <ChatApp />;
} 