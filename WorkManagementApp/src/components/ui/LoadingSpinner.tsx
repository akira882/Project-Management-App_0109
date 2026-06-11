import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

/**
 * 中央寄せのローディング表示。任意の日本語メッセージを下に表示する。
 */
export interface LoadingSpinnerProps {
  /** スピナー下に表示する日本語メッセージ（任意）。 */
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps): JSX.Element {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel={message ?? '読み込み中'}
    >
      <ActivityIndicator size="large" color="#1E40AF" />
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  message: {
    marginTop: 16,
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
  },
});

export default LoadingSpinner;
