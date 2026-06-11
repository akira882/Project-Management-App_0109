import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { resolveUserId } from '@/lib/default-user';
import { getJstDateString } from '@project-management/shared';

// GET /api/attendance/today - 今日の勤怠状況
// Returns today's record, or null when the user has not clocked in yet.
export async function GET(request: NextRequest) {
  try {
    const userId = await resolveUserId(request.nextUrl.searchParams.get('userId'));
    const workDate = getJstDateString();

    const record = await prisma.attendanceRecord.findUnique({
      where: { userId_workDate: { userId, workDate } },
    });

    return successResponse(record);
  } catch (error) {
    return handleApiError(error);
  }
}
