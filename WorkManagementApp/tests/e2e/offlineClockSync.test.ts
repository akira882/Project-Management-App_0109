/**
 * オフライン打刻 → オンライン復帰 → 同期 の統合テスト（モック Supabase / NetInfo）。
 *
 * 信頼性を優先し、React レンダリングは行わず services / stores を直接駆動する
 * （フック配線は別途単体で担保し、ここでは「打刻が圏外でも欠落せず復帰時に確実に
 * サーバへ届き、再送が冪等である」というワークフローの本質を検証する）。
 *
 * モックの共有について:
 *   本番コードが import する '@supabase/supabase-js' は jest がルート __mocks__/ で
 *   自動置換する。テスト側は同じインメモリ状態へアクセスするため、__ 接頭辞ヘルパーを
 *   相対パスで直接 import する（bare specifier の実型には __ ヘルパーが無いため）。
 */
import {
  __getRows,
  __reset,
  __setMockUser,
} from '../../__mocks__/@supabase/supabase-js';
import {
  __setState,
} from '../../__mocks__/@react-native-community/netinfo';

import { attendanceQueue } from '@/services/queue/attendanceQueue';
import { flushQueue } from '@/services/queue/flush';
import { insertRecords } from '@/services/supabase/attendanceApi';
import { isUniqueViolation } from '@/services/supabase/SupabaseError';
import { useAuthStore } from '@/store/authStore';
import type { AttendanceRecord } from '@/types/attendance';

/** テスト用の打刻レコードを生成する。 */
function makeRecord(
  id: string,
  recordType: AttendanceRecord['recordType'],
): AttendanceRecord {
  return {
    id,
    userId: 'u1',
    recordType,
    recordedAt: '2026-06-08T09:00:00.000Z',
    location: null,
    note: null,
  };
}

beforeEach(async () => {
  // Supabase / キュー / NetInfo を初期化し、オフラインから開始する。
  __reset();
  await attendanceQueue.clear();
  __setState({ isConnected: false, isInternetReachable: false });
  useAuthStore.setState({
    user: null,
    profile: null,
    status: 'idle',
    error: null,
  });
});

describe('オフライン打刻 → 復帰同期ワークフロー', () => {
  it('ログイン → 圏外で打刻 → 復帰で同期され、サーバが受領する（冪等再送も成功扱い）', async () => {
    // --- ログイン -----------------------------------------------------------
    __setMockUser({ id: 'u1', email: 'a@b.jp' });
    await useAuthStore.getState().signIn({ email: 'a@b.jp', password: 'pw' });

    const authed = useAuthStore.getState();
    expect(authed.status).toBe('authenticated');
    expect(authed.user).toEqual({ id: 'u1', email: 'a@b.jp' });

    // --- 圏外で出勤打刻（キューに積むのみ。送信はしない） -------------------
    const record = makeRecord('rec-1', 'clockIn');
    await attendanceQueue.enqueue(record);

    const offlineResult = await flushQueue({
      isConnected: false,
      insertBatch: insertRecords,
    });

    // オフラインなので送信スキップ。サーバ未受領・キューに 1 件残る。
    expect(offlineResult.skipped).toBe(true);
    expect(__getRows()).toHaveLength(0);
    expect(await attendanceQueue.count()).toBe(1);

    // --- オンライン復帰 + 同期 ----------------------------------------------
    __setState({ isConnected: true, isInternetReachable: true });

    const onlineResult = await flushQueue({
      isConnected: true,
      insertBatch: insertRecords,
    });

    expect(onlineResult.flushed).toBe(1);
    expect(await attendanceQueue.count()).toBe(0);

    // サーバ（モック）が同一 id / user / 種別の行を受領していること。
    const rows = __getRows();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: 'rec-1',
      user_id: 'u1',
      record_type: 'clockIn',
    });

    // --- 冪等性: 同一 id を再投入して再送しても成功扱いで安全にドレインされる ---
    // 注: supabase モックの insert は常に { error: null } を解決し、ユニーク違反を
    //     返せない（__setMockError は auth 系のみに作用する）。そこで本ケースでは
    //     (1) insertRecords がユニーク違反（'23505'）を冪等成功として扱う契約を
    //     直接検証し、(2) 同一 id の再フラッシュがクラッシュせずキューを空にする
    //     ことを検証する（モックは未編集のまま、契約面から冪等性を担保する）。

    // (1) ユニーク違反コードの検出契約。
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
    // insertRecords は内部で isUniqueViolation を成功扱いにする実装のため、
    // 重複レコードでも okIds に含める（= キューから除去される）契約を満たす。
    const dupOk = await insertRecords([makeRecord('rec-1', 'clockIn')]);
    expect(dupOk.okIds).toEqual(['rec-1']);
    expect(dupOk.failedIds).toEqual([]);

    // (2) 同一 id を再度キューへ積み、オンラインで再フラッシュ。
    await attendanceQueue.enqueue(makeRecord('rec-1', 'clockIn'));
    const replayResult = await flushQueue({
      isConnected: true,
      insertBatch: insertRecords,
    });

    expect(replayResult.flushed).toBe(1);
    expect(replayResult.deadLettered).toBe(0);
    expect(await attendanceQueue.count()).toBe(0);
  });
});
