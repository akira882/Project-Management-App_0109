/**
 * Application-wide constants
 */

export const APP_NAME = 'プロジェクト管理アプリ';
export const APP_DESCRIPTION = 'CRUD機能と外部連携を備えたプロフェッショナルなプロジェクト管理アプリケーション';

// API Configuration
export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Date Formats
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// GitHub API
export const GITHUB_API_BASE = 'https://api.github.com';
export const GITHUB_OAUTH_AUTHORIZE = 'https://github.com/login/oauth/authorize';
export const GITHUB_OAUTH_TOKEN = 'https://github.com/login/oauth/access_token';

// Slack API
export const SLACK_API_BASE = 'https://slack.com/api';
export const SLACK_OAUTH_AUTHORIZE = 'https://slack.com/oauth/v2/authorize';

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Status Colors
export const STATUS_COLORS = {
  TODO: '#6B7280',
  IN_PROGRESS: '#3B82F6',
  IN_REVIEW: '#F59E0B',
  DONE: '#10B981',
  BLOCKED: '#EF4444',
  PLANNING: '#8B5CF6',
  ON_HOLD: '#F59E0B',
  COMPLETED: '#10B981',
  ARCHIVED: '#6B7280',
} as const;

// Priority Colors
export const PRIORITY_COLORS = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B',
  HIGH: '#F97316',
  URGENT: '#EF4444',
} as const;
