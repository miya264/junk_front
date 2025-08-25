'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type LockInfo = { count: number; lockedUntil?: number };

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // メールアドレス形式
const PASS_RULE = /^.{3,}$/; // 3文字以上（テスト用に簡素化）

// ローカル簡易レート制限（5回失敗で5分ロック）
const LIMIT_KEY = 'login_lock_info';
const MAX_TRIES = 5;
const LOCK_MS = 5 * 60 * 1000;

function getLockInfo(): LockInfo {
  try {
    return JSON.parse(localStorage.getItem(LIMIT_KEY) || '{}') as LockInfo;
  } catch {
    return { count: 0 };
  }
}
function setLockInfo(v: LockInfo) {
  localStorage.setItem(LIMIT_KEY, JSON.stringify(v));
}
function clearLock() {
  localStorage.removeItem(LIMIT_KEY);
}

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lock = useMemo(getLockInfo, []);
  const now = Date.now();
  const lockedRemaining = lock.lockedUntil && lock.lockedUntil > now ? lock.lockedUntil - now : 0;
  const locked = lockedRemaining > 0;

  const emailError = email && !EMAIL_RULE.test(email) ? 'メールアドレスの形式が正しくありません' : '';
  const passError =
    password && !PASS_RULE.test(password)
      ? '3文字以上入力してください'
      : '';

  const canSubmit = !locked && EMAIL_RULE.test(email) && PASS_RULE.test(password) && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      // サーバーサイドでパスワード検証とJWT生成を実行
      await login(email, password);
      
      clearLock();

      // ログイン成功後、project_startに遷移
      router.push('/project_start');
    } catch {
      // 失敗回数カウント
      const info = getLockInfo();
      const next = (info.count || 0) + 1;
      if (next >= MAX_TRIES) {
        setLockInfo({ count: 0, lockedUntil: Date.now() + LOCK_MS });
        setError(`試行回数が上限に達しました。${Math.ceil(LOCK_MS / 60000)}分後に再試行してください。`);
      } else {
        setLockInfo({ count: next, lockedUntil: 0 });
        setError(`ログインに失敗しました（残り ${MAX_TRIES - next} 回でロック）`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm"
    >
      {/* メールアドレス */}
      <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
      <input
        type="email"
        inputMode="email"
        autoCapitalize="off"
        autoCorrect="off"
        name="email"
        placeholder="example@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value.trim())}
        disabled={submitting || locked}
        className={`w-full rounded-lg border px-3 py-2 mb-2 outline-none ${
          emailError ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-gray-400'
        }`}
      />
      {emailError && <p className="text-xs text-red-500 mb-3">{emailError}</p>}

      {/* パスワード */}
      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
      <div className="relative">
        <input
          type={showPwd ? 'text' : 'password'}
          autoCapitalize="off"
          autoCorrect="off"
          name="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting || locked}
          className={`w-full rounded-lg border px-3 py-2 pr-10 outline-none ${
            passError ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-gray-400'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPwd((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label={showPwd ? 'パスワードを隠す' : 'パスワードを表示'}
        >
        </button>
      </div>
      {passError && <p className="text-xs text-red-500 mt-2">{passError}</p>}

      {/* 忘れた場合 */}
      <div className="mt-3">
        <a className="text-xs text-gray-500 underline hover:text-gray-700" href="/forgot">
          パスワードを忘れた方はこちら
        </a>
      </div>

      {/* エラー / ロック中 */}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {locked && (
        <p className="mt-2 text-xs text-orange-600">
          ログインが一時的に制限されています（しばらくお待ちください）
        </p>
      )}

      {/* 送信 */}
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={!canSubmit}
          className="px-10 py-2 rounded-full bg-slate-800 text-white disabled:opacity-50"
        >
          {submitting ? 'Processing…' : 'Login'}
        </button>
      </div>
    </form>
  );
}