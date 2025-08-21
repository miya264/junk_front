const API_BASE_URL = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://127.0.0.1:8000';

export interface MessageRequest {
  content: string;
  search_type?: 'fact' | 'network';
  flow_step?: 'analysis' | 'objective' | 'concept' | 'plan' | 'proposal';
  context?: any;
  session_id?: string;
  project_id?: string;
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

export interface FlexiblePolicyResponse {
  id: string;
  content: string;
  step: string;
  timestamp: string;
  session_id: string;
  project_id?: string;
  full_state?: {
    analysis_result?: string;
    objective_result?: string;
    concept_result?: string;
    plan_result?: string;
    proposal_result?: string;
    last_updated_step?: string;
    step_timestamps?: Record<string, string>;
  };
}

export interface SessionState {
  session_id: string;
  project_id?: string;
  analysis_result?: string;
  objective_result?: string;
  concept_result?: string;
  plan_result?: string;
  proposal_result?: string;
  last_updated_step?: string;
  step_timestamps?: Record<string, string>;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`API Request: ${options?.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response');
      console.error(`API Error Response: ${errorText}`);
      throw new ApiError(response.status, `HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Success:', data);
    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check your internet connection and try again.');
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

  async sendFlexiblePolicyMessage(request: MessageRequest): Promise<FlexiblePolicyResponse> {
    return fetchApi<FlexiblePolicyResponse>('/api/policy-flexible', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getSessionState(sessionId: string): Promise<SessionState> {
    return fetchApi<SessionState>(`/api/session-state/${sessionId}`);
  },

  async healthCheck(): Promise<{ message: string }> {
    try {
      const response = await fetchApi<{ message: string }>('/');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  },
};