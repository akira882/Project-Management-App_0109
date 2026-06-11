import { z } from 'zod';

// Attendance Status Enum (TS-side; DB stores plain String for SQLite)
export enum AttendanceStatus {
  WORKING = 'WORKING',
  ON_BREAK = 'ON_BREAK',
  COMPLETED = 'COMPLETED',
}

// Zod Schemas for validation
export const AttendanceRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'workDate must be YYYY-MM-DD'),
  clockInAt: z.date(),
  clockOutAt: z.date().optional().nullable(),
  breakStartAt: z.date().optional().nullable(),
  breakMinutes: z.number().int().min(0),
  workMinutes: z.number().int().min(0).optional().nullable(),
  status: z.nativeEnum(AttendanceStatus),
  note: z.string().max(1000).optional().nullable(),
  clockInLat: z.number().optional().nullable(),
  clockInLng: z.number().optional().nullable(),
  clockOutLat: z.number().optional().nullable(),
  clockOutLng: z.number().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Punch payloads: userId is optional — the API falls back to the default
// field worker (no auth in v1). Location is optional GPS evidence.
export const ClockInSchema = z.object({
  userId: z.string().optional(),
  note: z.string().max(1000).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const ClockOutSchema = z.object({
  userId: z.string().optional(),
  note: z.string().max(1000).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const BreakSchema = z.object({
  userId: z.string().optional(),
});

export const AttendanceMonthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM');

// TypeScript Types
export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;
export type ClockInInput = z.infer<typeof ClockInSchema>;
export type ClockOutInput = z.infer<typeof ClockOutSchema>;
export type BreakInput = z.infer<typeof BreakSchema>;

// Monthly summary returned by GET /api/attendance
export interface AttendanceSummary {
  month: string; // YYYY-MM
  daysWorked: number;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
}

export interface AttendanceListResult {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}
