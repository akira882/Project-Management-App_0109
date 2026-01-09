/**
 * APIサービスのエントリーポイント
 */

export { apiClient, ApiError } from './client';
export { ProjectsApi } from './projects';
export { TasksApi } from './tasks';

// すべてのAPIサービスを名前空間としてエクスポート
export const API = {
  projects: ProjectsApi,
  tasks: TasksApi,
};

export default API;
