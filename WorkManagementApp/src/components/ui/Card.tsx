import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { ReactNode } from 'react';

/**
 * カード。白背景・薄い枠線と控えめな影でコンテンツをグルーピングする。
 */
export interface CardProps {
  children: ReactNode;
  /** 追加スタイル。 */
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps): JSX.Element {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    // iOS の影
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    // Android の影
    elevation: 2,
  },
});

export default Card;
