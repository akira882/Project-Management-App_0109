import { kvStore } from '@/services/storage/kvStore';
import type { AttendanceRecord, QueuedRecord } from '@/types/attendance';
import { nowIso } from '@/utils/datetime';

/**
 * 永続オフラインキュー（FIFO 寄り）。kvStore（ネイティブ: MMKV / Web: AsyncStorage）に保存する。
 *
 * ストレージ構造:
 * - `queue:index`     … キュー内 id の配列（JSON string[]）。
 * - `queue:item:<id>` … 個々の QueuedRecord（JSON）。
 *
 * 壊れた / 欠損した JSON は空として安全に扱い、同期処理が落ちないようにする。
 */

const INDEX_KEY = 'queue:index';
const itemKey = (id: string): string => `queue:item:${id}`;

/** index（id 配列）を読み込む。破損・欠損時は空配列。 */
async function readIndex(): Promise<string[]> {
  const raw = await kvStore.getString(INDEX_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

/** index（id 配列）を書き込む。 */
async function writeIndex(ids: string[]): Promise<void> {
  await kvStore.setString(INDEX_KEY, JSON.stringify(ids));
}

/** 単一アイテムを読み込む。破損・欠損時は null。 */
async function readItem(id: string): Promise<QueuedRecord | null> {
  const raw = await kvStore.getString(itemKey(id));
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as QueuedRecord;
  } catch {
    return null;
  }
}

/** 単一アイテムを書き込む。 */
async function writeItem(item: QueuedRecord): Promise<void> {
  await kvStore.setString(itemKey(item.id), JSON.stringify(item));
}

/**
 * レコードをキューに追加する。attempts:0 / enqueuedAt:現在時刻 を付与し、
 * アイテムを書き込んだ後に index 末尾へ id を追加する。
 */
export async function enqueue(record: AttendanceRecord): Promise<QueuedRecord> {
  const queued: QueuedRecord = {
    ...record,
    attempts: 0,
    enqueuedAt: nowIso(),
  };

  await writeItem(queued);

  const ids = await readIndex();
  if (!ids.includes(queued.id)) {
    ids.push(queued.id);
    await writeIndex(ids);
  }

  return queued;
}

/**
 * キュー内の全アイテムを recordedAt 昇順で返す。
 * index に存在するが本体が欠損している id は除外する。
 */
export async function list(): Promise<QueuedRecord[]> {
  const ids = await readIndex();
  const items: QueuedRecord[] = [];

  for (const id of ids) {
    const item = await readItem(id);
    if (item) {
      items.push(item);
    }
  }

  return items.sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
}

/** 指定 id のアイテムを削除し、index からも取り除く。 */
export async function remove(id: string): Promise<void> {
  await kvStore.delete(itemKey(id));

  const ids = await readIndex();
  const next = ids.filter((existing) => existing !== id);
  if (next.length !== ids.length) {
    await writeIndex(next);
  }
}

/** 指定 id の送信試行回数を 1 増やす。アイテムが無ければ何もしない。 */
export async function incrementAttempts(id: string): Promise<void> {
  const item = await readItem(id);
  if (!item) {
    return;
  }
  await writeItem({ ...item, attempts: item.attempts + 1 });
}

/** キュー内のアイテム数を返す。 */
export async function count(): Promise<number> {
  const ids = await readIndex();
  return ids.length;
}

/** キューを全消去する（全アイテム本体と index）。 */
export async function clear(): Promise<void> {
  const ids = await readIndex();
  for (const id of ids) {
    await kvStore.delete(itemKey(id));
  }
  await kvStore.delete(INDEX_KEY);
}

export const attendanceQueue = {
  enqueue,
  list,
  remove,
  incrementAttempts,
  count,
  clear,
};
