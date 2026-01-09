import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ProjectsApi, TasksApi } from '@/services/api';
import { Card, LoadingSpinner } from '@/components/ui';
import type { Project, Task } from '@project-management/shared';

export default function DashboardScreen() {
  const router = useRouter();

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectsApi.getProjects(),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => TasksApi.getTasks(),
  });

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  if (projectsLoading || tasksLoading) {
    return <LoadingSpinner message="読み込み中..." />;
  }

  // タスクの統計
  const todoTasks = tasks.filter((t: Task) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t: Task) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t: Task) => t.status === 'DONE');
  const highPriorityTasks = tasks.filter((t: Task) => t.priority === 'HIGH');

  // 最近のプロジェクト（更新日順）
  const recentProjects = [...projects]
    .sort((a: Project, b: Project) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 3);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>プロジェクト管理アプリ</Text>
        <Text style={styles.subtitle}>モバイル版</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{projects.length}</Text>
          <Text style={styles.statLabel}>プロジェクト</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>全タスク</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{todoTasks.length}</Text>
          <Text style={styles.statLabel}>未着手</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{inProgressTasks.length}</Text>
          <Text style={styles.statLabel}>進行中</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>完了</Text>
        </View>
      </View>

      {highPriorityTasks.length > 0 && (
        <Card style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚠️ 高優先度タスク</Text>
          <Text style={styles.alertText}>
            {highPriorityTasks.length}件の高優先度タスクがあります
          </Text>
        </Card>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>クイックアクセス</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/projects')}
        >
          <Text style={styles.menuText}>📁 プロジェクト一覧</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/tasks')}
        >
          <Text style={styles.menuText}>✅ タスク一覧</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/projects/create')}
        >
          <Text style={styles.menuText}>➕ 新規プロジェクト</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/tasks/create')}
        >
          <Text style={styles.menuText}>➕ 新規タスク</Text>
        </TouchableOpacity>
      </View>

      {recentProjects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近のプロジェクト</Text>
          {recentProjects.map((project: Project) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectItem}
              onPress={() => router.push(`/projects/${project.id}`)}
            >
              <Text style={styles.projectName}>{project.name}</Text>
              <Text style={styles.projectDate}>
                {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>機能</Text>
        <Text style={styles.featureText}>• プロジェクト・タスク管理</Text>
        <Text style={styles.featureText}>• GitHub API連携</Text>
        <Text style={styles.featureText}>• Slack通知機能</Text>
        <Text style={styles.featureText}>• リアルタイム同期</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  alertCard: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#78350F',
  },
  projectItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  projectDate: {
    fontSize: 12,
    color: '#666',
  },
});
