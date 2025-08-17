'use client';
type Props = { user?: { name: string; dept: string; avatar?: string } };

export default function Header({
  user = { name: '鈴木 理沙', dept: '中小企業庁 事業環境部 企画課', avatar: '/avatar.png' },
}: Props) {
  return (
    <div className="flex items-center justify-between relative">
      {/* 左：ユーザー */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <img src={user.avatar || '/avatar.png'} className="w-8 h-8 rounded-full" alt="user" />
        <div>
          <div className="font-medium text-gray-800">{user.name}</div>
          <div className="text-xs text-gray-500">{user.dept}</div>
        </div>
      </div>
      {/* 中央：ロゴ */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <img src="/logo.png" alt="METIST" className="h-8" />
        <span className="text-2xl font-semibold tracking-wide text-sky-700">METIST</span>
      </div>
    </div>
  );
}