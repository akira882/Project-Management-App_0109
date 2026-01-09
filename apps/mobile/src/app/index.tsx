import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

export default function DashboardScreen() {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // Note: Replace with your actual API endpoint
      const response = await fetch('http://localhost:3000/api/projects');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  const projects = projectsData?.data || [];

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
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>タスク</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>クイックアクセス</Text>
        <Link href="/projects" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>📁 プロジェクト一覧</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>✅ タスク一覧</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>⚙️ 設定</Text>
        </TouchableOpacity>
      </View>

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
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
});
