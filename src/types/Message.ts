export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  searchType?: 'fact' | 'network';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiMessage {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: string;
  search_type?: string;
}

export interface ApiChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}