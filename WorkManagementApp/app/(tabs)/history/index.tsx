import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { HistoryList } from '@/components/HistoryList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAttendance } from '@/hooks/useAttendance';

/**
 * 履歴画面。
 *
 * - 「日次」「月次」のトグルで表示単位を切り替える。
 * - HistoryList でグルーピング表示し、読み込み中はスピナーを出す。
 * - 引っ張って更新（pull-to-refresh）で refetch を呼ぶ。
 */

type Mode = 'daily' | 'monthly';

export default function HistoryScreen(): JSX.Element {
  const { history, isLoading, refetch } = useAttendance();
  const [mode, setMode] = useState<Mode>('daily');

  if (isLoading) {
    return <LoadingSpinner message="履歴を読み込み中…" />;
  }

  return (
    <View style={styles.flex}>
      <View style={styles.toggleRow}>
        <ToggleButton label="日次" active={mode === 'daily'} onPress={() => setMode('daily')} />
        <ToggleButton label="月次" active={mode === 'monthly'} onPress={() => setMode('monthly')} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.listWrap}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refetch();
            }}
            tintColor="#1E40AF"
          />
        }
      >
        <HistoryList records={history} mode={mode} />
      </ScrollView>
    </View>
  );
}

/** 日次 / 月次 切替用のトグルボタン。状態は色＋テキスト（太字/下線）で伝える。 */
function ToggleButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}): JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${label}表示${active ? '（選択中）' : ''}`}
      style={[styles.toggle, active ? styles.toggleActive : styles.toggleIdle]}
    >
      <Text style={[styles.toggleText, active ? styles.toggleTextActive : styles.toggleTextIdle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
  },
  toggle: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  toggleIdle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#1E40AF',
  },
  toggleText: {
    fontSize: 18,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextIdle: {
    color: '#1E40AF',
  },
  listWrap: {
    flexGrow: 1,
  },
});
