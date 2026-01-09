import { z } from 'zod';

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

// Filter Types
export interface ProjectFilters {
  status?: string[];
  priority?: string[];
  userId?: string;
  search?: string;
}

export interface TaskFilters {
  status?: string[];
  priority?: string[];
  projectId?: string;
  assigneeId?: string;
  tags?: string[];
  search?: string;
}
