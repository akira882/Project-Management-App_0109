import { NextRequest, NextResponse } from 'next/server';
import { GitHubService } from '@/lib/integrations/github';

/**
 * GET /api/integrations/github/repos
 * GitHubのリポジトリ一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // アクセストークンを環境変数またはヘッダーから取得
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
    const repos = await githubService.getRepos();

    return NextResponse.json({
      data: repos,
      message: 'Repositories fetched successfully',
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch repositories',
        },
      },
      { status: 500 }
    );
  }
}
