import React from 'react';
import Image from 'next/image';   // ← 追加
import { User } from 'lucide-react';  // Botは不要
import { Message } from '@/types/Message';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full gap-4 p-4 animate-fade-in ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`${
          isUser ? 'order-2' : 'order-1'
        } flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
        }`}
      >
        {isUser ? (
          <User size={16} />
        ) : (
          <Image
            src="/metist.png"     // ← public/直下にある場合は / でOK
            alt="Bot Icon"
            width={16}
            height={16}
          />
        )}
      </div>

      <div
        className={`${
          isUser ? 'order-1' : 'order-2'
        } max-w-3xl text-left`}
      >
        <div
          className={`inline-block p-4 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          {message.searchType && (
            <div className="mt-2 text-xs opacity-75">
              {message.searchType === 'fact'
                ? '📊 ファクト検索'
                : '👥 人脈検索'}
            </div>
          )}
        </div>

        <div className="mt-1 text-xs text-gray-500">
          {message.timestamp.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
};
