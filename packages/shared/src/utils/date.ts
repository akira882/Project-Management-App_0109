/**
 * Date utility functions
 */

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
  return `${Math.floor(diffDays / 365)}年前`;
};

export const isOverdue = (dueDate: Date | string | null | undefined): boolean => {
  if (!dueDate) return false;
  const d = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  return d < new Date();
};

export const getDaysUntil = (date: Date | string): number => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Returns the JST calendar date as "YYYY-MM-DD" regardless of server timezone.
 * Used as the attendance work-day key so early-morning punches never slip
 * to the previous day (UTC date-boundary bug).
 */
export const getJstDateString = (date: Date = new Date()): string => {
  return new Date(date.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
};

/**
 * Returns the JST month as "YYYY-MM".
 */
export const getJstMonthString = (date: Date = new Date()): string => {
  return getJstDateString(date).slice(0, 7);
};

/**
 * Formats minutes as a Japanese duration, e.g. 485 -> "8時間5分".
 */
export const formatWorkDuration = (minutes: number): string => {
  const m = Math.max(0, Math.round(minutes));
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  if (hours === 0) return `${mins}分`;
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
};
