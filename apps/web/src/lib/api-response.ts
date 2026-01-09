import { NextResponse } from 'next/server';
import type { ApiResponse } from '@project-management/shared';

export function successResponse<T>(data: T, meta?: ApiResponse['meta']): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    meta,
  } as ApiResponse<T>);
}

export function errorResponse(
  message: string,
  code: string = 'INTERNAL_ERROR',
  status: number = 500,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details,
      },
    } as ApiResponse,
    { status }
  );
}

export function validationErrorResponse(message: string, details?: unknown): NextResponse {
  return errorResponse(message, 'VALIDATION_ERROR', 400, details);
}

export function notFoundResponse(resource: string = 'Resource'): NextResponse {
  return errorResponse(`${resource} not found`, 'NOT_FOUND', 404);
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return errorResponse(message, 'UNAUTHORIZED', 401);
}
