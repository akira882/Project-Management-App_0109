import type { AttendanceRecord } from '@/types/attendance';

/**
 * 勤務時間計算（純粋関数・単体テスト対象）。
 *
 * 設計方針:
 * - 入力レコードは順不同を許容し、recordedAt 昇順にソートしてから処理する。
 * - 勤務区間は「最初の clockIn」と「最後の clockOut」で閉区間を作る。
 * - 休憩は breakStart を直後の breakEnd と対にして合算する（未対応の breakStart は無視）。
 * - 未退勤（clockOut が無い）の場合は閉区間を作れないため 0 扱いとする（未退勤は0扱い）。
 * - 日跨ぎ（例: 22:00 出勤 → 翌 06:00 退勤）は recordedAt の絶対時刻差で計算するため正しく扱える。
 * - 負値はガードして 0 に丸める。
 */

const MS_PER_MINUTE = 60_000;

/** recordedAt 昇順にソートしたコピーを返す。 */
function sortByRecordedAt(records: AttendanceRecord[]): AttendanceRecord[] {
  return [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
}

/** 2 つの ISO 時刻の差（分・切り捨て無しの単純差）。負値は 0。 */
function diffMinutes(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return ms > 0 ? ms / MS_PER_MINUTE : 0;
}

/**
 * ソート済みレコードから休憩合計（分）を算出する。
 * breakStart を直後の breakEnd と対にして合算し、未対応の breakStart / breakEnd は無視する。
 */
function calcBreakMinutes(sorted: AttendanceRecord[]): number {
  let total = 0;
  let openBreakAt: string | null = null;

  for (const r of sorted) {
    if (r.recordType === 'breakStart') {
      // 連続した breakStart は最新のものを採用（直前の未対応 start は破棄）。
      openBreakAt = r.recordedAt;
    } else if (r.recordType === 'breakEnd') {
      if (openBreakAt !== null) {
        total += diffMinutes(openBreakAt, r.recordedAt);
        openBreakAt = null;
      }
      // 対応する breakStart が無い breakEnd は無視。
    }
  }

  return total;
}

/**
 * 当日のレコード群から実働分を算出する。
 * 実働 = (最後の clockOut - 最初の clockIn) - 休憩合計。
 * 閉区間を作れない場合は 0、負値は 0 にガードする。
 */
export function calcWorkMinutes(records: AttendanceRecord[]): number {
  const sorted = sortByRecordedAt(records);

  const clockIn = sorted.find((r) => r.recordType === 'clockIn');
  const clockOut = [...sorted].reverse().find((r) => r.recordType === 'clockOut');

  // 出勤・退勤のいずれかが欠ける場合は閉区間を作れないため 0 扱い（未退勤は0扱い）。
  if (!clockIn || !clockOut) {
    return 0;
  }

  const grossMinutes = diffMinutes(clockIn.recordedAt, clockOut.recordedAt);
  const breakMinutes = calcBreakMinutes(sorted);
  const net = grossMinutes - breakMinutes;

  return net > 0 ? Math.round(net) : 0;
}

/**
 * 当日サマリ。打刻時刻・休憩分・実働分をまとめて返す。
 * clockIn / clockOut は該当が無ければ null。
 */
export function summarizeDay(records: AttendanceRecord[]): {
  clockIn: string | null;
  clockOut: string | null;
  breakMinutes: number;
  workMinutes: number;
} {
  const sorted = sortByRecordedAt(records);

  const clockInRecord = sorted.find((r) => r.recordType === 'clockIn') ?? null;
  const clockOutRecord =
    [...sorted].reverse().find((r) => r.recordType === 'clockOut') ?? null;

  return {
    clockIn: clockInRecord?.recordedAt ?? null,
    clockOut: clockOutRecord?.recordedAt ?? null,
    breakMinutes: Math.round(calcBreakMinutes(sorted)),
    workMinutes: calcWorkMinutes(records),
  };
}
