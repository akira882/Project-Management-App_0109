import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { resolveUserId } from '@/lib/default-user';
import {
  ClockOutSchema,
  AttendanceStatus,
  getJstDateString,
} from '@project-management/shared';

// POST /api/attendance/clock-out - 退勤打刻
// Closes today's open record. Work minutes are computed server-side so the
// stored hours are always consistent: (clockOut - clockIn) - breaks.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = ClockOutSchema.parse(body);

    const userId = await resolveUserId(input.userId);
    const now = new Date();
    const workDate = getJstDateString(now);

    const record = await prisma.attendanceRecord.findUnique({
      where: { userId_workDate: { userId, workDate } },
    });

    if (!record) {
      return errorResponse('本日の出勤記録がありません', 'NOT_CLOCKED_IN', 409);
    }
    if (record.status === AttendanceStatus.COMPLETED) {
      return errorResponse('本日はすでに退勤済みです', 'ALREADY_CLOCKED_OUT', 409);
    }

    // Forgiving UX for the field: if the worker forgot to end their break,
    // close it automatically at clock-out instead of blocking them.
    let breakMinutes = record.breakMinutes;
    if (record.status === AttendanceStatus.ON_BREAK && record.breakStartAt) {
      breakMinutes += Math.round(
        (now.getTime() - record.breakStartAt.getTime()) / 60000
      );
    }

    const grossMinutes = Math.round(
      (now.getTime() - record.clockInAt.getTime()) / 60000
    );
    const workMinutes = Math.max(0, grossMinutes - breakMinutes);

    const updated = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        clockOutAt: now,
        breakStartAt: null,
        breakMinutes,
        workMinutes,
        status: AttendanceStatus.COMPLETED,
        note: input.note ?? record.note,
        clockOutLat: input.lat,
        clockOutLng: input.lng,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
