import { format, parseISO } from 'date-fns';

/**
 * 日時整形ヘルパー（日本語UI向け）。
 * 入力 ISO 文字列はローカルタイムゾーンに変換して表示する。
 */

/** 現在時刻を ISO8601（UTC）文字列で返す。 */
export function nowIso(): string {
  return new Date().toISOString();
}

/** 'HH:mm' 形式（例: 09:30）。 */
export function formatTime(iso: string): string {
  return format(parseISO(iso), 'HH:mm');
}

/** 'yyyy/MM/dd' 形式（例: 2026/06/08）。 */
export function formatDate(iso: string): string {
  return format(parseISO(iso), 'yyyy/MM/dd');
}

/** 'yyyy/MM/dd HH:mm' 形式（例: 2026/06/08 09:30）。 */
export function formatDateTime(iso: string): string {
  return format(parseISO(iso), 'yyyy/MM/dd HH:mm');
}

/** 日単位グルーピング用キー 'yyyy-MM-dd'。 */
export function dayKey(iso: string): string {
  return format(parseISO(iso), 'yyyy-MM-dd');
}

/** 月単位グルーピング用キー 'yyyy-MM'。 */
export function monthKey(iso: string): string {
  return format(parseISO(iso), 'yyyy-MM');
}
