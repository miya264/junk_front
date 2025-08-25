import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, searchType?: 'fact' | 'network') => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (searchType?: 'fact' | 'network') => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), searchType);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力してください..."
              className="w-full p-4 pr-16 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm"
              rows={input.split('\n').length > 3 ? 4 : Math.max(1, input.split('\n').length)}
              disabled={isLoading}
            />
            <div className="absolute right-2 bottom-2 text-xs text-gray-400">
              Enter送信
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit('fact')}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 group"
              title="ファクト検索"
            >
              <Search size={18} className="group-hover:rotate-12 transition-transform duration-200" />
            </button>
            
            <button
              onClick={() => handleSubmit('network')}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 group"
              title="人脈検索"
            >
              <Users size={18} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1"><span>Enter で通常送信</span></div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded"></div>
            <span>ファクト検索</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded"></div>
            <span>人脈検索</span>
          </div>
        </div>
      </div>
    </div>
  );
};