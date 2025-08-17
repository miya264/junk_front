'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

type LockInfo = { count: number; lockedUntil?: number };

const EMP_ID_RULE = /^[0-9]{5,}$/; // 例：5桁以上の数字
const PASS_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // 英数1文字以上含む8文字以上

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
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lock = useMemo(getLockInfo, []);
  const now = Date.now();
  const lockedRemaining = lock.lockedUntil && lock.lockedUntil > now ? lock.lockedUntil - now : 0;
  const locked = lockedRemaining > 0;

  const empIdError = empId && !EMP_ID_RULE.test(empId) ? '職員番号は5桁以上の数字で入力してください' : '';
  const passError =
    password && !PASS_RULE.test(password)
      ? '半角英数8文字以上（英字・数字を各1文字以上）'
      : '';

  const canSubmit = !locked && EMP_ID_RULE.test(empId) && PASS_RULE.test(password) && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      // フロント側でも一旦ハッシュ化（送信前処理）
      const hashed = await bcrypt.hash(password, 10);

      /**
       * 本来は以下のようにHTTPSでサーバへ送信：
       * await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ empId, password }) })
       * → サーバ側で認証＆サーバ側でハッシュ照合＆JWT発行
       */

      // ------- モック処理（DB未構築のため） -------
      // デモでは「empIdが5桁以上でpasswordが規則を満たせば成功」とする
      const ok = EMP_ID_RULE.test(empId) && PASS_RULE.test(password);
      if (!ok) throw new Error('認証に失敗しました');

      // 疑似JWT（ダミー）。実運用はサーバ発行のJWTを保存
      const pseudoJwt = btoa(
        JSON.stringify({
          sub: empId,
          iat: Date.now(),
          rnd: crypto.getRandomValues(new Uint32Array(1))[0],
        }),
      );

      // クッキーではなく sessionStorage に格納（デモ用）
      sessionStorage.setItem(
        'auth',
        JSON.stringify({
          token: pseudoJwt,
          // 送る必要はないが、送信前にハッシュした値を保存しておく例（デモ）
          clientHashedPassword: hashed,
          expiresAt: Date.now() + 60 * 60 * 1000, // 1h
        }),
      );
      clearLock();

      // 遷移
      router.push('/project_start');
    } catch (err: any) {
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
      {/* 職員番号 */}
      <label className="block text-sm font-medium text-gray-700 mb-1">職員番号</label>
      <input
        inputMode="numeric"
        autoCapitalize="off"
        autoCorrect="off"
        name="empId"
        placeholder="12345"
        value={empId}
        onChange={(e) => setEmpId(e.target.value.trim())}
        disabled={submitting || locked}
        className={`w-full rounded-lg border px-3 py-2 mb-2 outline-none ${
          empIdError ? 'border-red-300 focus:border-red-400' : 'border-gray-300 focus:border-gray-400'
        }`}
      />
      {empIdError && <p className="text-xs text-red-500 mb-3">{empIdError}</p>}

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