import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ProjectsApi } from '@/services/api';

export default function ElectricalList() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => ProjectsApi.getProjects(),
  });

  const projects = data?.data || [];

  // フィルター適用
  const filteredProjects =
    filter === 'all'
      ? projects
      : projects.filter((p: any) => p.status === filter);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // ステータステキスト取得
  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      PLANNING: '📋 見積中',
      IN_PROGRESS: '🔧 工事中',
      COMPLETED: '✅ 完了',
      ON_HOLD: '⏸️ 保留',
    };
    return map[status] || status;
  };

  // 説明から住所と電話を抽出
  const extractInfo = (description: string | null) => {
    if (!description) return { address: '', phone: '', amount: '' };

    const addressMatch = description.match(/【住所】([^\n]+)/);
    const phoneMatch = description.match(/【電話】([^\n]+)/);
    const amountMatch = description.match(/【見積金額】([^\n]+)/);

    return {
      address: addressMatch ? addressMatch[1] : '',
      phone: phoneMatch ? phoneMatch[1] : '',
      amount: amountMatch ? amountMatch[1] : '',
    };
  };

  const renderItem = ({ item }: { item: any }) => {
    const info = extractInfo(item.description);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => router.push(`/electrical-mobile/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* お客様名 */}
        <View style={styles.projectHeader}>
          <Text style={styles.projectName}>{item.name || '（未設定）'}</Text>
          <Text style={styles.projectArrow}>→</Text>
        </View>

        {/* 詳細情報 */}
        <View style={styles.projectDetails}>
          {info.address && (
            <Text style={styles.detailText}>📍 {info.address}</Text>
          )}
          {info.phone && <Text style={styles.detailText}>📞 {info.phone}</Text>}
          {info.amount && (
            <Text style={styles.detailText}>💰 {info.amount}</Text>
          )}
        </View>

        {/* フッター */}
        <View style={styles.projectFooter}>
          <Text style={styles.projectDate}>
            {new Date(item.createdAt).toLocaleDateString('ja-JP')}
          </Text>
          <View
            style={[
              styles.statusBadge,
              item.status === 'PLANNING'
                ? styles.statusBadgeYellow
                : item.status === 'IN_PROGRESS'
                ? styles.statusBadgeBlue
                : item.status === 'COMPLETED'
                ? styles.statusBadgeGreen
                : styles.statusBadgeGray,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>⚡</Text>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📁 案件一覧</Text>
        <Text style={styles.headerSubtitle}>全{projects.length}件</Text>
      </View>

      {/* フィルターボタン */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>絞り込み</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'all' && styles.filterButtonTextActive,
              ]}
            >
              すべて
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'PLANNING' && styles.filterButtonActiveYellow,
            ]}
            onPress={() => setFilter('PLANNING')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'PLANNING' && styles.filterButtonTextActive,
              ]}
            >
              📋
            </Text>
            <Text
              style={[
                styles.filterButtonTextSmall,
                filter === 'PLANNING' && styles.filterButtonTextActive,
              ]}
            >
              見積中
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'IN_PROGRESS' && styles.filterButtonActiveBlue,
            ]}
            onPress={() => setFilter('IN_PROGRESS')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'IN_PROGRESS' && styles.filterButtonTextActive,
              ]}
            >
              🔧
            </Text>
            <Text
              style={[
                styles.filterButtonTextSmall,
                filter === 'IN_PROGRESS' && styles.filterButtonTextActive,
              ]}
            >
              工事中
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'COMPLETED' && styles.filterButtonActiveGreen,
            ]}
            onPress={() => setFilter('COMPLETED')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'COMPLETED' && styles.filterButtonTextActive,
              ]}
            >
              ✅
            </Text>
            <Text
              style={[
                styles.filterButtonTextSmall,
                filter === 'COMPLETED' && styles.filterButtonTextActive,
              ]}
            >
              完了
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* リスト */}
      {filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>該当する案件が</Text>
          <Text style={styles.emptyTitle}>ありません</Text>
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => router.push('/electrical-mobile/new')}
            activeOpacity={0.7}
          >
            <Text style={styles.newButtonText}>➕ 新しい案件を登録</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        />
      )}
    </View>
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
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 52,
  },
  headerSubtitle: {
    fontSize: 24,
    color: '#BFDBFE',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1E40AF',
  },
  filterButtonActiveYellow: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  filterButtonActiveBlue: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  filterButtonActiveGreen: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  filterButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  filterButtonTextSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  projectName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  projectArrow: {
    fontSize: 40,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  projectDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailText: {
    fontSize: 20,
    color: '#4B5563',
    lineHeight: 28,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  projectDate: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '500',
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
  statusBadgeGray: {
    backgroundColor: '#F3F4F6',
  },
  statusBadgeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  newButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  newButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
