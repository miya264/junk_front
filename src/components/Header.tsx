'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function getInitials(name: string): string {
  // フルネームから名字を取得（日本語対応）
  const parts = name.split(/\s+/); // スペースで分割
  if (parts.length >= 2) {
    // 「山田 太郎」 -> 「山田」の最初の文字
    return parts[0][0] || '?';
  }
  // 単一名の場合は最初の文字
  return name[0] || '?';
}

export default function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    // ログインしていない場合はロゴのみ表示
    return (
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="METIST" className="h-8" />
          <span className="text-2xl font-semibold tracking-wide text-sky-700">METIST</span>
        </div>
      </div>
    );
  }

  const initials = getInitials(user.full_name || user.name);

  return (
    <div className="flex items-center justify-between relative">
      {/* 左：ユーザー */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {/* イニシャルアイコン */}
          <div className="w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-semibold select-none">
            {initials}
          </div>
          <div>
            <div className="font-medium text-gray-800">{user.full_name || user.name}</div>
            <div className="text-xs text-gray-500">{user.department_name || user.email}</div>
          </div>
        </button>

        {/* ドロップダウンメニュー */}
        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-gray-100">
              <div className="font-medium text-gray-800">{user.full_name || user.name}</div>
              <div className="text-xs text-gray-500">{user.department_name}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 中央：ロゴ */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <img src="/logo.png" alt="METIST" className="h-8" />
        <span className="text-2xl font-semibold tracking-wide text-sky-700">METIST</span>
      </div>

      {/* 右側のスペース */}
      <div className="w-8"></div>
    </div>
  );
}