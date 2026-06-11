import apiClient from './client';
import type {
  AttendanceListResult,
  AttendanceRecord,
  ClockInInput,
  ClockOutInput,
} from '@project-management/shared';

/**
 * 勤怠APIサービス
 * 打刻はサーバーが唯一の真実（時刻・実働計算はすべてサーバー側）
 */
export class AttendanceApi {
  /**
   * 今日の勤怠状況を取得（未出勤なら null）
   */
  static async getToday(): Promise<AttendanceRecord | null> {
    return apiClient.get('/api/attendance/today');
  }

  /**
   * 月次の勤怠一覧とサマリーを取得
   * @param month "YYYY-MM"
   */
  static async getMonth(month: string): Promise<AttendanceListResult> {
    return apiClient.get(`/api/attendance?month=${month}`);
  }

  /**
   * 出勤打刻
   */
  static async clockIn(input?: ClockInInput): Promise<AttendanceRecord> {
    return apiClient.post('/api/attendance/clock-in', input ?? {});
  }

  /**
   * 退勤打刻
   */
  static async clockOut(input?: ClockOutInput): Promise<AttendanceRecord> {
    return apiClient.post('/api/attendance/clock-out', input ?? {});
  }

  /**
   * 休憩開始
   */
  static async startBreak(): Promise<AttendanceRecord> {
    return apiClient.post('/api/attendance/break/start', {});
  }

  /**
   * 休憩終了
   */
  static async endBreak(): Promise<AttendanceRecord> {
    return apiClient.post('/api/attendance/break/end', {});
  }
}

export default AttendanceApi;
