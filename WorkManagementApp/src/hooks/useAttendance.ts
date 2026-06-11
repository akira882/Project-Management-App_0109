import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { attendanceQueue, enqueue } from '@/services/queue/attendanceQueue';
import { fetchHistory } from '@/services/supabase/attendanceApi';
import { useAuthStore } from '@/store/authStore';
import { useSyncStore } from '@/store/syncStore';
import type {
  AttendanceRecord,
  GeoLocation,
  RecordType,
} from '@/types/attendance';
import { nowIso } from '@/utils/datetime';
import { newId } from '@/utils/uuid';

import { useSync } from './useSync';

/**
 * 勤怠打刻ワークフローの中核フック。
 *
 * - `clock` … 打刻種別を受け取り、冪等キー（クライアント生成 UUID）付きの
 *   AttendanceRecord をオフラインキューへ enqueue する。enqueue 後に滞留件数を
 *   更新し、続けて syncNow() で即時送信を試みる（楽観的。圏外でも失敗にしない）。
 * - `clockIn` / `clockOut` / `breakStart` / `breakEnd` … clock の糖衣。
 * - `history` … React Query でサーバ履歴を recorded_at 降順で取得する。
 *
 * useSync を内部で合成し、打刻アクションが同期をトリガーする構成にしている。
 */

export interface ClockOptions {
  /** 任意メモ。 */
  note?: string;
  /** 任意の位置情報。 */
  location?: GeoLocation;
}

export interface UseAttendance {
  /** 打刻する（オフライン可）。 */
  clock: (recordType: RecordType, opts?: ClockOptions) => Promise<void>;
  /** 出勤打刻。 */
  clockIn: (opts?: ClockOptions) => Promise<void>;
  /** 退勤打刻。 */
  clockOut: (opts?: ClockOptions) => Promise<void>;
  /** 休憩開始。 */
  breakStart: (opts?: ClockOptions) => Promise<void>;
  /** 休憩終了。 */
  breakEnd: (opts?: ClockOptions) => Promise<void>;
  /** サーバ取得済みの勤怠履歴（recorded_at 降順）。未取得時は空配列。 */
  history: AttendanceRecord[];
  /** 履歴の読み込み中フラグ。 */
  isLoading: boolean;
  /** 履歴の再取得。 */
  refetch: () => void;
}

export function useAttendance(): UseAttendance {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { syncNow } = useSync();

  const clock = useCallback(
    async (recordType: RecordType, opts?: ClockOptions): Promise<void> => {
      // 打刻には認証済みユーザーが必須。
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        throw new Error('打刻するにはログインが必要です。');
      }

      const record: AttendanceRecord = {
        id: newId(),
        userId: currentUser.id,
        recordType,
        recordedAt: nowIso(),
        location: opts?.location ?? null,
        note: opts?.note ?? null,
      };

      // まずオフラインキューへ確実に積む（圏内/圏外を問わず欠落させない）。
      await enqueue(record);

      // 滞留件数を最新化する。
      const pending = await attendanceQueue.count();
      useSyncStore.getState().setPendingCount(pending);

      // 続けて即時送信を試みる（楽観的。オフラインなら skipped となり後で自動同期される）。
      await syncNow();
    },
    [syncNow],
  );

  const clockIn = useCallback(
    (opts?: ClockOptions) => clock('clockIn', opts),
    [clock],
  );
  const clockOut = useCallback(
    (opts?: ClockOptions) => clock('clockOut', opts),
    [clock],
  );
  const breakStart = useCallback(
    (opts?: ClockOptions) => clock('breakStart', opts),
    [clock],
  );
  const breakEnd = useCallback(
    (opts?: ClockOptions) => clock('breakEnd', opts),
    [clock],
  );

  const query = useQuery({
    queryKey: ['attendance', userId],
    queryFn: () => fetchHistory(userId as string),
    enabled: !!userId,
  });

  return {
    clock,
    clockIn,
    clockOut,
    breakStart,
    breakEnd,
    history: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
