import type { AttendanceRecord, AttendanceRow } from '@/types/attendance';

import { supabase } from './client';
import { isUniqueViolation, toSupabaseError } from './SupabaseError';

/**
 * 勤怠レコードの Supabase 永続化 API。
 * - アプリ内表現（camelCase の AttendanceRecord）と DB 表現（snake_case の AttendanceRow）を相互変換する。
 * - `insertRecords` は同期キューのフラッシュ（FlushDeps.insertBatch）にそのまま注入できる契約で実装する。
 *
 * 変更時は infra/sql/schema.sql の attendance_records と整合させること。
 */

const TABLE = 'attendance_records';

/** AttendanceRecord（camelCase）を DB 行（snake_case）へ変換する。 */
export function rowFromRecord(r: AttendanceRecord): AttendanceRow {
  return {
    id: r.id,
    user_id: r.userId,
    record_type: r.recordType,
    recorded_at: r.recordedAt,
    location: r.location ?? null,
    note: r.note ?? null,
  };
}

/** DB 行（snake_case）を AttendanceRecord（camelCase）へ変換する。 */
export function recordFromRow(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    userId: row.user_id,
    recordType: row.record_type,
    recordedAt: row.recorded_at,
    location: row.location ?? null,
    note: row.note ?? null,
  };
}

/**
 * レコード配列をバッチ挿入する。
 *
 * 戻り値は成功 id（okIds）と失敗 id（failedIds）。本関数は `FlushDeps.insertBatch` として
 * そのまま渡せるよう設計している（フラッシュ側が okIds をキューから除去する）。
 *
 * バッチ単位の冪等ポリシー:
 *   打刻 id はクライアント生成 UUID（冪等キー）であり、一意制約違反（'23505' / 409）は
 *   「同一レコードが既に受領済み」を意味する。したがってユニーク違反が返った場合は
 *   バッチ全体を okIds（成功）として扱い、再送による重複をエラーにしない。
 *   それ以外のエラーはバッチ全体を failedIds（要再試行）として扱う。
 *   ※ supabase-js の insert は単一エラーしか返さないため、判定はバッチ単位で行う。
 */
export async function insertRecords(
  records: AttendanceRecord[],
): Promise<{ okIds: string[]; failedIds: string[] }> {
  if (records.length === 0) {
    return { okIds: [], failedIds: [] };
  }

  const ids = records.map((r) => r.id);
  const { error } = await supabase.from(TABLE).insert(records.map(rowFromRecord));

  if (!error) {
    return { okIds: ids, failedIds: [] };
  }

  // 冪等キー衝突（既受領）は成功扱い。それ以外は失敗扱い（キューに残して再試行）。
  if (isUniqueViolation(error)) {
    return { okIds: ids, failedIds: [] };
  }
  return { okIds: [], failedIds: ids };
}

/**
 * 指定ユーザーの勤怠履歴を recorded_at 降順で取得する。
 * 失敗時は toSupabaseError で正規化して throw する。
 */
export async function fetchHistory(userId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false });

  if (error) {
    throw toSupabaseError(error);
  }

  const rows = (data ?? []) as AttendanceRow[];
  return rows.map(recordFromRow);
}
