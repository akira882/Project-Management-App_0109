import { GitHubRepo, GitHubIssue } from '@project-management/shared';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${GITHUB_API_BASE}${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getRepos(): Promise<GitHubRepo[]> {
    return this.fetch<GitHubRepo[]>('/user/repos?sort=updated&per_page=100');
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    return this.fetch<GitHubRepo>(`/repos/${owner}/${repo}`);
  }

  async getIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    return this.fetch<GitHubIssue[]>(`/repos/${owner}/${repo}/issues?state=all&per_page=100`);
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<GitHubIssue> {
    return this.fetch<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  async createIssue(
    owner: string,
    repo: string,
    data: {
      title: string;
      body?: string;
      labels?: string[];
      assignees?: string[];
    }
  ): Promise<GitHubIssue> {
    return this.fetch<GitHubIssue>(`/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async updateIssue(
    owner: string,
    repo: string,
    issueNumber: number,
    data: {
      title?: string;
      body?: string;
      state?: 'open' | 'closed';
      labels?: string[];
    }
  ): Promise<GitHubIssue> {
    return this.fetch<GitHubIssue>(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  async syncTaskToIssue(
    owner: string,
    repo: string,
    task: {
      title: string;
      description?: string | null;
      status: string;
    }
  ): Promise<GitHubIssue> {
    const issueState = task.status === 'DONE' ? 'closed' : 'open';

    return this.createIssue(owner, repo, {
      title: task.title,
      body: task.description || undefined,
    });
  }
}
