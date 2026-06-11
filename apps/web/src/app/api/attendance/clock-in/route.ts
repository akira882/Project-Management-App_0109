import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { resolveUserId } from '@/lib/default-user';
import {
  ClockInSchema,
  AttendanceStatus,
  getJstDateString,
} from '@project-management/shared';

// POST /api/attendance/clock-in - 出勤打刻
// Creates today's attendance record (one record per user per JST work day).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = ClockInSchema.parse(body);

    const userId = await resolveUserId(input.userId);
    const now = new Date();
    const workDate = getJstDateString(now);

    // Reject double clock-in: attendance data must stay trustworthy.
    const existing = await prisma.attendanceRecord.findUnique({
      where: { userId_workDate: { userId, workDate } },
    });
    if (existing) {
      const message =
        existing.status === AttendanceStatus.COMPLETED
          ? '本日はすでに退勤済みです'
          : '本日はすでに出勤しています';
      return errorResponse(message, 'ALREADY_CLOCKED_IN', 409);
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        userId,
        workDate,
        clockInAt: now,
        status: AttendanceStatus.WORKING,
        note: input.note,
        clockInLat: input.lat,
        clockInLng: input.lng,
      },
    });

    return successResponse(record);
  } catch (error) {
    return handleApiError(error);
  }
}
