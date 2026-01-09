'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['task', resolvedParams.id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${resolvedParams.id}`);
      if (!response.ok) throw new Error('Failed to fetch task');
      return response.json();
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${resolvedParams.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.push('/tasks');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/tasks/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', resolvedParams.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleDelete = () => {
    if (confirm('本当にこのタスクを削除しますか？この操作は取り消せません。')) {
      deleteTaskMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-8 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">タスクの読み込みに失敗しました</p>
          </div>
        </div>
      </div>
    );
  }

  const task: Task = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* パンくずリスト */}
        <nav className="mb-6 text-sm">
          <Link href="/tasks" className="text-blue-600 hover:underline">
            タスク一覧
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{task.title}</span>
        </nav>

        {/* メインカード */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          {/* バッジ */}
          <div className="flex gap-2 mb-4">
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                task.status === 'TODO'
                  ? 'bg-yellow-100 text-yellow-800'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {task.status}
            </span>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                task.priority === 'HIGH'
                  ? 'bg-red-100 text-red-800'
                  : task.priority === 'MEDIUM'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {task.priority}
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>

          {/* 説明 */}
          {task.description && (
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">
              {task.description}
            </p>
          )}

          {/* メタ情報 */}
          <div className="grid grid-cols-2 gap-4 py-6 border-t border-gray-200">
            {task.project && (
              <div>
                <div className="text-sm text-gray-600 mb-1">プロジェクト</div>
                <Link
                  href={`/projects/${task.projectId}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  📁 {task.project.name}
                </Link>
              </div>
            )}
            {task.dueDate && (
              <div>
                <div className="text-sm text-gray-600 mb-1">期限</div>
                <div className="font-medium text-gray-900">
                  {new Date(task.dueDate).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600 mb-1">作成日</div>
              <div className="font-medium text-gray-900">
                {new Date(task.createdAt).toLocaleDateString('ja-JP')}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">更新日</div>
              <div className="font-medium text-gray-900">
                {new Date(task.updatedAt).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Link
              href={`/tasks/${task.id}/edit`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              編集
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteTaskMutation.isPending}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
            >
              {deleteTaskMutation.isPending ? '削除中...' : '削除'}
            </button>
          </div>
        </div>

        {/* ステータス変更カード */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ステータス変更
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => updateStatusMutation.mutate('TODO')}
              disabled={task.status === 'TODO' || updateStatusMutation.isPending}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                task.status === 'TODO'
                  ? 'bg-yellow-600 text-white cursor-default'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              未着手
            </button>
            <button
              onClick={() => updateStatusMutation.mutate('IN_PROGRESS')}
              disabled={task.status === 'IN_PROGRESS' || updateStatusMutation.isPending}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                task.status === 'IN_PROGRESS'
                  ? 'bg-blue-600 text-white cursor-default'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              進行中
            </button>
            <button
              onClick={() => updateStatusMutation.mutate('DONE')}
              disabled={task.status === 'DONE' || updateStatusMutation.isPending}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                task.status === 'DONE'
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              完了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
