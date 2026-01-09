import { NextRequest, NextResponse } from 'next/server';
import { SlackService } from '@/lib/integrations/slack';

/**
 * POST /api/integrations/slack/project
 * プロジェクトに関するSlack通知を送信
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel, project, action } = body;

    if (!project || !action) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'project and action are required',
          },
        },
        { status: 400 }
      );
    }

    const validActions = ['created', 'updated', 'deleted'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'action must be one of: created, updated, deleted',
          },
        },
        { status: 400 }
      );
    }

    const token =
      request.headers.get('x-slack-token') || process.env.SLACK_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Slack access token is required',
          },
        },
        { status: 401 }
      );
    }

    const slackChannel = channel || process.env.SLACK_CHANNEL || '#general';

    const slackService = new SlackService(token);
    await slackService.sendProjectNotification(slackChannel, project, action);

    return NextResponse.json({
      message: 'Project notification sent successfully',
    });
  } catch (error) {
    console.error('Slack API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send notification',
        },
      },
      { status: 500 }
    );
  }
}
