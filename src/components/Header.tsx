'use client';

import React, { useMemo } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import type { AppUser } from '../types/user';

/** 名前からイニシャル（2文字まで）を生成 */
function getInitials(name?: string) {
  if (!name) return '?';
  // 全角・半角スペースで分割
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return (first + last).toUpperCase();
}

/** 画像が無ければイニシャル丸アイコンを描画 */
function Avatar({ name, imageUrl, size = 32 }: { name?: string; imageUrl?: string | null; size?: number }) {
  const initials = getInitials(name);
  const px = `${size}px`;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'user'}
        style={{ width: px, height: px }}
        className="rounded-full object-cover bg-gray-100"
      />
    );
  }
  return (
    <div
      style={{ width: px, height: px }}
      className="rounded-full bg-slate-600 text-white flex items-center justify-center text-xs select-none"
      aria-label={name || 'user'}
      title={name || ''}
    >
      {initials}
    </div>
  );
}

type Props = {
  /** 明示的に上書きしたい場合に渡す（なければログインユーザーを表示） */
  user?: Partial<AppUser>; // { name, dept, imageUrl } など
  /** ロゴ画像のパス（省略時は /logo.png） */
  logoSrc?: string;
};

export default function Header({ user, logoSrc = '/logo.png' }: Props) {
  const { user: me, loading } = useCurrentUser();

  // props.user が優先。なければ /api/me の結果。それも無ければダミー
  const display = useMemo<AppUser>(() => {
    const fallback: AppUser = {
      id: 0,
      name: '鈴木 理沙',
      dept: '中小企業庁 事業環境部 企画課',
      email: '',
      imageUrl: '',
    };
    return {
      ...(fallback as AppUser),
      ...(me || {}),
      ...(user || {}),
    };
  }, [me, user]);

  return (
    <div className="relative flex items-center justify-between">
      {/* 左：ユーザー */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {loading ? (
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <Avatar name={display.name} imageUrl={display.imageUrl || undefined} size={32} />
        )}
        <div className="min-w-0">
          <div className="font-medium text-gray-800 truncate">{display.name}</div>
          <div className="text-xs text-gray-500 truncate">{display.dept || ''}</div>
        </div>
      </div>

      {/* 中央：ロゴ（常にセンター） */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <img src={logoSrc} alt="METIST" className="h-8" />
        <span className="text-2xl font-semibold tracking-wide text-sky-700">METIST</span>
      </div>

      {/* 右側に何も置かない場合の余白（レイアウト安定用） */}
      <div className="w-8" />
    </div>
  );
}