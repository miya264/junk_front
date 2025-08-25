import React, { useState } from "react";
import { Send, Search, Users } from "lucide-react";

type SearchType = "fact" | "network";

interface ChatInputProps {
  /** 親にテキストと検索種別を渡す（通常送信時は searchType 未指定） */
  onSendMessage: (content: string, searchType?: SearchType) => void | Promise<void>;
  /** 送信処理中の無効化制御（親側のロード状態） */
  isLoading: boolean;
}

/**
 * チャット下部の入力欄
 * - Enter で通常送信（Shift+Enter で改行）
 * - 緑ボタン = ファクト検索（fact）
 * - 紫ボタン = 人脈検索（network）
 * - 検索ボタンは入力内容を保持（再検索しやすくする）
 */
export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);          // ★ ローカルの送信中フラグ（多重送信防止）
  const [isComposing, setIsComposing] = useState(false); // ★ IME 変換中フラグ（Enter送信抑止）

  const hasText = !!input.trim();
  const disabled = !hasText || isLoading || busy;

  /** 通常送信（送信後は入力クリア） */
  const handleSend = async () => {
    if (disabled) return;
    const text = input.trim();
    try {
      setBusy(true);
      await onSendMessage(text);
      setInput("");
    } finally {
      setBusy(false);
    }
  };

  /** 検索系（入力は保持：微修正しながら何度も試せるように） */
  const handleSearch = async (type: SearchType) => {
    if (disabled) return;
    const text = input.trim();
    try {
      setBusy(true);
      await onSendMessage(text, type);
      // NOTE: 検索は入力を残す（必要なら下の1行を有効に）
      // setInput("");
    } finally {
      setBusy(false);
    }
  };

  /** Enter 送信 / Shift+Enter 改行（IME 変換中は送信しない） */
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (isComposing) return; // 日本語変換中は無視
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // テキストエリアの見た目（行数）を現在の改行数で可変に
  const lineCount = Math.max(1, input.split("\n").length);
  const rows = lineCount > 3 ? 4 : lineCount;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              aria-label="メッセージ入力欄"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}  // ★ IME開始
              onCompositionEnd={() => setIsComposing(false)}   // ★ IME終了
              placeholder="メッセージを入力してください…（Enterで送信 / Shift+Enterで改行）"
              className="w-full p-4 pr-16 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm"
              rows={rows}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-400 select-none">Enter送信</div>
          </div>

          {/* 送信・検索ボタン群 */}
          <div className="flex gap-2">
            {/* 通常送信 */}
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled}
              className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 group"
              title="送信"
              aria-label="送信"
              aria-disabled={disabled}
            >
              <Send size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>

            {/* ファクト検索 */}
            <button
              type="button"
              onClick={() => handleSearch("fact")}
              disabled={disabled}
              className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 group"
              title="ファクト検索"
              aria-label="ファクト検索"
              aria-disabled={disabled}
            >
              <Search size={18} className="group-hover:rotate-12 transition-transform duration-200" />
            </button>

            {/* 人脈検索（青い人物ボタン相当） */}
            <button
              type="button"                               // ★ フォーム submit を防ぐ
              onClick={() => handleSearch("network")}
              disabled={disabled}
              className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 group"
              title="人脈検索"
              aria-label="人脈検索"
              aria-disabled={disabled}
            >
              <Users size={18} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* 凡例 */}
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded" />
            <span>通常送信</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded" />
            <span>ファクト検索</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded" />
            <span>人脈検索</span>
          </div>
        </div>
      </div>
    </div>
  );
};
