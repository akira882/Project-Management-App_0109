import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Button } from './Button';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = 'エラーが発生しました',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="再試行"
          onPress={onRetry}
          variant="primary"
          size="medium"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    minWidth: 120,
  },
});
