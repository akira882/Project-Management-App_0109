import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectsApi, TasksApi } from '@/services/api';
import { Card, Badge, Button, LoadingSpinner, ErrorView } from '@/components/ui';
import type { Task } from '@project-management/shared';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => ProjectsApi.getProject(id!),
    enabled: !!id,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => ProjectsApi.deleteProject(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('エラー', error.message || 'プロジェクトの削除に失敗しました');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'プロジェクトを削除',
      '本当にこのプロジェクトを削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => deleteProjectMutation.mutate(),
        },
      ]
    );
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  if (isLoading) {
    return <LoadingSpinner message="プロジェクトを読み込んでいます..." />;
  }

  if (error || !data) {
    return (
      <ErrorView
        message="プロジェクトの読み込みに失敗しました"
        onRetry={refetch}
      />
    );
  }

  const project = data;
  const tasks = project.tasks || [];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.projectCard}>
        <View style={styles.badges}>
          <Badge label={project.status} type={project.status} />
          <Badge label={project.priority} type={project.priority} />
        </View>
        <Text style={styles.projectName}>{project.name}</Text>
        {project.description && (
          <Text style={styles.projectDescription}>{project.description}</Text>
        )}

        <View style={styles.infoGrid}>
          {project.startDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>開始日</Text>
              <Text style={styles.infoValue}>
                {new Date(project.startDate).toLocaleDateString('ja-JP')}
              </Text>
            </View>
          )}
          {project.endDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>終了日</Text>
              <Text style={styles.infoValue}>
                {new Date(project.endDate).toLocaleDateString('ja-JP')}
              </Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>タスク数</Text>
            <Text style={styles.infoValue}>{tasks.length}件</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="編集"
            onPress={() => router.push(`/projects/${id}/edit`)}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="削除"
            onPress={handleDelete}
            variant="danger"
            style={styles.actionButton}
            loading={deleteProjectMutation.isPending}
          />
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>タスク一覧</Text>
          <Button
            title="追加"
            onPress={() => router.push(`/projects/${id}/tasks/create`)}
            size="small"
          />
        </View>

        {tasks.length > 0 ? (
          tasks.map((task: Task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => handleTaskPress(task.id)}
              activeOpacity={0.7}
            >
              <Card style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <Badge label={task.status} type={task.status} />
                  <Badge label={task.priority} type={task.priority} />
                </View>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.description && (
                  <Text style={styles.taskDescription} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}
                {task.dueDate && (
                  <Text style={styles.taskDueDate}>
                    期限: {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                  </Text>
                )}
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyTasks}>
            <Text style={styles.emptyText}>タスクがまだありません</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  projectCard: {
    margin: 16,
    padding: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  taskCard: {
    marginBottom: 8,
    padding: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyTasks: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
