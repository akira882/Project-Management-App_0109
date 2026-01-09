import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, validationErrorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { CreateProjectSchema, PaginationSchema } from '@project-management/shared';

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
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
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          tasks: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.project.count({ where }),
    ]);

    return successResponse(projects, {
      page,
      limit,
      total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = CreateProjectSchema.parse({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    });

    const project = await prisma.project.create({
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return successResponse(project);
  } catch (error) {
    return handleApiError(error);
  }
}
