import type { AttendanceRecord, RecordType } from '@/types/attendance';
import { calcWorkMinutes, summarizeDay } from '@/utils/workTime';

/**
 * 勤務時間計算（純粋関数）の単体テスト。
 * 正常日 / 複数休憩 / 未退勤 / 順不同入力 / 日跨ぎ / 負値ガード を検証する。
 */

/** テスト用レコード生成ヘルパー。 */
function rec(recordType: RecordType, recordedAt: string): AttendanceRecord {
  return {
    id: `${recordType}-${recordedAt}`,
    userId: 'user-1',
    recordType,
    recordedAt,
    location: null,
    note: null,
  };
}

describe('calcWorkMinutes', () => {
  it('正常日: 09:00 出勤 / 18:00 退勤 / 12:00-13:00 休憩 = 480 分', () => {
    const records = [
      rec('clockIn', '2026-06-08T09:00:00.000Z'),
      rec('breakStart', '2026-06-08T12:00:00.000Z'),
      rec('breakEnd', '2026-06-08T13:00:00.000Z'),
      rec('clockOut', '2026-06-08T18:00:00.000Z'),
    ];
    expect(calcWorkMinutes(records)).toBe(480);
  });

  it('複数休憩: 休憩を合算して差し引く（9h 勤務 - 90 分休憩 = 450 分）', () => {
    const records = [
      rec('clockIn', '2026-06-08T09:00:00.000Z'),
      rec('breakStart', '2026-06-08T12:00:00.000Z'),
      rec('breakEnd', '2026-06-08T13:00:00.000Z'), // 60 分
      rec('breakStart', '2026-06-08T15:00:00.000Z'),
      rec('breakEnd', '2026-06-08T15:30:00.000Z'), // 30 分
      rec('clockOut', '2026-06-08T18:00:00.000Z'),
    ];
    expect(calcWorkMinutes(records)).toBe(450);
  });

  it('未退勤（clockOut 無し）は 0 扱い', () => {
    const records = [
      rec('clockIn', '2026-06-08T09:00:00.000Z'),
      rec('breakStart', '2026-06-08T12:00:00.000Z'),
      rec('breakEnd', '2026-06-08T13:00:00.000Z'),
    ];
    expect(calcWorkMinutes(records)).toBe(0);
  });

  it('clockIn が無い場合も 0 扱い', () => {
    const records = [rec('clockOut', '2026-06-08T18:00:00.000Z')];
    expect(calcWorkMinutes(records)).toBe(0);
  });

  it('順不同の入力でも recordedAt 昇順に解釈して計算する', () => {
    const records = [
      rec('clockOut', '2026-06-08T18:00:00.000Z'),
      rec('breakEnd', '2026-06-08T13:00:00.000Z'),
      rec('clockIn', '2026-06-08T09:00:00.000Z'),
      rec('breakStart', '2026-06-08T12:00:00.000Z'),
    ];
    expect(calcWorkMinutes(records)).toBe(480);
  });

  it('日跨ぎ: 22:00 出勤 → 翌 06:00 退勤 = 480 分', () => {
    const records = [
      rec('clockIn', '2026-06-08T22:00:00.000Z'),
      rec('clockOut', '2026-06-09T06:00:00.000Z'),
    ];
    expect(calcWorkMinutes(records)).toBe(480);
  });

  it('負値ガード: 退勤が出勤より前でも 0 を返す', () => {
    const records = [
      rec('clockIn', '2026-06-08T18:00:00.000Z'),
      rec('clockOut', '2026-06-08T09:00:00.000Z'),
    ];
    expect(calcWorkMinutes(records)).toBe(0);
  });

  it('休憩が勤務時間を超過しても 0 にガードする', () => {
    const records = [
      rec('clockIn', '2026-06-08T09:00:00.000Z'),
      rec('breakStart', '2026-06-08T09:30:00.000Z'),
      rec('breakEnd', '2026-06-08T20:00:00.000Z'),
      rec('clockOut', '2026-06-08T10:00:00.000Z'),
    ];
    expect(calcWorkMinutes(records)).toBe(0);
  });

  it('空配列は 0 を返す', () => {
    expect(calcWorkMinutes([])).toBe(0);
  });
});

describe('summarizeDay', () => {
  it('打刻時刻・休憩分・実働分をまとめて返す', () => {
    const records = [
      rec('clockIn', '2026-06-08T09:00:00.000Z'),
      rec('breakStart', '2026-06-08T12:00:00.000Z'),
      rec('breakEnd', '2026-06-08T13:00:00.000Z'),
      rec('clockOut', '2026-06-08T18:00:00.000Z'),
    ];
    expect(summarizeDay(records)).toEqual({
      clockIn: '2026-06-08T09:00:00.000Z',
      clockOut: '2026-06-08T18:00:00.000Z',
      breakMinutes: 60,
      workMinutes: 480,
    });
  });

  it('未退勤: clockOut は null、実働は 0', () => {
    const records = [rec('clockIn', '2026-06-08T09:00:00.000Z')];
    expect(summarizeDay(records)).toEqual({
      clockIn: '2026-06-08T09:00:00.000Z',
      clockOut: null,
      breakMinutes: 0,
      workMinutes: 0,
    });
  });

  it('空配列はすべて null / 0', () => {
    expect(summarizeDay([])).toEqual({
      clockIn: null,
      clockOut: null,
      breakMinutes: 0,
      workMinutes: 0,
    });
  });
});
