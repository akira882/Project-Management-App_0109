import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { GitHubService } from '@/lib/integrations/github';
import { extractGitHubRepoInfo } from '@project-management/shared';

// GET /api/integrations/github/issues - Get issues from a GitHub repository
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const repoUrl = searchParams.get('repoUrl');
    const githubToken = request.headers.get('x-github-token');

    if (!githubToken) {
      return errorResponse('GitHub access token required', 'MISSING_TOKEN', 401);
    }

    if (!repoUrl) {
      return validationErrorResponse('Repository URL is required');
    }

    const repoInfo = extractGitHubRepoInfo(repoUrl);
    if (!repoInfo) {
      return validationErrorResponse('Invalid GitHub repository URL');
    }

    const githubService = new GitHubService(githubToken);
    const issues = await githubService.getIssues(repoInfo.owner, repoInfo.repo);

    return successResponse(issues);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/integrations/github/issues - Create a GitHub issue from a task
export async function POST(request: NextRequest) {
  try {
    const githubToken = request.headers.get('x-github-token');
    const body = await request.json();

    if (!githubToken) {
      return errorResponse('GitHub access token required', 'MISSING_TOKEN', 401);
    }

    const { repoUrl, title, description } = body;

    if (!repoUrl || !title) {
      return validationErrorResponse('Repository URL and title are required');
    }

    const repoInfo = extractGitHubRepoInfo(repoUrl);
    if (!repoInfo) {
      return validationErrorResponse('Invalid GitHub repository URL');
    }

    const githubService = new GitHubService(githubToken);
    const issue = await githubService.createIssue(repoInfo.owner, repoInfo.repo, {
      title,
      body: description,
    });

    return successResponse(issue);
  } catch (error) {
    return handleApiError(error);
  }
}
