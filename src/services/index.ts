/**
 * サービス層のエントリーポイント
 * 各APIサービスを統合してエクスポート
 */

// API クライアント
export { 
  apiRequest, 
  get, 
  post, 
  put, 
  del, 
  healthCheck, 
  testConnection, 
  ApiError,
  API_BASE_URL 
} from './apiClient';

// プロジェクトサービス
import { ProjectService } from './projectService';
import { ChatService } from './chatService';

export { 
  ProjectService,
  type Coworker,
  type Project,
  type ProjectCreateRequest,
  type ProjectStepSection,
  type ProjectStepSectionRequest,
  type ProjectStepSectionResponse
} from './projectService';

// チャットサービス
export { 
  ChatService,
  type MessageRequest,
  type MessageResponse,
  type ChatSession,
  type FlexiblePolicyResponse,
  type SessionState
} from './chatService';

/**
 * 統合APIサービス
 * 全てのAPIを一元管理
 */
export class ApiService {
  // プロジェクト関連
  static project = ProjectService;
  
  // チャット関連
  static chat = ChatService;
  }