'use client';

import React, { useEffect, useRef } from 'react';
import { MessageCircle, Sparkles, Menu, X } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatSidebar } from './ChatSidebar';
import { InitialView } from './InitialView';
import { useChat } from '../hooks/useChat';

export default function ChatApp() {
  const { 
    sessions, 
    currentSessionId, 
    messages, 
    sendMessage, 
    selectSession, 
    startNewChat, 
    isLoading 
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isInitialView = !currentSessionId || messages.length === 0;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Always visible on desktop */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-50 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out w-80 lg:w-80`}>
        <ChatSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={(sessionId) => {
            selectSession(sessionId);
            setSidebarOpen(false);
          }}
          onNewChat={() => {
            startNewChat();
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - only show in chat view */}
        {!isInitialView && (
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <Menu size={20} />
                </button>
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <MessageCircle className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    AIエージェント
                    <Sparkles size={18} className="text-purple-500" />
                  </h1>
                  <p className="text-sm text-gray-600">
                    インテリジェント検索対応チャット
                  </p>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {isInitialView ? (
            <InitialView onSendMessage={sendMessage} isLoading={isLoading} />
          ) : (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50">
                <div className="max-w-4xl mx-auto py-6 space-y-1">
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 bg-white">
                <div className="max-w-4xl mx-auto p-4">
                  <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
} 