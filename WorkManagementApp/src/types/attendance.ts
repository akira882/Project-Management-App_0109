/**
 * 勤怠ドメインの共有型。サーバ（Supabase）・キュー・UI で共通利用する。
 * 変更時は infra/sql/schema.sql の attendance_records と整合させること。
 */

/** 打刻種別 */
export type RecordType = 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd';

export const RECORD_TYPE_LABELS: Record<RecordType, string> = {
  clockIn: '出勤打刻',
  clockOut: '退勤打刻',
  breakStart: '休憩開始',
  breakEnd: '休憩終了',
};

/** 位置情報（任意） */
export interface GeoLocation {
  lat: number;
  lng: number;
}

/**
 * 勤怠レコード。`id` はクライアント生成 UUID（冪等キー）。
 * recordedAt は ISO8601 文字列（端末ローカルでも UTC に正規化して保持）。
 */
export interface AttendanceRecord {
  id: string;
  userId: string;
  recordType: RecordType;
  recordedAt: string;
  location?: GeoLocation | null;
  note?: string | null;
}

/**
 * 同期キュー上のレコード。送信試行回数を保持し、バックオフ/デッドレター判定に使う。
 */
export interface QueuedRecord extends AttendanceRecord {
  attempts: number;
  enqueuedAt: string;
}

/** Supabase の snake_case 行表現（DB ↔ アプリのマッピング用） */
export interface AttendanceRow {
  id: string;
  user_id: string;
  record_type: RecordType;
  recorded_at: string;
  location: GeoLocation | null;
  note: string | null;
  created_at?: string;
}
