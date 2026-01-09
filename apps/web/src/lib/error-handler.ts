import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { errorResponse, validationErrorResponse } from './api-response';
import { NextResponse } from 'next/server';

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return validationErrorResponse('Validation failed', error.errors);
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return validationErrorResponse('A record with this unique field already exists');
      case 'P2025':
        return errorResponse('Record not found', 'NOT_FOUND', 404);
      case 'P2003':
        return validationErrorResponse('Invalid foreign key reference');
      default:
        return errorResponse('Database error occurred', 'DATABASE_ERROR', 500);
    }
  }

  // Standard errors
  if (error instanceof Error) {
    return errorResponse(error.message, 'INTERNAL_ERROR', 500);
  }

  return errorResponse('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}
