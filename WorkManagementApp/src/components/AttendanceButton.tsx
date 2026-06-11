import { Button, type ButtonVariant } from '@/components/ui/Button';
import { RECORD_TYPE_LABELS, type RecordType } from '@/types/attendance';

/**
 * 打刻アクション用の大きなボタン。
 *
 * 打刻種別 → ラベル（RECORD_TYPE_LABELS）＋配色（variant）へマッピングして
 * ui/Button を描画する。色だけでなくラベルでも種別を伝える。
 * - clockIn   … success（緑）
 * - clockOut  … danger （赤）
 * - breakStart/breakEnd … warning（橙）
 */

export interface AttendanceButtonProps {
  /** 打刻種別。 */
  recordType: RecordType;
  /** 押下時のハンドラ。 */
  onPress: () => void;
  /** 無効状態。 */
  disabled?: boolean;
  /** 読み込み中（送信中）。 */
  loading?: boolean;
}

/** 打刻種別 → ボタン配色。 */
const RECORD_TYPE_VARIANT: Record<RecordType, ButtonVariant> = {
  clockIn: 'success',
  clockOut: 'danger',
  breakStart: 'warning',
  breakEnd: 'warning',
};

export function AttendanceButton({
  recordType,
  onPress,
  disabled = false,
  loading = false,
}: AttendanceButtonProps): JSX.Element {
  const label = RECORD_TYPE_LABELS[recordType];

  return (
    <Button
      title={label}
      onPress={onPress}
      variant={RECORD_TYPE_VARIANT[recordType]}
      disabled={disabled}
      loading={loading}
      accessibilityLabel={`${label}ボタン`}
    />
  );
}

export default AttendanceButton;
