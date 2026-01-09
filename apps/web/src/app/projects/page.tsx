'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectStatus, ProjectPriority, formatDate } from '@project-management/shared';

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/projects?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  const getStatusColor = (status: ProjectStatus) => {
    const colors = {
      PLANNING: 'bg-purple-100 text-purple-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      ON_HOLD: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      ARCHIVED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || '';
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    const colors = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      URGENT: 'bg-red-100 text-red-800',
    };
    return colors[priority] || '';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">エラーが発生しました</div>
      </div>
    );
  }

  const projects = data?.data || [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">プロジェクト一覧</h1>
          <p className="text-muted-foreground mt-2">
            全{projects.length}件のプロジェクト
          </p>
        </div>
        <Link href="/projects/new">
          <Button>新規プロジェクト作成</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={statusFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('')}
        >
          すべて
        </Button>
        {Object.values(ProjectStatus).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  {project.description?.substring(0, 100)}
                  {project.description?.length > 100 && '...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>タスク:</span>
                    <span className="font-semibold">
                      {project.tasks?.length || 0}件
                    </span>
                  </div>
                  {project.startDate && (
                    <div>
                      開始日: {formatDate(new Date(project.startDate))}
                    </div>
                  )}
                  {project.endDate && (
                    <div>
                      終了日: {formatDate(new Date(project.endDate))}
                    </div>
                  )}
                  <div>
                    更新: {formatDate(new Date(project.updatedAt))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            プロジェクトがまだありません
          </p>
          <Link href="/projects/new">
            <Button>最初のプロジェクトを作成</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
