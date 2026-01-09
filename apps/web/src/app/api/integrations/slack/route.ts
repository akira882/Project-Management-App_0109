import { NextRequest, NextResponse } from 'next/server';
import { SlackService } from '@/lib/integrations/slack';

/**
 * POST /api/integrations/slack
 * Slackにメッセージを送信
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channel, text, attachments, webhookUrl } = body;

    if (!text) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'text is required',
          },
        },
        { status: 400 }
      );
    }

    // Webhookを使用する場合
    if (webhookUrl) {
      const slackService = new SlackService(''); // トークン不要
      await slackService.sendWebhookMessage(webhookUrl, {
        channel,
        text,
        attachments,
      });

      return NextResponse.json({
        message: 'Message sent successfully via webhook',
      });
    }

    // アクセストークンを使用する場合
    const token =
      request.headers.get('x-slack-token') || process.env.SLACK_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Slack access token or webhook URL is required',
          },
        },
        { status: 401 }
      );
    }

    if (!channel) {
      return NextResponse.json(
        {
          error: {
            code: 'BAD_REQUEST',
            message: 'channel is required when using access token',
          },
        },
        { status: 400 }
      );
    }

    const slackService = new SlackService(token);
    await slackService.sendMessage({
      channel,
      text,
      attachments,
    });

    return NextResponse.json({
      message: 'Message sent successfully',
    });
  } catch (error) {
    console.error('Slack API error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to send message',
        },
      },
      { status: 500 }
    );
  }
}
