import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ProjectsApi } from '@/services/api';
import { Card } from '@/components/ui';

export default function ElectricalDashboard() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectsApi.getProjects(),
  });

  const projects = data?.data || [];

  // ステータス別に分類
  const planningProjects = projects.filter((p: any) => p.status === 'PLANNING');
  const inProgressProjects = projects.filter((p: any) => p.status === 'IN_PROGRESS');
  const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ 電気工事</Text>
        <Text style={styles.headerTitle}>業務管理</Text>
        <Text style={styles.headerSubtitle}>安全第一！</Text>
      </View>

      {/* 統計カード - 超大きく */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, styles.statCardYellow]}>
          <Text style={styles.statEmoji}>📋</Text>
          <Text style={styles.statLabel}>見積中</Text>
          <Text style={styles.statNumber}>{planningProjects.length}</Text>
          <Text style={styles.statUnit}>件</Text>
        </Card>

        <Card style={[styles.statCard, styles.statCardBlue]}>
          <Text style={styles.statEmoji}>🔧</Text>
          <Text style={styles.statLabel}>工事中</Text>
          <Text style={styles.statNumber}>{inProgressProjects.length}</Text>
          <Text style={styles.statUnit}>件</Text>
        </Card>

        <Card style={[styles.statCard, styles.statCardGreen]}>
          <Text style={styles.statEmoji}>✅</Text>
          <Text style={styles.statLabel}>完了</Text>
          <Text style={styles.statNumber}>{completedProjects.length}</Text>
          <Text style={styles.statUnit}>件</Text>
        </Card>
      </View>

      {/* メインアクションボタン - 超大きく */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push('/electrical-mobile/new')}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonEmoji}>➕</Text>
          <Text style={styles.actionButtonText}>新しい</Text>
          <Text style={styles.actionButtonText}>案件登録</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => router.push('/electrical-mobile/list')}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonEmoji}>📁</Text>
          <Text style={styles.actionButtonText}>案件</Text>
          <Text style={styles.actionButtonText}>一覧</Text>
        </TouchableOpacity>
      </View>

      {/* 最近の案件 */}
      {projects.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>📌 最近の案件</Text>

          {projects.slice(0, 3).map((project: any) => (
            <TouchableOpacity
              key={project.id}
              style={styles.projectCard}
              onPress={() => router.push(`/electrical-mobile/${project.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.projectCardHeader}>
                <Text style={styles.projectCardName}>
                  {project.name || '（未設定）'}
                </Text>
                <Text style={styles.projectCardArrow}>→</Text>
              </View>

              <View style={styles.projectCardFooter}>
                <Text style={styles.projectCardDate}>
                  {new Date(project.createdAt).toLocaleDateString('ja-JP')}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    project.status === 'PLANNING'
                      ? styles.statusBadgeYellow
                      : project.status === 'IN_PROGRESS'
                      ? styles.statusBadgeBlue
                      : styles.statusBadgeGreen,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {project.status === 'PLANNING'
                      ? '📋 見積中'
                      : project.status === 'IN_PROGRESS'
                      ? '🔧 工事中'
                      : '✅ 完了'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 空の状態 */}
      {projects.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>まだ案件が</Text>
          <Text style={styles.emptyTitle}>ありません</Text>
          <Text style={styles.emptyText}>「新しい案件登録」から</Text>
          <Text style={styles.emptyText}>始めましょう</Text>
        </Card>
      )}

      {/* フッター余白 */}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 52,
  },
  headerSubtitle: {
    fontSize: 28,
    color: '#BFDBFE',
    marginTop: 12,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
    gap: 16,
  },
  statCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 4,
  },
  statCardYellow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  statCardBlue: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  statCardGreen: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  statEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 28,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 80,
  },
  statUnit: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonPrimary: {
    backgroundColor: '#2563EB',
  },
  actionButtonSecondary: {
    backgroundColor: '#10B981',
  },
  actionButtonEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
  },
  recentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectCardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  projectCardArrow: {
    fontSize: 40,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  projectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectCardDate: {
    fontSize: 20,
    color: '#6B7280',
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  statusBadgeYellow: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeBlue: {
    backgroundColor: '#DBEAFE',
  },
  statusBadgeGreen: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyCard: {
    margin: 16,
    padding: 48,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 96,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 44,
  },
  emptyText: {
    fontSize: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 32,
  },
  footer: {
    height: 40,
  },
});
