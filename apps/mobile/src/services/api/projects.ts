import apiClient from './client';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  PaginationParams,
  ProjectFilters,
} from '@project-management/shared';

/**
 * プロジェクトAPIサービス
 */
export class ProjectsApi {
  /**
   * プロジェクト一覧を取得
   */
  static async getProjects(
    filters?: ProjectFilters,
    pagination?: Partial<PaginationParams>
  ): Promise<{ data: Project[]; meta?: { page: number; limit: number; total: number } }> {
    const params = new URLSearchParams();

    // フィルター
    if (filters?.status && filters.status.length > 0) {
      filters.status.forEach((s) => params.append('status', s));
    }
    if (filters?.priority && filters.priority.length > 0) {
      filters.priority.forEach((p) => params.append('priority', p));
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    // ページネーション
    if (pagination?.page) {
      params.append('page', pagination.page.toString());
    }
    if (pagination?.limit) {
      params.append('limit', pagination.limit.toString());
    }

    const queryString = params.toString();
    const url = `/api/projects${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  }

  /**
   * プロジェクト詳細を取得
   */
  static async getProject(id: string): Promise<Project> {
    return apiClient.get(`/api/projects/${id}`);
  }

  /**
   * プロジェクトを作成
   */
  static async createProject(data: CreateProjectInput): Promise<Project> {
    return apiClient.post('/api/projects', data);
  }

  /**
   * プロジェクトを更新
   */
  static async updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
    return apiClient.patch(`/api/projects/${id}`, data);
  }

  /**
   * プロジェクトを削除
   */
  static async deleteProject(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/api/projects/${id}`);
  }
}

export default ProjectsApi;
