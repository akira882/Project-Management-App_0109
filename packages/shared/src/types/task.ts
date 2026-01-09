import { z } from 'zod';

// Task Status Enum
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
}

// Task Priority Enum
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Zod Schemas for validation
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.date().optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  actualHours: z.number().min(0).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  projectId: z.string().uuid(),
  assigneeId: z.string().optional().nullable(),
  githubIssueNumber: z.number().optional().nullable(),
  githubIssueUrl: z.string().url().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

// TypeScript Types
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
