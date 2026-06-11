import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSync } from '@/hooks/useSync';
import { formatTime } from '@/utils/datetime';

/**
 * 同期状態インジケータ（ヘッダー右上に配置）。
 *
 * - 同期中: スピナー＋「同期中…」を表示。
 * - 未送信あり: 「未同期 N件」を警告色で表示。
 * - すべて送信済み: 「同期済み」＋最終同期時刻を表示。
 *
 * タップで syncNow() を呼び、手動同期を試みる（オフライン時は内部でスキップ）。
 * 状態は色だけでなくテキストでも伝える（アクセシビリティ配慮）。
 */
export function SyncIndicator(): JSX.Element {
  const { syncNow, isSyncing, pendingCount, lastSyncedAt } = useSync();

  const hasPending = pendingCount > 0;

  // 表示ラベルとアクセシビリティ用ラベルを状態から決める。
  let label: string;
  let accessibilityLabel: string;
  if (isSyncing) {
    label = '同期中…';
    accessibilityLabel = '同期中です';
  } else if (hasPending) {
    label = `未同期 ${pendingCount}件`;
    accessibilityLabel = `未同期が${pendingCount}件あります。タップで同期します`;
  } else if (lastSyncedAt) {
    label = `同期済み ${formatTime(lastSyncedAt)}`;
    accessibilityLabel = `同期済み。最終同期は${formatTime(lastSyncedAt)}です`;
  } else {
    label = '同期済み';
    accessibilityLabel = '同期済みです';
  }

  const textColor = hasPending && !isSyncing ? '#0F172A' : '#FFFFFF';

  return (
    <Pressable
      onPress={() => {
        void syncNow();
      }}
      disabled={isSyncing}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: isSyncing }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.container,
        hasPending && !isSyncing && styles.containerPending,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        {isSyncing ? (
          <ActivityIndicator size="small" color={textColor} style={styles.spinner} />
        ) : (
          <Text style={[styles.dot, { color: textColor }]}>●</Text>
        )}
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 999,
  },
  containerPending: {
    backgroundColor: '#F59E0B',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 6,
  },
  dot: {
    fontSize: 12,
    marginRight: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default SyncIndicator;
