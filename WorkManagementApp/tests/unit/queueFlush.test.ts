import { attendanceQueue } from '@/services/queue/attendanceQueue';
import { flushQueue } from '@/services/queue/flush';
import type { AttendanceRecord, RecordType } from '@/types/attendance';

/**
 * オフラインキュー + フラッシュアルゴリズムの単体テスト。
 * kvStore は react-native-mmkv モック（ルート __mocks__/）経由でインメモリ動作する。
 * 各テスト前にキューを clear() してリセットする。
 */

/** テスト用レコード生成ヘルパー。 */
function rec(id: string, recordType: RecordType, recordedAt: string): AttendanceRecord {
  return {
    id,
    userId: 'user-1',
    recordType,
    recordedAt,
    location: null,
    note: null,
  };
}

beforeEach(async () => {
  await attendanceQueue.clear();
});

describe('attendanceQueue', () => {
  it('enqueue 後の list は recordedAt 昇順で返す', async () => {
    await attendanceQueue.enqueue(rec('c', 'clockOut', '2026-06-08T18:00:00.000Z'));
    await attendanceQueue.enqueue(rec('a', 'clockIn', '2026-06-08T09:00:00.000Z'));
    await attendanceQueue.enqueue(rec('b', 'breakStart', '2026-06-08T12:00:00.000Z'));

    const items = await attendanceQueue.list();
    expect(items.map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(items[0].attempts).toBe(0);
    expect(items[0].enqueuedAt).toEqual(expect.any(String));
    expect(await attendanceQueue.count()).toBe(3);
  });

  it('remove はアイテムと index の両方から取り除く', async () => {
    await attendanceQueue.enqueue(rec('a', 'clockIn', '2026-06-08T09:00:00.000Z'));
    await attendanceQueue.enqueue(rec('b', 'clockOut', '2026-06-08T18:00:00.000Z'));

    await attendanceQueue.remove('a');

    const items = await attendanceQueue.list();
    expect(items.map((i) => i.id)).toEqual(['b']);
    expect(await attendanceQueue.count()).toBe(1);
  });
});

describe('flushQueue', () => {
  it('未接続: skipped=true を返し insertBatch を呼ばず、キューは無変更', async () => {
    await attendanceQueue.enqueue(rec('a', 'clockIn', '2026-06-08T09:00:00.000Z'));
    const insertBatch = jest.fn();

    const result = await flushQueue({ isConnected: false, insertBatch });

    expect(result).toEqual({
      attempted: 0,
      flushed: 0,
      failed: 0,
      deadLettered: 0,
      skipped: true,
    });
    expect(insertBatch).not.toHaveBeenCalled();
    expect(await attendanceQueue.count()).toBe(1);
  });

  it('空キュー: attempted=0 で skipped=false', async () => {
    const insertBatch = jest.fn(async () => ({ okIds: [], failedIds: [] }));

    const result = await flushQueue({ isConnected: true, insertBatch });

    expect(result).toEqual({
      attempted: 0,
      flushed: 0,
      failed: 0,
      deadLettered: 0,
      skipped: false,
    });
    expect(insertBatch).not.toHaveBeenCalled();
  });

  it('接続済み: insertBatch は recordedAt 昇順のレコードを受け取り、okIds はキューから除去される', async () => {
    await attendanceQueue.enqueue(rec('c', 'clockOut', '2026-06-08T18:00:00.000Z'));
    await attendanceQueue.enqueue(rec('a', 'clockIn', '2026-06-08T09:00:00.000Z'));
    await attendanceQueue.enqueue(rec('b', 'breakStart', '2026-06-08T12:00:00.000Z'));

    const insertBatch = jest.fn(async (records: AttendanceRecord[]) => ({
      okIds: records.map((r) => r.id),
      failedIds: [],
    }));

    const result = await flushQueue({ isConnected: true, insertBatch });

    // 渡されたレコードは recordedAt 昇順であること。
    const passed = insertBatch.mock.calls[0][0] as AttendanceRecord[];
    expect(passed.map((r) => r.id)).toEqual(['a', 'b', 'c']);

    expect(result).toEqual({
      attempted: 3,
      flushed: 3,
      failed: 0,
      deadLettered: 0,
      skipped: false,
    });
    expect(await attendanceQueue.count()).toBe(0);
  });

  it('failedIds は試行回数を増やしつつキューに残り、maxAttempts 到達でデッドレター化する', async () => {
    await attendanceQueue.enqueue(rec('a', 'clockIn', '2026-06-08T09:00:00.000Z'));

    const insertBatch = jest.fn(async (records: AttendanceRecord[]) => ({
      okIds: [],
      failedIds: records.map((r) => r.id),
    }));

    // 1 回目: attempts 0 -> 1（< 2）。残置（failed）。
    const first = await flushQueue({ isConnected: true, insertBatch, maxAttempts: 2 });
    expect(first).toEqual({
      attempted: 1,
      flushed: 0,
      failed: 1,
      deadLettered: 0,
      skipped: false,
    });
    const afterFirst = await attendanceQueue.list();
    expect(afterFirst).toHaveLength(1);
    expect(afterFirst[0].attempts).toBe(1);

    // 2 回目: attempts 1 -> 2（>= 2）。デッドレター化して破棄。
    const second = await flushQueue({ isConnected: true, insertBatch, maxAttempts: 2 });
    expect(second).toEqual({
      attempted: 1,
      flushed: 0,
      failed: 0,
      deadLettered: 1,
      skipped: false,
    });
    expect(await attendanceQueue.count()).toBe(0);
  });

  it('PK 衝突を成功扱い（okIds に含む）したレコードはキューから除去される', async () => {
    await attendanceQueue.enqueue(rec('duplicate', 'clockIn', '2026-06-08T09:00:00.000Z'));
    await attendanceQueue.enqueue(rec('fresh', 'clockOut', '2026-06-08T18:00:00.000Z'));

    // 'duplicate' は一意制約違反（= 既受領）だが冪等として okIds に含める。
    const insertBatch = jest.fn(async () => ({
      okIds: ['duplicate', 'fresh'],
      failedIds: [],
    }));

    const result = await flushQueue({ isConnected: true, insertBatch });

    expect(result.flushed).toBe(2);
    expect(result.deadLettered).toBe(0);
    expect(await attendanceQueue.count()).toBe(0);
  });

  it('okIds と failedIds の混在を正しく集計する', async () => {
    await attendanceQueue.enqueue(rec('ok', 'clockIn', '2026-06-08T09:00:00.000Z'));
    await attendanceQueue.enqueue(rec('ng', 'clockOut', '2026-06-08T18:00:00.000Z'));

    const insertBatch = jest.fn(async () => ({
      okIds: ['ok'],
      failedIds: ['ng'],
    }));

    const result = await flushQueue({ isConnected: true, insertBatch, maxAttempts: 5 });

    expect(result).toEqual({
      attempted: 2,
      flushed: 1,
      failed: 1,
      deadLettered: 0,
      skipped: false,
    });

    const remaining = await attendanceQueue.list();
    expect(remaining.map((i) => i.id)).toEqual(['ng']);
    expect(remaining[0].attempts).toBe(1);
  });
});
