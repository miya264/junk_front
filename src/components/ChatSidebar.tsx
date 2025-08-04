import React from 'react';
import { MessageCircle, Plus, Search, Users, Clock } from 'lucide-react';
import { ChatSession } from '../types/Message';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今日';
    } else if (days === 1) {
      return '昨日';
    } else if (days < 7) {
      return `${days}日前`;
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
  };

  const getSessionIcon = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (lastMessage?.searchType === 'fact') {
      return <Search size={14} className="text-green-500" />;
    } else if (lastMessage?.searchType === 'network') {
      return <Users size={14} className="text-purple-500" />;
    }
    return <MessageCircle size={14} className="text-blue-500" />;
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
          <span className="font-medium">新しいチャット</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 group hover:bg-gray-800 ${
                currentSessionId === session.id 
                  ? 'bg-gray-800 border-l-2 border-blue-500' 
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1 flex-shrink-0">
                  {getSessionIcon(session)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {session.title}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>{formatTime(session.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {sessions.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">チャット履歴はありません</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>通常チャット</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>ファクト検索</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>人脈検索</span>
          </div>
        </div>
      </div>
    </div>
  );
};