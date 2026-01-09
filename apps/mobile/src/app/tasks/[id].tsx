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
import { TasksApi } from '@/services/api';
import { Card, Badge, Button, LoadingSpinner, ErrorView } from '@/components/ui';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['task', id],
    queryFn: () => TasksApi.getTask(id!),
    enabled: !!id,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: () => TasksApi.deleteTask(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('エラー', error.message || 'タスクの削除に失敗しました');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      TasksApi.updateTask(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      Alert.alert('エラー', error.message || 'ステータスの更新に失敗しました');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'タスクを削除',
      '本当にこのタスクを削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => deleteTaskMutation.mutate(),
        },
      ]
    );
  };

  const handleStatusChange = (status: string) => {
    updateStatusMutation.mutate(status);
  };

  if (isLoading) {
    return <LoadingSpinner message="タスクを読み込んでいます..." />;
  }

  if (error || !data) {
    return (
      <ErrorView
        message="タスクの読み込みに失敗しました"
        onRetry={refetch}
      />
    );
  }

  const task = data;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.taskCard}>
        <View style={styles.badges}>
          <Badge label={task.status} type={task.status} />
          <Badge label={task.priority} type={task.priority} />
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>

        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}

        <View style={styles.infoGrid}>
          {task.dueDate && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>期限</Text>
              <Text style={styles.infoValue}>
                {new Date(task.dueDate).toLocaleDateString('ja-JP')}
              </Text>
            </View>
          )}
          {task.project && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>プロジェクト</Text>
              <TouchableOpacity
                onPress={() => router.push(`/projects/${task.projectId}`)}
              >
                <Text style={styles.infoValueLink}>
                  📁 {task.project.name}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>作成日</Text>
            <Text style={styles.infoValue}>
              {new Date(task.createdAt).toLocaleDateString('ja-JP')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>更新日</Text>
            <Text style={styles.infoValue}>
              {new Date(task.updatedAt).toLocaleDateString('ja-JP')}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="編集"
            onPress={() => router.push(`/tasks/${id}/edit`)}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="削除"
            onPress={handleDelete}
            variant="danger"
            style={styles.actionButton}
            loading={deleteTaskMutation.isPending}
          />
        </View>
      </Card>

      <Card style={styles.statusCard}>
        <Text style={styles.sectionTitle}>ステータス変更</Text>
        <View style={styles.statusButtons}>
          <Button
            title="未着手"
            onPress={() => handleStatusChange('TODO')}
            variant={task.status === 'TODO' ? 'primary' : 'outline'}
            size="small"
            style={styles.statusButton}
            loading={updateStatusMutation.isPending && task.status !== 'TODO'}
            disabled={task.status === 'TODO'}
          />
          <Button
            title="進行中"
            onPress={() => handleStatusChange('IN_PROGRESS')}
            variant={task.status === 'IN_PROGRESS' ? 'primary' : 'outline'}
            size="small"
            style={styles.statusButton}
            loading={updateStatusMutation.isPending && task.status !== 'IN_PROGRESS'}
            disabled={task.status === 'IN_PROGRESS'}
          />
          <Button
            title="完了"
            onPress={() => handleStatusChange('DONE')}
            variant={task.status === 'DONE' ? 'primary' : 'outline'}
            size="small"
            style={styles.statusButton}
            loading={updateStatusMutation.isPending && task.status !== 'DONE'}
            disabled={task.status === 'DONE'}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  taskCard: {
    margin: 16,
    padding: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  taskDescription: {
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
  infoValueLink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
  },
});
