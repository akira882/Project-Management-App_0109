import apiClient from './client';
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  PaginationParams,
  TaskFilters,
} from '@project-management/shared';

/**
 * タスクAPIサービス
 */
export class TasksApi {
  /**
   * タスク一覧を取得
   */
  static async getTasks(
    filters?: TaskFilters,
    pagination?: Partial<PaginationParams>
  ): Promise<{ data: Task[]; meta?: { page: number; limit: number; total: number } }> {
    const params = new URLSearchParams();

    // フィルター
    if (filters?.status && filters.status.length > 0) {
      filters.status.forEach((s) => params.append('status', s));
    }
    if (filters?.priority && filters.priority.length > 0) {
      filters.priority.forEach((p) => params.append('priority', p));
    }
    if (filters?.projectId) {
      params.append('projectId', filters.projectId);
    }
    if (filters?.assigneeId) {
      params.append('assigneeId', filters.assigneeId);
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
    const url = `/api/tasks${queryString ? `?${queryString}` : ''}`;

    return apiClient.get(url);
  }

  /**
   * タスク詳細を取得
   */
  static async getTask(id: string): Promise<Task> {
    return apiClient.get(`/api/tasks/${id}`);
  }

  /**
   * タスクを作成
   */
  static async createTask(data: CreateTaskInput): Promise<Task> {
    return apiClient.post('/api/tasks', data);
  }

  /**
   * タスクを更新
   */
  static async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    return apiClient.patch(`/api/tasks/${id}`, data);
  }

  /**
   * タスクを削除
   */
  static async deleteTask(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/api/tasks/${id}`);
  }
}

export default TasksApi;
