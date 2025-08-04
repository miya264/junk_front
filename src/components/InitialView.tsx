import React, { useState } from 'react';
import { Send, Search, Users, Sparkles, MessageCircle } from 'lucide-react';

interface InitialViewProps {
  onSendMessage: (content: string, searchType?: 'fact' | 'network') => void;
  isLoading: boolean;
}

export const InitialView: React.FC<InitialViewProps> = ({ onSendMessage, isLoading }) => {
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
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <MessageCircle className="text-white" size={48} />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              AIエージェント
              <Sparkles size={32} className="text-purple-500" />
            </h1>
            <p className="text-lg text-gray-600">
              何でもお聞きください。ファクト検索や人脈検索も可能です。
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="メッセージを入力してください..."
              className="w-full p-6 pr-16 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 shadow-lg text-lg"
              rows={3}
              disabled={isLoading}
            />
            <div className="absolute right-4 bottom-4 text-sm text-gray-400">
              Enter送信
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group"
            >
              <Send size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              <span className="font-medium">送信</span>
            </button>
            
            <button
              onClick={() => handleSubmit('fact')}
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group"
            >
              <Search size={18} className="group-hover:rotate-12 transition-transform duration-200" />
              <span className="font-medium">ファクト検索</span>
            </button>
            
            <button
              onClick={() => handleSubmit('network')}
              disabled={!input.trim() || isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group"
            >
              <Users size={18} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">人脈検索</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};