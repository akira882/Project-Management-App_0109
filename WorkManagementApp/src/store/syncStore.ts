import { create } from 'zustand';

import { nowIso } from '@/utils/datetime';

/**
 * 同期状態ストア（クライアント状態）。
 * isSyncing は単純なミューテックスとして機能し、消費側はフラッシュ前にこれを確認して二重実行を防ぐ。
 */
interface SyncState {
  /** 同期処理が進行中か（ミューテックスフラグ）。 */
  isSyncing: boolean;
  /** 未送信（キュー滞留）件数。 */
  pendingCount: number;
  /** 最後に同期成功した時刻（ISO）。未同期なら null。 */
  lastSyncedAt: string | null;
  /** 直近のエラーメッセージ。無ければ null。 */
  error: string | null;
  setSyncing(v: boolean): void;
  setPendingCount(n: number): void;
  markSynced(): void;
  setError(e: string | null): void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  pendingCount: 0,
  lastSyncedAt: null,
  error: null,
  setSyncing: (v) => set({ isSyncing: v }),
  setPendingCount: (n) => set({ pendingCount: n }),
  markSynced: () => set({ lastSyncedAt: nowIso(), error: null }),
  setError: (e) => set({ error: e }),
}));
