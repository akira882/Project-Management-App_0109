import type { AttendanceRecord } from '@/types/attendance';

import { attendanceQueue } from './attendanceQueue';

/**
 * フラッシュ（送信）アルゴリズム（純粋・単体テスト対象）。
 * P2 の useSync が NetInfo（接続状態）と Supabase（insertBatch）を本関数へ注入して配線する。
 */

export interface FlushDeps {
  /** 現在オンラインか。false の場合は送信せずスキップする。 */
  isConnected: boolean;
  /**
   * バッチ送信。成功した id（okIds）と失敗した id（failedIds）を返す。
   * 一意制約違反 / 409（= 冪等キー衝突 = 既に受領済み）は「成功」として okIds に含める。
   */
  insertBatch: (
    records: AttendanceRecord[]
  ) => Promise<{ okIds: string[]; failedIds: string[] }>;
  /** デッドレター化までの最大試行回数（既定 5）。 */
  maxAttempts?: number;
}

export interface FlushResult {
  /** 送信を試みた件数。 */
  attempted: number;
  /** 送信成功でキューから除去した件数。 */
  flushed: number;
  /** 今回失敗し、まだキューに残っている件数。 */
  failed: number;
  /** 最大試行回数に達して破棄した件数。 */
  deadLettered: number;
  /** オフラインのため送信をスキップしたか。 */
  skipped: boolean;
}

const DEFAULT_MAX_ATTEMPTS = 5;

/**
 * キューをフラッシュする。
 * - 未接続: insertBatch を呼ばず { skipped: true } を返す（キューは無変更）。
 * - 接続済み: list()（recordedAt 昇順）を insertBatch に渡す。
 *   - okIds … remove() で除去（flushed）。
 *   - failedIds … incrementAttempts() し、増加後の試行回数が maxAttempts 以上なら
 *     remove() で破棄（deadLettered）、未満なら残置（failed）。
 */
export async function flushQueue(deps: FlushDeps): Promise<FlushResult> {
  const { isConnected, insertBatch } = deps;
  const maxAttempts = deps.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  if (!isConnected) {
    return {
      attempted: 0,
      flushed: 0,
      failed: 0,
      deadLettered: 0,
      skipped: true,
    };
  }

  const queued = await attendanceQueue.list();
  if (queued.length === 0) {
    return {
      attempted: 0,
      flushed: 0,
      failed: 0,
      deadLettered: 0,
      skipped: false,
    };
  }

  // 送信前の試行回数を記録しておき、インクリメント後の値を判定に使う。
  const attemptsBefore = new Map<string, number>();
  for (const item of queued) {
    attemptsBefore.set(item.id, item.attempts);
  }

  const records: AttendanceRecord[] = queued.map((item) => ({
    id: item.id,
    userId: item.userId,
    recordType: item.recordType,
    recordedAt: item.recordedAt,
    location: item.location,
    note: item.note,
  }));

  const { okIds, failedIds } = await insertBatch(records);

  let flushed = 0;
  for (const id of okIds) {
    await attendanceQueue.remove(id);
    flushed += 1;
  }

  let failed = 0;
  let deadLettered = 0;
  for (const id of failedIds) {
    await attendanceQueue.incrementAttempts(id);
    const nextAttempts = (attemptsBefore.get(id) ?? 0) + 1;
    if (nextAttempts >= maxAttempts) {
      await attendanceQueue.remove(id);
      deadLettered += 1;
    } else {
      failed += 1;
    }
  }

  return {
    attempted: records.length,
    flushed,
    failed,
    deadLettered,
    skipped: false,
  };
}
