import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';

import { RECORD_TYPE_LABELS, type AttendanceRecord } from '@/types/attendance';
import { dayKey, formatDate, formatTime, monthKey } from '@/utils/datetime';

/**
 * 勤怠履歴リスト。
 *
 * `mode` に応じてレコードを日次（dayKey）/ 月次（monthKey）でグルーピングし、
 * セクション見出し付きで一覧表示する。各行は打刻種別ラベル＋時刻を表示する。
 * レコードが無い場合は「記録がありません」を表示する。
 *
 * セクション・各行ともに recorded_at の降順（新しい順）で並べる。
 */

export interface HistoryListProps {
  /** 表示対象の勤怠レコード。 */
  records: AttendanceRecord[];
  /** グルーピング単位。daily=日次 / monthly=月次。 */
  mode: 'daily' | 'monthly';
}

interface Section {
  /** セクション見出し（日付 or 年月）。 */
  title: string;
  /** グルーピングキー（並び替え用）。 */
  key: string;
  /** セクション内のレコード（新しい順）。 */
  data: AttendanceRecord[];
}

/** 月キー 'yyyy-MM' を日本語見出し 'yyyy年M月' に整形する。 */
function monthTitle(key: string): string {
  const [year, month] = key.split('-');
  return `${year}年${Number(month)}月`;
}

/** レコード配列を mode に応じたセクション配列へ変換する（降順）。 */
function buildSections(records: AttendanceRecord[], mode: 'daily' | 'monthly'): Section[] {
  const groups = new Map<string, AttendanceRecord[]>();

  for (const record of records) {
    const key = mode === 'daily' ? dayKey(record.recordedAt) : monthKey(record.recordedAt);
    const bucket = groups.get(key);
    if (bucket) {
      bucket.push(record);
    } else {
      groups.set(key, [record]);
    }
  }

  return (
    Array.from(groups.entries())
      .map(([key, items]) => ({
        key,
        title: mode === 'daily' ? formatDate(items[0].recordedAt) : monthTitle(key),
        // セクション内も新しい順に並べる。
        data: [...items].sort((a, b) =>
          a.recordedAt < b.recordedAt ? 1 : a.recordedAt > b.recordedAt ? -1 : 0,
        ),
      }))
      // セクション（キー）も新しい順に並べる。
      .sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0))
  );
}

export function HistoryList({ records, mode }: HistoryListProps): JSX.Element {
  const sections = useMemo(() => buildSections(records, mode), [records, mode]);

  if (sections.length === 0) {
    return (
      <View style={styles.empty} accessibilityRole="text">
        <Text style={styles.emptyText}>記録がありません</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <View
          style={styles.row}
          accessibilityRole="text"
          accessibilityLabel={`${RECORD_TYPE_LABELS[item.recordType]} ${formatTime(
            item.recordedAt,
          )}`}
        >
          <Text style={styles.rowLabel}>{RECORD_TYPE_LABELS[item.recordType]}</Text>
          <Text style={styles.rowTime}>{formatTime(item.recordedAt)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
  },
  sectionHeader: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowLabel: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '600',
  },
  rowTime: {
    fontSize: 20,
    color: '#1E40AF',
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});

export default HistoryList;
