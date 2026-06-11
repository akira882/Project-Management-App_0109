import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AttendanceApi } from '@/services/api';
import type { AttendanceRecord } from '@project-management/shared';

const formatDuration = (minutes: number): string => {
  const m = Math.max(0, Math.round(minutes));
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  if (hours === 0) return `${mins}分`;
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
};

const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// "2026-06" → 表示用 "2026年6月"
const formatMonthLabel = (month: string): string => {
  const [y, m] = month.split('-');
  return `${y}年${parseInt(m, 10)}月`;
};

// "YYYY-MM-DD" → "6/12（金）"
const formatDayLabel = (workDate: string): string => {
  const d = new Date(`${workDate}T00:00:00+09:00`);
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}（${weekday}）`;
};

const getCurrentMonth = (): string => {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 7);
};

const shiftMonth = (month: string, diff: number): string => {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + diff, 1));
  return d.toISOString().slice(0, 7);
};

export default function AttendanceHistory() {
  const router = useRouter();
  const [month, setMonth] = useState(getCurrentMonth());

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'history', month],
    queryFn: () => AttendanceApi.getMonth(month),
  });

  const records = data?.records ?? [];
  const summary = data?.summary;

  const renderItem = ({ item }: { item: AttendanceRecord }) => {
    const incomplete = item.status !== 'COMPLETED';
    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <Text style={styles.recordDate}>{formatDayLabel(item.workDate)}</Text>
          {incomplete ? (
            <View style={styles.recordBadgeWarn}>
              <Text style={styles.recordBadgeWarnText}>
                {item.status === 'ON_BREAK' ? '☕ 休憩中' : '🔧 勤務中'}
              </Text>
            </View>
          ) : (
            <Text style={styles.recordWork}>
              実働 {formatDuration(item.workMinutes ?? 0)}
            </Text>
          )}
        </View>
        <View style={styles.recordTimes}>
          <Text style={styles.recordTime}>
            🌅 {formatTime(item.clockInAt)} → 🌇 {formatTime(item.clockOutAt)}
          </Text>
          {item.breakMinutes > 0 && (
            <Text style={styles.recordBreak}>
              ☕ 休憩 {formatDuration(item.breakMinutes)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📅 勤怠履歴</Text>
      </View>

      {/* 月切り替え */}
      <View style={styles.monthNav}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => setMonth(shiftMonth(month, -1))}
          activeOpacity={0.7}
        >
          <Text style={styles.monthButtonText}>◀ 前月</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonthLabel(month)}</Text>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => setMonth(shiftMonth(month, 1))}
          activeOpacity={0.7}
        >
          <Text style={styles.monthButtonText}>翌月 ▶</Text>
        </TouchableOpacity>
      </View>

      {/* 月次サマリー */}
      {summary && (
        <View style={styles.summaryCards}>
          <View style={[styles.summaryCard, styles.summaryCardBlue]}>
            <Text style={styles.summaryCardLabel}>出勤日数</Text>
            <Text style={styles.summaryCardValue}>{summary.daysWorked}</Text>
            <Text style={styles.summaryCardUnit}>日</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Text style={styles.summaryCardLabel}>合計実働</Text>
            <Text style={styles.summaryCardValueSmall}>
              {formatDuration(summary.totalWorkMinutes)}
            </Text>
          </View>
        </View>
      )}

      {/* 日次リスト */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>⏰</Text>
          <Text style={styles.emptyText}>読み込み中...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>この月の記録はありません</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  monthButton: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  monthButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  monthLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 3,
    padding: 20,
    alignItems: 'center',
  },
  summaryCardBlue: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  summaryCardGreen: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  summaryCardLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  summaryCardValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 56,
  },
  summaryCardValueSmall: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 56,
  },
  summaryCardUnit: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    padding: 20,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordDate: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recordWork: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#10B981',
  },
  recordBadgeWarn: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  recordBadgeWarnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
  },
  recordTimes: {
    gap: 6,
  },
  recordTime: {
    fontSize: 22,
    color: '#4B5563',
    fontWeight: '500',
  },
  recordBreak: {
    fontSize: 20,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6B7280',
  },
});
