import { useCallback, useEffect, useRef } from 'react';

import { attendanceQueue } from '@/services/queue/attendanceQueue';
import { flushQueue } from '@/services/queue/flush';
import { insertRecords } from '@/services/supabase/attendanceApi';
import { toSupabaseError } from '@/services/supabase/SupabaseError';
import { useSyncStore } from '@/store/syncStore';

import { useNetwork } from './useNetwork';

/**
 * 同期（フラッシュ）オーケストレーションフック。
 *
 * 役割:
 * - `flushQueue` に接続状態（NetInfo）と Supabase 送信（insertRecords）を注入して配線する。
 * - `useSyncStore.isSyncing` をミューテックスとして二重実行を防ぐ。
 * - フラッシュ後に未送信件数（pendingCount）を再計算し、成功時は markSynced、
 *   例外時は日本語エラーを設定する。
 * - 接続状態の変化を購読し、オフライン→オンラインへ復帰した瞬間に自動同期する。
 *
 * UI 状態は syncStore に集約し、本フックはその値を読み出して公開する。
 */

export interface UseSync {
  /** 即時同期を試みる。オフライン時や同期中はスキップされる（throw しない）。 */
  syncNow: () => Promise<void>;
  /** 同期処理が進行中か。 */
  isSyncing: boolean;
  /** 未送信（キュー滞留）件数。 */
  pendingCount: number;
  /** 最後に同期成功した時刻（ISO）。未同期なら null。 */
  lastSyncedAt: string | null;
}

export function useSync(): UseSync {
  const { isConnected } = useNetwork();

  const isSyncing = useSyncStore((s) => s.isSyncing);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);

  // キュー件数を読み直して syncStore へ反映する。
  const refreshPending = useCallback(async (): Promise<void> => {
    const next = await attendanceQueue.count();
    useSyncStore.getState().setPendingCount(next);
  }, []);

  const syncNow = useCallback(async (): Promise<void> => {
    const store = useSyncStore.getState();

    // 既に同期中なら二重実行しない（getState で最新値を参照する）。
    if (store.isSyncing) {
      return;
    }

    store.setSyncing(true);
    try {
      await flushQueue({ isConnected, insertBatch: insertRecords });
      // 送信後の滞留件数を反映する。
      await refreshPending();
      useSyncStore.getState().markSynced();
    } catch (e) {
      // 想定外の例外（insertRecords は基本 throw しないが念のため）を日本語化して保持する。
      useSyncStore.getState().setError(toSupabaseError(e).message);
    } finally {
      useSyncStore.getState().setSyncing(false);
    }
  }, [isConnected, refreshPending]);

  // 接続状態変化の購読で参照する最新の syncNow を ref に保持する
  // （effect の依存に syncNow を入れず、毎回最新実装を呼べるようにする）。
  const syncNowRef = useRef(syncNow);
  useEffect(() => {
    syncNowRef.current = syncNow;
  }, [syncNow]);

  // マウント時に滞留件数を初期化する。
  useEffect(() => {
    void refreshPending();
  }, [refreshPending]);

  // オフライン→オンラインへ復帰した瞬間に自動同期する。
  const prevConnectedRef = useRef<boolean>(isConnected);
  useEffect(() => {
    const prev = prevConnectedRef.current;
    prevConnectedRef.current = isConnected;
    if (!prev && isConnected) {
      void syncNowRef.current();
    }
  }, [isConnected]);

  return { syncNow, isSyncing, pendingCount, lastSyncedAt };
}
