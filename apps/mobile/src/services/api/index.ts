/**
 * APIサービスのエントリーポイント
 */

import { ProjectsApi } from './projects';
import { TasksApi } from './tasks';
import { AttendanceApi } from './attendance';

export { apiClient, ApiError } from './client';
export { ProjectsApi, TasksApi, AttendanceApi };

// すべてのAPIサービスを名前空間としてエクスポート
export const API = {
  projects: ProjectsApi,
  tasks: TasksApi,
  attendance: AttendanceApi,
};

export default API;
