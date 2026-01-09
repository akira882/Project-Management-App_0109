import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, validationErrorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { CreateTaskSchema, PaginationSchema } from '@project-management/shared';

// GET /api/tasks - Get all tasks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const search = searchParams.get('search');

    // Validate pagination
    const paginationResult = PaginationSchema.safeParse({ page, limit });
    if (!paginationResult.success) {
      return validationErrorResponse('Invalid pagination parameters');
    }

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    return successResponse(tasks, {
      page,
      limit,
      total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = CreateTaskSchema.parse({
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      tags: body.tags || [],
    });

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        tags: validatedData.tags?.join(',') || '',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return successResponse(task);
  } catch (error) {
    return handleApiError(error);
  }
}
