import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { TasksApi } from '@/services/api';
import { Card, Badge, Button, LoadingSpinner, ErrorView } from '@/components/ui';
import type { Task } from '@project-management/shared';

export default function TasksListScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => TasksApi.getTasks(),
  });

  const tasks = data?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTaskPress = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
  };

  const handleCreateTask = () => {
    router.push('/tasks/create');
  };

  if (isLoading) {
    return <LoadingSpinner message="タスクを読み込んでいます..." />;
  }

  if (error) {
    return (
      <ErrorView
        message="タスクの読み込みに失敗しました"
        onRetry={refetch}
      />
    );
  }

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => handleTaskPress(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.taskCard}>
        <View style={styles.cardHeader}>
          <View style={styles.badges}>
            <Badge label={item.status} type={item.status} />
            <Badge label={item.priority} type={item.priority} />
          </View>
        </View>
        <Text style={styles.taskTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.taskFooter}>
          {item.dueDate && (
            <Text style={styles.footerText}>
              期限: {new Date(item.dueDate).toLocaleDateString('ja-JP')}
            </Text>
          )}
          {item.project && (
            <Text style={styles.projectName}>
              📁 {item.project.name}
            </Text>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>✅</Text>
      <Text style={styles.emptyTitle}>タスクがありません</Text>
      <Text style={styles.emptyDescription}>
        新しいタスクを作成してみましょう
      </Text>
      <Button
        title="最初のタスクを作成"
        onPress={handleCreateTask}
        style={styles.emptyButton}
      />
    </View>
  );

  // ステータスごとにタスクをグループ化
  const todoTasks = tasks.filter((t: Task) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t: Task) => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter((t: Task) => t.status === 'DONE');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          全{tasks.length}件のタスク
        </Text>
        <Button
          title="新規作成"
          onPress={handleCreateTask}
          size="small"
        />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{todoTasks.length}</Text>
          <Text style={styles.statLabel}>未着手</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{inProgressTasks.length}</Text>
          <Text style={styles.statLabel}>進行中</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedTasks.length}</Text>
          <Text style={styles.statLabel}>完了</Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          tasks.length === 0 ? styles.emptyList : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  taskCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  projectName: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
});
