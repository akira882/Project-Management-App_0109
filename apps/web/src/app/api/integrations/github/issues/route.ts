import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/integrations/github';

/**
 * GET /api/integrations/github/issues?owner=xxx&repo=xxx
 * GitHubのIssue一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');

    if (!owner || !repo) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'owner and repo parameters are required',
          },
        },
        { status: 400 }
      );
    }

    const token =
      request.headers.get('x-github-token') || process.env.GITHUB_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'GitHub access token is required',
          },
        },
        { status: 401 }
      );
    }

    const githubService = new GitHubService(token);
    const issues = await githubService.getIssues(owner, repo);

    return NextResponse.json({
      data: issues,
      message: 'Issues fetched successfully',
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch issues',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/github/issues
 * GitHub Issueを作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, title, body: issueBody, labels, assignees } = body;

    if (!owner || !repo || !title) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'owner, repo, and title are required',
          },
        },
        { status: 400 }
      );
    }

    const token =
      request.headers.get('x-github-token') || process.env.GITHUB_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'GitHub access token is required',
          },
        },
        { status: 401 }
      );
    }

    const githubService = new GitHubService(token);
    const issue = await githubService.createIssue(owner, repo, {
      title,
      body: issueBody,
      labels,
      assignees,
    });

    return NextResponse.json({
      data: issue,
      message: 'Issue created successfully',
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to create issue',
        },
      },
      { status: 500 }
    );
  }
}
