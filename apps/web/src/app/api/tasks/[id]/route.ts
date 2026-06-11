import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { UpdateTaskSchema } from '@project-management/shared';

// GET /api/tasks/[id] - Get a task by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
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
    });

    if (!task) {
      return notFoundResponse('Task');
    }

    return successResponse(task);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = UpdateTaskSchema.parse({
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    });

    const task = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        tags: validatedData.tags?.join(','),
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

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Task deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
