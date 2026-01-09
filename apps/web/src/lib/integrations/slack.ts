import { SlackMessage } from '@project-management/shared';

const SLACK_API_BASE = 'https://slack.com/api';

export class SlackService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${SLACK_API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Slack API error: ${result.error}`);
    }

    return result;
  }

  async sendMessage(message: SlackMessage): Promise<void> {
    await this.fetch('chat.postMessage', message);
  }

  async sendProjectNotification(
    channel: string,
    project: {
      name: string;
      status: string;
      priority: string;
    },
    action: 'created' | 'updated' | 'deleted'
  ): Promise<void> {
    const actionText = {
      created: '作成されました',
      updated: '更新されました',
      deleted: '削除されました',
    }[action];

    const color = {
      created: '#10B981',
      updated: '#3B82F6',
      deleted: '#EF4444',
    }[action];

    await this.sendMessage({
      channel,
      text: `プロジェクト「${project.name}」が${actionText}`,
      attachments: [
        {
          color,
          title: `プロジェクト: ${project.name}`,
          fields: [
            {
              title: 'ステータス',
              value: project.status,
              short: true,
            },
            {
              title: '優先度',
              value: project.priority,
              short: true,
            },
          ],
        },
      ],
    });
  }

  async sendTaskNotification(
    channel: string,
    task: {
      title: string;
      status: string;
      priority: string;
      projectName: string;
    },
    action: 'created' | 'updated' | 'completed'
  ): Promise<void> {
    const actionText = {
      created: '作成されました',
      updated: '更新されました',
      completed: '完了しました',
    }[action];

    const color = {
      created: '#10B981',
      updated: '#3B82F6',
      completed: '#10B981',
    }[action];

    await this.sendMessage({
      channel,
      text: `タスク「${task.title}」が${actionText}`,
      attachments: [
        {
          color,
          title: `タスク: ${task.title}`,
          fields: [
            {
              title: 'プロジェクト',
              value: task.projectName,
              short: true,
            },
            {
              title: 'ステータス',
              value: task.status,
              short: true,
            },
            {
              title: '優先度',
              value: task.priority,
              short: true,
            },
          ],
        },
      ],
    });
  }

  async sendWebhookMessage(webhookUrl: string, message: SlackMessage): Promise<void> {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook error: ${response.statusText}`);
    }
  }
}
