//250813かんちゃん書き換え

import React, { useState } from "react";

type Props = {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
};

export function InitialView({ onSendMessage, isLoading }: Props) {
  const [text, setText] = useState("");

  const send = (value?: string) => {
    const payload = (value ?? text).trim();
    if (!payload || isLoading) return;
    onSendMessage(payload);
    setText("");
  };

  // モード別送信（タグを付けて送る簡易実装）
  const sendWithMode = (mode: "test" | "fact" | "network") => {
    const tag =
      mode === "test" ? "[送信]" : mode === "fact" ? "[ファクト検索]" : "[人脈検索]";
    send(`${tag} ${text}`.trim());
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="h-full max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        {/* ロゴ */}
        {/* public/logo.png を配置してください（.svg でも可） */}
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.png" alt="METIST" className="h-8" />
          <span className="text-2xl font-semibold tracking-wide text-sky-700">METIST</span>
        </div>
    

        {/* 見出し */}
        <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          今日はどんなことにお困りですか？
        </h1>

        {/* 大型検索ボックス */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center bg-white rounded-full border border-gray-200 px-4 py-3 shadow-sm">
            <span className="mr-2 text-gray-400">🔍</span>
            <input
              type="text"
              className="flex-1 outline-none text-gray-800 placeholder:text-gray-400"
              placeholder="質問してみましょう"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              disabled={isLoading}
            />
            <span className="text-gray-400 text-xs ml-2">Enter 送信</span>
          </div>

          {/* モードボタン */}
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => sendWithMode("test")}
              disabled={isLoading || !text.trim()}
              className="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
              title="試験モードで送信"
            >
              ▶ 送信
            </button>
            <button
              onClick={() => sendWithMode("fact")}
              disabled={isLoading || !text.trim()}
              className="px-4 py-2 rounded-full bg-green-100 text-green-700 border border-green-200 hover:bg-green-50 disabled:opacity-50"
              title="ファクト検索モードで送信"
            >
              🔎 ファクト検索
            </button>
            <button
              onClick={() => sendWithMode("network")}
              disabled={isLoading || !text.trim()}
              className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-50 disabled:opacity-50"
              title="人脈検索モードで送信"
            >
              👥 人脈検索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InitialView;