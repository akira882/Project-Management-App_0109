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
import { ProjectsApi } from '@/services/api';
import { Card, Badge, Button, LoadingSpinner, ErrorView } from '@/components/ui';
import type { Project } from '@project-management/shared';

export default function ProjectsListScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectsApi.getProjects(),
  });

  const projects = data?.data || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleProjectPress = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  const handleCreateProject = () => {
    router.push('/projects/create');
  };

  if (isLoading) {
    return <LoadingSpinner message="プロジェクトを読み込んでいます..." />;
  }

  if (error) {
    return (
      <ErrorView
        message="プロジェクトの読み込みに失敗しました"
        onRetry={refetch}
      />
    );
  }

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity
      onPress={() => handleProjectPress(item.id)}
      activeOpacity={0.7}
    >
      <Card style={styles.projectCard}>
        <View style={styles.cardHeader}>
          <View style={styles.badges}>
            <Badge label={item.status} type={item.status} />
            <Badge label={item.priority} type={item.priority} />
          </View>
        </View>
        <Text style={styles.projectName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.projectFooter}>
          <Text style={styles.footerText}>
            更新: {new Date(item.updatedAt).toLocaleDateString('ja-JP')}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📁</Text>
      <Text style={styles.emptyTitle}>プロジェクトがありません</Text>
      <Text style={styles.emptyDescription}>
        新しいプロジェクトを作成してみましょう
      </Text>
      <Button
        title="最初のプロジェクトを作成"
        onPress={handleCreateProject}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          全{projects.length}件のプロジェクト
        </Text>
        <Button
          title="新規作成"
          onPress={handleCreateProject}
          size="small"
        />
      </View>
      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          projects.length === 0 ? styles.emptyList : styles.list
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
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  projectCard: {
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
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
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
