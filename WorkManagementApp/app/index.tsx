import { StyleSheet, Text, View } from 'react-native';

/**
 * エントリ画面（P0 最小版）。
 * P3 で認証状態に応じて (auth)/login または (tabs)/attendance へリダイレクトする実装に置き換える。
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>勤怠管理アプリ</Text>
      <Text style={styles.subtitle}>セットアップ中…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
  },
});
