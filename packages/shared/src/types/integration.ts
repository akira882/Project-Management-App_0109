import { z } from 'zod';

// Integration Types
export enum IntegrationType {
  GITHUB = 'GITHUB',
  SLACK = 'SLACK',
}

// GitHub Integration
export const GitHubIntegrationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  accessToken: z.string(),
  refreshToken: z.string().optional().nullable(),
  username: z.string(),
  avatarUrl: z.string().url().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GitHubIntegration = z.infer<typeof GitHubIntegrationSchema>;

// Slack Integration
export const SlackIntegrationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  accessToken: z.string(),
  teamId: z.string(),
  teamName: z.string(),
  webhookUrl: z.string().url().optional().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SlackIntegration = z.infer<typeof SlackIntegrationSchema>;

// GitHub API Response Types
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  labels: Array<{ name: string; color: string }>;
  assignee: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
}

// Slack API Types
export interface SlackMessage {
  channel: string;
  text: string;
  attachments?: Array<{
    color?: string;
    title?: string;
    text?: string;
    fields?: Array<{ title: string; value: string; short?: boolean }>;
  }>;
}
