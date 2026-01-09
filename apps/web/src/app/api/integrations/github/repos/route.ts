import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { GitHubService } from '@/lib/integrations/github';

// GET /api/integrations/github/repos - Get user's GitHub repositories
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const githubToken = request.headers.get('x-github-token');

    if (!githubToken) {
      return errorResponse('GitHub access token required', 'MISSING_TOKEN', 401);
    }

    const githubService = new GitHubService(githubToken);
    const repos = await githubService.getRepos();

    return successResponse(repos);
  } catch (error) {
    return handleApiError(error);
  }
}
