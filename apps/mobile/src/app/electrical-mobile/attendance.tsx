import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AttendanceApi } from '@/services/api';
import { Card } from '@/components/ui';

// 実働時間の表示用フォーマット（例: 485 → 8時間5分）
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

export default function AttendanceScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 現在時刻（1秒ごとに更新される大時計）
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: record, isLoading } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => AttendanceApi.getToday(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
  };

  const clockInMutation = useMutation({
    mutationFn: () => AttendanceApi.clockIn(),
    onSuccess: (data) => {
      invalidate();
      Alert.alert('✅ 出勤しました', `出勤時刻: ${formatTime(data.clockInAt)}\n今日も安全第一で！`);
    },
    onError: (error: any) => {
      Alert.alert('エラー', error?.message || '出勤打刻に失敗しました');
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: () => AttendanceApi.clockOut(),
    onSuccess: (data) => {
      invalidate();
      Alert.alert(
        '✅ 退勤しました',
        `退勤時刻: ${formatTime(data.clockOutAt)}\n実働: ${formatDuration(data.workMinutes ?? 0)}\n\nお疲れさまでした！`
      );
    },
    onError: (error: any) => {
      Alert.alert('エラー', error?.message || '退勤打刻に失敗しました');
    },
  });

  const startBreakMutation = useMutation({
    mutationFn: () => AttendanceApi.startBreak(),
    onSuccess: () => {
      invalidate();
      Alert.alert('☕ 休憩開始', 'ゆっくり休んでください');
    },
    onError: (error: any) => {
      Alert.alert('エラー', error?.message || '休憩開始に失敗しました');
    },
  });

  const endBreakMutation = useMutation({
    mutationFn: () => AttendanceApi.endBreak(),
    onSuccess: () => {
      invalidate();
      Alert.alert('💪 休憩終了', '作業を再開します');
    },
    onError: (error: any) => {
      Alert.alert('エラー', error?.message || '休憩終了に失敗しました');
    },
  });

  const isMutating =
    clockInMutation.isPending ||
    clockOutMutation.isPending ||
    startBreakMutation.isPending ||
    endBreakMutation.isPending;

  const confirmClockIn = () => {
    Alert.alert('出勤打刻', '出勤しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '出勤する', onPress: () => clockInMutation.mutate() },
    ]);
  };

  const confirmClockOut = () => {
    Alert.alert('退勤打刻', '退勤しますか？\n（退勤後は変更できません）', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '退勤する', style: 'destructive', onPress: () => clockOutMutation.mutate() },
    ]);
  };

  // 状態判定: 未出勤 / 勤務中 / 休憩中 / 退勤済み
  const status: 'NOT_CLOCKED_IN' | 'WORKING' | 'ON_BREAK' | 'COMPLETED' = !record
    ? 'NOT_CLOCKED_IN'
    : (record.status as 'WORKING' | 'ON_BREAK' | 'COMPLETED');

  const statusInfo = {
    NOT_CLOCKED_IN: { emoji: '🌅', label: '出勤前', style: styles.statusGray },
    WORKING: { emoji: '🔧', label: '勤務中', style: styles.statusBlue },
    ON_BREAK: { emoji: '☕', label: '休憩中', style: styles.statusYellow },
    COMPLETED: { emoji: '🌇', label: '退勤済み', style: styles.statusGreen },
  }[status];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>⏰</Text>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⏰ 勤怠打刻</Text>
      </View>

      {/* 大時計 */}
      <View style={styles.clockContainer}>
        <Text style={styles.clockDate}>
          {now.toLocaleDateString('ja-JP', {
            month: 'long',
            day: 'numeric',
            weekday: 'short',
          })}
        </Text>
        <Text style={styles.clockTime}>
          {now.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Text>
      </View>

      {/* 現在の状態バッジ */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, statusInfo.style]}>
          <Text style={styles.statusBadgeText}>
            {statusInfo.emoji} {statusInfo.label}
          </Text>
        </View>
      </View>

      {/* メイン打刻ボタン（状態によって変わる） */}
      <View style={styles.actionsContainer}>
        {status === 'NOT_CLOCKED_IN' && (
          <TouchableOpacity
            style={[styles.punchButton, styles.punchButtonGreen]}
            onPress={confirmClockIn}
            disabled={isMutating}
            activeOpacity={0.7}
          >
            <Text style={styles.punchButtonEmoji}>🌅</Text>
            <Text style={styles.punchButtonText}>
              {clockInMutation.isPending ? '打刻中...' : '出勤する'}
            </Text>
          </TouchableOpacity>
        )}

        {status === 'WORKING' && (
          <>
            <TouchableOpacity
              style={[styles.punchButton, styles.punchButtonRed]}
              onPress={confirmClockOut}
              disabled={isMutating}
              activeOpacity={0.7}
            >
              <Text style={styles.punchButtonEmoji}>🌇</Text>
              <Text style={styles.punchButtonText}>
                {clockOutMutation.isPending ? '打刻中...' : '退勤する'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.punchButtonSmall, styles.punchButtonYellow]}
              onPress={() => startBreakMutation.mutate()}
              disabled={isMutating}
              activeOpacity={0.7}
            >
              <Text style={styles.punchButtonSmallEmoji}>☕</Text>
              <Text style={styles.punchButtonSmallText}>
                {startBreakMutation.isPending ? '記録中...' : '休憩に入る'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'ON_BREAK' && (
          <>
            <TouchableOpacity
              style={[styles.punchButton, styles.punchButtonBlue]}
              onPress={() => endBreakMutation.mutate()}
              disabled={isMutating}
              activeOpacity={0.7}
            >
              <Text style={styles.punchButtonEmoji}>💪</Text>
              <Text style={styles.punchButtonText}>
                {endBreakMutation.isPending ? '記録中...' : '休憩を終わる'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.punchButtonSmall, styles.punchButtonRedOutline]}
              onPress={confirmClockOut}
              disabled={isMutating}
              activeOpacity={0.7}
            >
              <Text style={styles.punchButtonSmallEmoji}>🌇</Text>
              <Text style={styles.punchButtonSmallTextRed}>そのまま退勤する</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'COMPLETED' && (
          <Card style={styles.completedCard}>
            <Text style={styles.completedEmoji}>🎉</Text>
            <Text style={styles.completedTitle}>本日もお疲れさまでした！</Text>
          </Card>
        )}
      </View>

      {/* 今日の記録 */}
      {record && (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📋 今日の記録</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>出勤</Text>
            <Text style={styles.summaryValue}>{formatTime(record.clockInAt)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>退勤</Text>
            <Text style={styles.summaryValue}>{formatTime(record.clockOutAt)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>休憩</Text>
            <Text style={styles.summaryValue}>{formatDuration(record.breakMinutes)}</Text>
          </View>
          {record.workMinutes != null && (
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>実働</Text>
              <Text style={styles.summaryValueTotal}>
                {formatDuration(record.workMinutes)}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* 履歴ボタン */}
      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.push('/electrical-mobile/attendance-history')}
        activeOpacity={0.7}
      >
        <Text style={styles.historyButtonText}>📅 勤怠履歴を見る</Text>
      </TouchableOpacity>

      {/* 注意書き */}
      <View style={styles.noteBox}>
        <Text style={styles.noteText}>💡 打刻するとすぐに記録されます</Text>
        <Text style={styles.noteText}>休憩を忘れて退勤しても自動で記録されます</Text>
      </View>

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
  clockContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  clockDate: {
    fontSize: 28,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  clockTime: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 3,
  },
  statusGray: {
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF',
  },
  statusBlue: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  statusYellow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  statusGreen: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  statusBadgeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 24,
  },
  punchButton: {
    borderRadius: 24,
    paddingVertical: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  punchButtonGreen: {
    backgroundColor: '#10B981',
  },
  punchButtonRed: {
    backgroundColor: '#EF4444',
  },
  punchButtonBlue: {
    backgroundColor: '#2563EB',
  },
  punchButtonEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  punchButtonText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  punchButtonSmall: {
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  punchButtonYellow: {
    backgroundColor: '#F59E0B',
  },
  punchButtonRedOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#EF4444',
  },
  punchButtonSmallEmoji: {
    fontSize: 32,
  },
  punchButtonSmallText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  punchButtonSmallTextRed: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  completedCard: {
    padding: 32,
    alignItems: 'center',
  },
  completedEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 24,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  summaryRowTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 24,
    color: '#6B7280',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryLabelTotal: {
    fontSize: 26,
    color: '#10B981',
    fontWeight: 'bold',
  },
  summaryValueTotal: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#10B981',
  },
  historyButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  noteBox: {
    backgroundColor: '#DBEAFE',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#3B82F6',
  },
  noteText: {
    fontSize: 20,
    color: '#1E40AF',
    fontWeight: '600',
    lineHeight: 30,
    marginBottom: 8,
  },
  footer: {
    height: 40,
  },
});
