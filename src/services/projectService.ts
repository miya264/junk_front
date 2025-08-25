/**
 * プロジェクト関連のAPIサービス
 * プロジェクト作成、取得、更新、削除の機能を提供
 */

import { get, post } from './apiClient';

// プロジェクト関連の型定義
export interface Coworker {
  id: number;
  name: string;
  position?: string;
  email: string;
  department_name?: string;
  // 追加フィールド（DBから取得）
  first_name?: string;
  last_name?: string;
  full_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  owner_coworker_id: number;
  member_ids: number[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  owner_coworker_id: number;
  owner_name: string;
  members: Coworker[];
  created_at: string;
  updated_at: string;
}

export interface ProjectStepSection {
  section_key: string;
  content: string;
  label?: string;
}

export interface ProjectStepSectionRequest {
  project_id: string;
  step_key: string;
  sections: ProjectStepSection[];
}

export interface ProjectStepSectionResponse {
  id: string;
  project_id: string;
  step_key: string;
  section_key: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// プロジェクトサービス
export class ProjectService {
  
  /**
   * プロジェクトを作成
   */
  static async createProject(request: ProjectCreateRequest): Promise<Project> {
    console.log('[ProjectService] Creating project:', request);
    return await post<Project>('/api/projects', request);
  }

  /**
   * プロジェクト詳細を取得
   */
  static async getProject(projectId: string): Promise<Project> {
    console.log('[ProjectService] Getting project:', projectId);
    return await get<Project>(`/api/projects/${projectId}`);
  }

  /**
   * coworkerが参加しているプロジェクト一覧を取得
   */
  static async getProjectsByCoworker(coworkerId: number): Promise<Project[]> {
    console.log('[ProjectService] Getting projects by coworker:', coworkerId);
    return await get<Project[]>(`/api/projects/by-coworker/${coworkerId}`);
  }

  /**
   * プロジェクトステップセクションを保存
   */
  static async saveProjectStepSections(
    request: ProjectStepSectionRequest
  ): Promise<ProjectStepSectionResponse[]> {
    console.log('[ProjectService] Saving project step sections:', request);
    return await post<ProjectStepSectionResponse[]>('/api/project-step-sections', request);
  }

  /**
   * プロジェクトステップセクションを取得
   */
  static async getProjectStepSections(
    projectId: string, 
    stepKey: string
  ): Promise<ProjectStepSectionResponse[]> {
    console.log('[ProjectService] Getting project step sections:', { projectId, stepKey });
    return await get<ProjectStepSectionResponse[]>(`/api/project-step-sections/${projectId}/${stepKey}`);
  }

  /**
   * coworkers検索
   */
  static async searchCoworkers(
    query: string = "", 
    department: string = ""
  ): Promise<Coworker[]> {
    console.log('[ProjectService] Searching coworkers:', { query, department });
    
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (department) params.append('department', department);
    
    return await get<Coworker[]>(`/api/coworkers/search?${params.toString()}`);
  }
}