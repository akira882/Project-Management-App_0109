import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

/**
 * 共通ボタン（アクセシビリティ優先）。
 *
 * - 最小タップ高 56dp（プライマリ操作向け）。
 * - ラベルは太字 22pt。色は variant で決まり、状態は必ずテキスト＋色で伝える。
 * - loading 中は ActivityIndicator を表示し、押下を無効化する。
 * - disabled 時は半透明にして操作不能を視覚的に伝える。
 */

export type ButtonVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary';

export interface ButtonProps {
  /** ボタンに表示する日本語ラベル。 */
  title: string;
  /** 押下時のハンドラ。 */
  onPress: () => void;
  /** 配色バリアント。既定は primary。 */
  variant?: ButtonVariant;
  /** 無効状態。 */
  disabled?: boolean;
  /** 読み込み中（スピナー表示・押下不可）。 */
  loading?: boolean;
  /** スクリーンリーダー向けラベル（未指定時は title を使用）。 */
  accessibilityLabel?: string;
  /** 追加スタイル。 */
  style?: StyleProp<ViewStyle>;
}

/** バリアント → 背景色 / 文字色。 */
const VARIANT_COLORS: Record<ButtonVariant, { bg: string; fg: string }> = {
  primary: { bg: '#1E40AF', fg: '#FFFFFF' },
  success: { bg: '#10B981', fg: '#FFFFFF' },
  warning: { bg: '#F59E0B', fg: '#0F172A' },
  danger: { bg: '#EF4444', fg: '#FFFFFF' },
  secondary: { bg: '#FFFFFF', fg: '#1E40AF' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: ButtonProps): JSX.Element {
  const colors = VARIANT_COLORS[variant];
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.bg,
          borderColor: variant === 'secondary' ? '#1E40AF' : 'transparent',
        },
        variant === 'secondary' && styles.secondaryBorder,
        pressed && !isInactive && styles.pressed,
        isInactive && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.fg} accessibilityLabel="処理中" />
        ) : (
          <Text style={[styles.label, { color: colors.fg }]} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBorder: {
    borderWidth: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
});

export default Button;
