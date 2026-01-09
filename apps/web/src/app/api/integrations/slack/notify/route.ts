import { NextRequest } from 'next/server';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-response';
import { handleApiError } from '@/lib/error-handler';
import { SlackService } from '@/lib/integrations/slack';

// POST /api/integrations/slack/notify - Send a Slack notification
export async function POST(request: NextRequest) {
  try {
    const slackToken = request.headers.get('x-slack-token');
    const body = await request.json();

    if (!slackToken) {
      return errorResponse('Slack access token required', 'MISSING_TOKEN', 401);
    }

    const { channel, type, data, action } = body;

    if (!channel || !type || !data) {
      return validationErrorResponse('Channel, type, and data are required');
    }

    const slackService = new SlackService(slackToken);

    if (type === 'project') {
      await slackService.sendProjectNotification(channel, data, action);
    } else if (type === 'task') {
      await slackService.sendTaskNotification(channel, data, action);
    } else {
      return validationErrorResponse('Invalid notification type');
    }

    return successResponse({ message: 'Notification sent successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
