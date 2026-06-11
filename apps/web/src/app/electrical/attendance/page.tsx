'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AttendanceRecord {
  id: string;
  workDate: string;
  clockInAt: string;
  clockOutAt: string | null;
  breakMinutes: number;
  workMinutes: number | null;
  status: string;
}

interface AttendanceSummary {
  month: string;
  daysWorked: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
}

const formatDuration = (minutes: number): string => {
  const m = Math.max(0, Math.round(minutes));
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  if (hours === 0) return `${mins}分`;
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
};

const formatTime = (date: string | null): string => {
  if (!date) return '--:--';
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDayLabel = (workDate: string): string => {
  const d = new Date(`${workDate}T00:00:00+09:00`);
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}（${weekday}）`;
};

async function postPunch(path: string): Promise<AttendanceRecord> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'エラーが発生しました');
  }
  return json.data;
}

export default function AttendancePage() {
  const queryClient = useQueryClient();

  // 大時計（1秒更新）
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: todayData } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const response = await fetch('/api/attendance/today');
      return response.json();
    },
  });

  const { data: monthData } = useQuery({
    queryKey: ['attendance', 'month'],
    queryFn: async () => {
      const response = await fetch('/api/attendance');
      return response.json();
    },
  });

  const record: AttendanceRecord | null = todayData?.data ?? null;
  const records: AttendanceRecord[] = monthData?.data?.records ?? [];
  const summary: AttendanceSummary | undefined = monthData?.data?.summary;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
  };

  const makePunchMutation = (path: string, successMessage: string) => ({
    mutationFn: () => postPunch(path),
    onSuccess: () => {
      invalidate();
      alert(successMessage);
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const clockIn = useMutation(
    makePunchMutation('/api/attendance/clock-in', '✅ 出勤を記録しました')
  );
  const clockOut = useMutation(
    makePunchMutation('/api/attendance/clock-out', '✅ 退勤を記録しました。お疲れさまでした！')
  );
  const startBreak = useMutation(
    makePunchMutation('/api/attendance/break/start', '☕ 休憩を開始しました')
  );
  const endBreak = useMutation(
    makePunchMutation('/api/attendance/break/end', '💪 休憩を終了しました')
  );

  const status = !record ? 'NOT_CLOCKED_IN' : record.status;
  const isPending =
    clockIn.isPending || clockOut.isPending || startBreak.isPending || endBreak.isPending;

  const statusLabel: Record<string, string> = {
    NOT_CLOCKED_IN: '🌅 出勤前',
    WORKING: '🔧 勤務中',
    ON_BREAK: '☕ 休憩中',
    COMPLETED: '🌇 退勤済み',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* ヘッダー */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link href="/electrical" className="text-xl opacity-90 hover:opacity-100">
            ← 戻る
          </Link>
          <h1 className="text-5xl font-bold mt-3">⏰ 勤怠打刻</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 大時計 */}
        <div className="text-center mb-8">
          <div className="text-2xl text-gray-600 font-semibold">
            {now?.toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            }) ?? ''}
          </div>
          <div className="text-7xl font-bold text-gray-800 tabular-nums">
            {now?.toLocaleTimeString('ja-JP') ?? '--:--:--'}
          </div>
          <div className="mt-4 inline-block px-8 py-3 bg-white rounded-2xl border-4 border-blue-300 text-3xl font-bold">
            {statusLabel[status]}
          </div>
        </div>

        {/* 打刻ボタン */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {status === 'NOT_CLOCKED_IN' && (
            <button
              onClick={() => clockIn.mutate()}
              disabled={isPending}
              className="md:col-span-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-xl p-10 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50"
            >
              <div className="text-6xl mb-4">🌅</div>
              <div className="text-4xl font-bold">出勤する</div>
            </button>
          )}

          {status === 'WORKING' && (
            <>
              <button
                onClick={() => clockOut.mutate()}
                disabled={isPending}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl shadow-xl p-10 hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <div className="text-6xl mb-4">🌇</div>
                <div className="text-4xl font-bold">退勤する</div>
              </button>
              <button
                onClick={() => startBreak.mutate()}
                disabled={isPending}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-2xl shadow-xl p-10 hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <div className="text-6xl mb-4">☕</div>
                <div className="text-4xl font-bold">休憩に入る</div>
              </button>
            </>
          )}

          {status === 'ON_BREAK' && (
            <>
              <button
                onClick={() => endBreak.mutate()}
                disabled={isPending}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl p-10 hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <div className="text-6xl mb-4">💪</div>
                <div className="text-4xl font-bold">休憩を終わる</div>
              </button>
              <button
                onClick={() => clockOut.mutate()}
                disabled={isPending}
                className="bg-white border-4 border-red-500 text-red-500 rounded-2xl shadow-xl p-10 hover:bg-red-50 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                <div className="text-6xl mb-4">🌇</div>
                <div className="text-4xl font-bold">そのまま退勤</div>
              </button>
            </>
          )}

          {status === 'COMPLETED' && (
            <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-10 text-center border-4 border-green-300">
              <div className="text-6xl mb-4">🎉</div>
              <div className="text-3xl font-bold text-gray-800">
                本日もお疲れさまでした！
              </div>
            </div>
          )}
        </div>

        {/* 今日の記録 */}
        {record && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📋 今日の記録</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-xl text-gray-500 mb-2">出勤</div>
                <div className="text-3xl font-bold">{formatTime(record.clockInAt)}</div>
              </div>
              <div>
                <div className="text-xl text-gray-500 mb-2">退勤</div>
                <div className="text-3xl font-bold">{formatTime(record.clockOutAt)}</div>
              </div>
              <div>
                <div className="text-xl text-gray-500 mb-2">休憩</div>
                <div className="text-3xl font-bold">
                  {formatDuration(record.breakMinutes)}
                </div>
              </div>
              <div>
                <div className="text-xl text-gray-500 mb-2">実働</div>
                <div className="text-3xl font-bold text-green-600">
                  {record.workMinutes != null ? formatDuration(record.workMinutes) : '--'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 今月のまとめ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            📅 今月のまとめ{summary ? `（出勤 ${summary.daysWorked}日 / 合計実働 ${formatDuration(summary.totalWorkMinutes)}）` : ''}
          </h2>

          {records.length === 0 ? (
            <p className="text-2xl text-gray-500 text-center py-8">
              まだ記録がありません
            </p>
          ) : (
            <div className="divide-y-2 divide-gray-100">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-4 text-2xl"
                >
                  <span className="font-bold text-gray-700 w-32">
                    {formatDayLabel(r.workDate)}
                  </span>
                  <span className="text-gray-600">
                    🌅 {formatTime(r.clockInAt)} → 🌇 {formatTime(r.clockOutAt)}
                  </span>
                  <span className="font-bold text-green-600">
                    {r.status === 'COMPLETED'
                      ? formatDuration(r.workMinutes ?? 0)
                      : '勤務中'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
