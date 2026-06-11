import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { resolveUserId } from '@/lib/default-user';
import {
  BreakSchema,
  AttendanceStatus,
  getJstDateString,
} from '@project-management/shared';

// POST /api/attendance/break/end - 休憩終了
// Accumulates elapsed break time into breakMinutes and resumes work.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = BreakSchema.parse(body);

    const userId = await resolveUserId(input.userId);
    const now = new Date();
    const workDate = getJstDateString(now);

    const record = await prisma.attendanceRecord.findUnique({
      where: { userId_workDate: { userId, workDate } },
    });

    if (!record) {
      return errorResponse('本日の出勤記録がありません', 'NOT_CLOCKED_IN', 409);
    }
    if (record.status !== AttendanceStatus.ON_BREAK || !record.breakStartAt) {
      return errorResponse('休憩中ではありません', 'NOT_ON_BREAK', 409);
    }

    const elapsed = Math.round(
      (now.getTime() - record.breakStartAt.getTime()) / 60000
    );

    const updated = await prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        breakStartAt: null,
        breakMinutes: record.breakMinutes + elapsed,
        status: AttendanceStatus.WORKING,
      },
    });

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
