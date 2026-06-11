import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { AttendanceRecord, RecordType } from '@/types/attendance';

/**
 * 本日の勤務状態バナー。
 *
 * 渡された当日の勤怠レコードから「最新の打刻」を求め、現在の状態を日本語で表示する。
 * 状態は色付きチップ＋大きなテキストの両方で伝える（色のみに依存しない）。
 *
 * 状態の導出:
 * - レコード無し           → 未出勤
 * - 直近が clockIn        → 勤務中
 * - 直近が breakStart     → 休憩中
 * - 直近が breakEnd       → 勤務中
 * - 直近が clockOut       → 退勤済み
 */

export interface StatusBannerProps {
  /** 当日の勤怠レコード（順不同で可）。 */
  records: AttendanceRecord[];
}

type WorkState = 'notClockedIn' | 'working' | 'onBreak' | 'clockedOut';

interface StateMeta {
  label: string;
  color: string;
  textColor: string;
}

const STATE_META: Record<WorkState, StateMeta> = {
  notClockedIn: { label: '未出勤', color: '#E2E8F0', textColor: '#0F172A' },
  working: { label: '勤務中', color: '#10B981', textColor: '#FFFFFF' },
  onBreak: { label: '休憩中', color: '#F59E0B', textColor: '#0F172A' },
  clockedOut: { label: '退勤済み', color: '#EF4444', textColor: '#FFFFFF' },
};

/** 最新打刻種別 → 勤務状態。 */
const RECORD_TYPE_STATE: Record<RecordType, WorkState> = {
  clockIn: 'working',
  breakStart: 'onBreak',
  breakEnd: 'working',
  clockOut: 'clockedOut',
};

/** 当日レコードから最新の打刻種別を求め、勤務状態へ変換する。 */
function deriveState(records: AttendanceRecord[]): WorkState {
  if (records.length === 0) {
    return 'notClockedIn';
  }
  // recordedAt 昇順で最後（=最新）のレコードを採用する。
  const latest = records.reduce((acc, cur) =>
    cur.recordedAt > acc.recordedAt ? cur : acc,
  );
  return RECORD_TYPE_STATE[latest.recordType];
}

export function StatusBanner({ records }: StatusBannerProps): JSX.Element {
  const state = useMemo(() => deriveState(records), [records]);
  const meta = STATE_META[state];

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`現在の状態: ${meta.label}`}
    >
      <Text style={styles.caption}>現在の状態</Text>
      <View style={[styles.chip, { backgroundColor: meta.color }]}>
        <Text style={[styles.chipText, { color: meta.textColor }]}>
          {meta.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    minWidth: 160,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 28,
    fontWeight: '700',
  },
});

export default StatusBanner;
