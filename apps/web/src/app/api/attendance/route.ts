import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, validationErrorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { resolveUserId } from '@/lib/default-user';
import {
  AttendanceMonthSchema,
  AttendanceStatus,
  getJstMonthString,
} from '@project-management/shared';

// GET /api/attendance?month=YYYY-MM - 月次の勤怠一覧とサマリー
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || getJstMonthString();

    const monthResult = AttendanceMonthSchema.safeParse(month);
    if (!monthResult.success) {
      return validationErrorResponse('month は YYYY-MM 形式で指定してください');
    }

    const userId = await resolveUserId(searchParams.get('userId'));

    const records = await prisma.attendanceRecord.findMany({
      where: {
        userId,
        workDate: { startsWith: month },
      },
      orderBy: { workDate: 'desc' },
    });

    const summary = {
      month,
      daysWorked: records.length,
      totalWorkMinutes: records.reduce((sum, r) => sum + (r.workMinutes ?? 0), 0),
      totalBreakMinutes: records.reduce(
        (sum, r) =>
          r.status === AttendanceStatus.COMPLETED ? sum + r.breakMinutes : sum,
        0
      ),
    };

    return successResponse({ records, summary });
  } catch (error) {
    return handleApiError(error);
  }
}
