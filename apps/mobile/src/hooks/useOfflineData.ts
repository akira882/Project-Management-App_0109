import { useEffect } from 'react';
import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import StorageService from '@/services/storage';
import { ProjectsApi, TasksApi } from '@/services/api';

/**
 * オフライン対応のプロジェクトデータフック
 */
export function useOfflineProjects() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        // オンライン時: APIから取得
        const response = await ProjectsApi.getProjects();

        // 取得成功したらローカルに保存
        if (response?.data) {
          await StorageService.saveProjects(response.data);
        }

        return response;
      } catch (error) {
        // オフライン時: ローカルから取得
        console.log('Network error, loading from cache...');
        const cachedProjects = await StorageService.getProjects();

        if (cachedProjects) {
          return { data: cachedProjects };
        }

        throw error;
      }
    },
    staleTime: 60 * 1000, // 1分
    gcTime: 24 * 60 * 60 * 1000, // 24時間
  });

  // アプリ起動時にキャッシュから初期データを読み込む
  useEffect(() => {
    const loadCachedData = async () => {
      const cachedProjects = await StorageService.getProjects();
      if (cachedProjects) {
        queryClient.setQueryData(['projects'], { data: cachedProjects });
      }
    };

    loadCachedData();
  }, [queryClient]);

  return query;
}

/**
 * オフライン対応のタスクデータフック
 */
export function useOfflineTasks() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        // オンライン時: APIから取得
        const response = await TasksApi.getTasks();

        // 取得成功したらローカルに保存
        if (response?.data) {
          await StorageService.saveTasks(response.data);
        }

        return response;
      } catch (error) {
        // オフライン時: ローカルから取得
        console.log('Network error, loading from cache...');
        const cachedTasks = await StorageService.getTasks();

        if (cachedTasks) {
          return { data: cachedTasks };
        }

        throw error;
      }
    },
    staleTime: 60 * 1000, // 1分
    gcTime: 24 * 60 * 60 * 1000, // 24時間
  });

  // アプリ起動時にキャッシュから初期データを読み込む
  useEffect(() => {
    const loadCachedData = async () => {
      const cachedTasks = await StorageService.getTasks();
      if (cachedTasks) {
        queryClient.setQueryData(['tasks'], { data: cachedTasks });
      }
    };

    loadCachedData();
  }, [queryClient]);

  return query;
}

/**
 * キャッシュステータスを取得
 */
export function useCacheStatus() {
  const checkCacheStatus = async () => {
    const projectsValid = await StorageService.isCacheValid('projects', 5);
    const tasksValid = await StorageService.isCacheValid('tasks', 5);

    const projectsLastSync = await StorageService.getLastSyncTime('projects');
    const tasksLastSync = await StorageService.getLastSyncTime('tasks');

    return {
      projects: {
        valid: projectsValid,
        lastSync: projectsLastSync,
      },
      tasks: {
        valid: tasksValid,
        lastSync: tasksLastSync,
      },
    };
  };

  return { checkCacheStatus };
}
