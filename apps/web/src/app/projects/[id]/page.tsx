'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, TaskStatus } from '@project-management/shared';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push('/projects');
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">プロジェクトが見つかりません</div>
      </div>
    );
  }

  const project = data.data;

  const getTaskStatusColor = (status: TaskStatus) => {
    const colors = {
      TODO: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      IN_REVIEW: 'bg-yellow-100 text-yellow-800',
      DONE: 'bg-green-100 text-green-800',
      BLOCKED: 'bg-red-100 text-red-800',
    };
    return colors[status] || '';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← 戻る
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex gap-2 mb-3">
                <Badge>{project.status}</Badge>
                <Badge>{project.priority}</Badge>
              </div>
              <CardTitle className="text-3xl mb-2">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/edit`)}>
                編集
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('本当に削除しますか？')) {
                    deleteProjectMutation.mutate();
                  }
                }}
              >
                削除
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">担当者</p>
              <p className="font-semibold">{project.user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">タスク数</p>
              <p className="font-semibold">{project.tasks?.length || 0}件</p>
            </div>
            {project.startDate && (
              <div>
                <p className="text-sm text-muted-foreground">開始日</p>
                <p className="font-semibold">{formatDate(new Date(project.startDate))}</p>
              </div>
            )}
            {project.endDate && (
              <div>
                <p className="text-sm text-muted-foreground">終了日</p>
                <p className="font-semibold">{formatDate(new Date(project.endDate))}</p>
              </div>
            )}
            {project.githubRepoUrl && (
              <div>
                <p className="text-sm text-muted-foreground">GitHubリポジトリ</p>
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  リンクを開く
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">タスク一覧</h2>
        <Button onClick={() => router.push(`/projects/${projectId}/tasks/new`)}>
          タスク追加
        </Button>
      </div>

      <div className="space-y-4">
        {project.tasks && project.tasks.length > 0 ? (
          project.tasks.map((task: any) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/tasks/${task.id}`)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTaskStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge>{task.priority}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {task.description?.substring(0, 100)}
                      {task.description?.length > 100 && '...'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {task.assignee && (
                      <div className="mb-2">
                        担当: {task.assignee.name}
                      </div>
                    )}
                    {task.dueDate && (
                      <div>期限: {formatDate(new Date(task.dueDate))}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            タスクがまだありません
          </div>
        )}
      </div>
    </div>
  );
}
