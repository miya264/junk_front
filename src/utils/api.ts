const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://127.0.0.1:8000';

export interface MessageRequest {
  content: string;
  search_type?: 'normal' | 'fact' | 'network';
}

export interface MessageResponse {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: string;
  search_type?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const api = {
  async sendMessage(request: MessageRequest): Promise<MessageResponse> {
    return fetchApi<MessageResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getSessions(): Promise<ChatSession[]> {
    return fetchApi<ChatSession[]>('/api/sessions');
  },

  async createSession(): Promise<ChatSession> {
    return fetchApi<ChatSession>('/api/sessions', {
      method: 'POST',
    });
  },

  async healthCheck(): Promise<{ message: string }> {
    return fetchApi<{ message: string }>('/');
  },
};