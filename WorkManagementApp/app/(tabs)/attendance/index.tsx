import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AttendanceButton } from '@/components/AttendanceButton';
import { StatusBanner } from '@/components/StatusBanner';
import { Card } from '@/components/ui/Card';
import { useAttendance } from '@/hooks/useAttendance';
import { RECORD_TYPE_LABELS, type RecordType } from '@/types/attendance';
import { dayKey } from '@/utils/datetime';

/**
 * 打刻画面。
 *
 * - 現在の勤務状態（StatusBanner）と、1秒ごとに更新される現在時刻を表示。
 * - 出勤 / 退勤 / 休憩開始 / 休憩終了 の4ボタンを大きく配置し、押下で打刻する。
 *   打刻アクションは内部でキュー投入＋即時同期まで行う（オフライン可）。
 * - 当日のレコードは useAttendance().history を dayKey で当日分に絞って算出する。
 * - 打刻完了後は確認メッセージ（Web は inline テキスト / ネイティブは Alert）を出す。
 */

/** 現在時刻を 'HH:mm:ss' で返す（端末ローカル）。 */
function formatClock(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

const ORDER: RecordType[] = ['clockIn', 'clockOut', 'breakStart', 'breakEnd'];

export default function AttendanceScreen(): JSX.Element {
  const { clock, history } = useAttendance();

  // 1秒ごとに更新する現在時刻。
  const [now, setNow] = useState<Date>(() => new Date());
  // 送信中の打刻種別（重複押下防止＋ローディング表示）。
  const [pending, setPending] = useState<RecordType | null>(null);
  // 直近の打刻完了メッセージ（Web向けインライン表示）。
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 当日（ローカル日付）のレコードのみを抽出する。
  const todayRecords = useMemo(() => {
    const today = dayKey(new Date().toISOString());
    return history.filter((r) => dayKey(r.recordedAt) === today);
  }, [history]);

  /** 指定種別で打刻し、完了メッセージを表示する。 */
  const handleClock = async (recordType: RecordType): Promise<void> => {
    if (pending) {
      return;
    }
    setPending(recordType);
    setNotice(null);
    try {
      await clock(recordType);
      const message = `${RECORD_TYPE_LABELS[recordType]}を記録しました`;
      // ネイティブはダイアログ、Web は画面内テキストで確認を出す。
      if (Platform.OS === 'web') {
        setNotice(message);
      } else {
        Alert.alert('打刻完了', message);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '打刻に失敗しました';
      if (Platform.OS === 'web') {
        setNotice(message);
      } else {
        Alert.alert('打刻エラー', message);
      }
    } finally {
      setPending(null);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Card style={styles.statusCard}>
        <StatusBanner records={todayRecords} />
        <View style={styles.clockWrap}>
          <Text style={styles.clock} accessibilityLabel={`現在時刻 ${formatClock(now)}`}>
            {formatClock(now)}
          </Text>
        </View>
      </Card>

      {notice ? (
        <View style={styles.notice} accessibilityRole="alert">
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <View style={styles.buttons}>
        {ORDER.map((recordType) => (
          <View key={recordType} style={styles.buttonWrap}>
            <AttendanceButton
              recordType={recordType}
              onPress={() => void handleClock(recordType)}
              loading={pending === recordType}
              disabled={pending !== null && pending !== recordType}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  statusCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  clockWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  clock: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  notice: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
  },
  buttonWrap: {
    width: '100%',
  },
});
