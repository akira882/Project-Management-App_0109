'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, ProjectStatus, TaskStatus } from '@project-management/shared';

export default function DashboardPage() {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  const { data: tasksData } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p: any) => p.status === ProjectStatus.IN_PROGRESS).length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t: any) => t.status === TaskStatus.DONE).length,
    inProgressTasks: tasks.filter((t: any) => t.status === TaskStatus.IN_PROGRESS).length,
    todoTasks: tasks.filter((t: any) => t.status === TaskStatus.TODO).length,
  };

  const recentProjects = projects.slice(0, 5);
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground mt-2">プロジェクトとタスクの概要</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              総プロジェクト数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <p className="text-sm text-muted-foreground mt-1">
              進行中: {stats.activeProjects}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              総タスク数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">
              完了: {stats.completedTasks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              進行中のタスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              未着手のタスク
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{stats.todoTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>最近のプロジェクト</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm">すべて見る</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project: any) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatRelativeTime(new Date(project.updatedAt))}
                        </p>
                      </div>
                      <Badge>{project.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                プロジェクトがありません
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>最近のタスク</CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">すべて見る</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task: any) => (
                  <Link key={task.id} href={`/tasks/${task.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {task.project?.name} • {formatRelativeTime(new Date(task.updatedAt))}
                        </p>
                      </div>
                      <Badge>{task.status}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                タスクがありません
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
