import { z } from 'zod';

// Project Status Enum
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

// Project Priority Enum
export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

// Zod Schemas for validation
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.nativeEnum(ProjectStatus),
  priority: z.nativeEnum(ProjectPriority),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
  githubRepoUrl: z.string().url().optional().nullable(),
  slackChannelId: z.string().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

// userId is optional on create: the API falls back to the default field
// worker when no auth/user context is provided (no login in v1).
export const CreateProjectSchema = ProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userId: z.string().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// TypeScript Types
export type Project = z.infer<typeof ProjectSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
