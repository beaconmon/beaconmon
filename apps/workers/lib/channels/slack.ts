import type { ChannelSender } from './types.js';
import { slackChannelConfigSchema } from '@beaconmon/types';
import { logger } from '../logger.js';
import { env } from '../env.js';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function escapeSlackMrkdwn(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

type SlackBlock =
  | { type: 'section'; text: { type: 'mrkdwn' | 'plain_text'; text: string } }
  | { type: 'context'; elements: Array<{ type: 'mrkdwn'; text: string }> };

type SlackPayload = {
  blocks: SlackBlock[];
  metadata: {
    event_type: 'monitor_down' | 'monitor_slow' | 'monitor_recovered';
    event_payload: { monitorId: string; incidentId: string };
  };
};

export const slackSender: ChannelSender = async (rawConfig, payload) => {
  const config = slackChannelConfigSchema.parse(rawConfig);
  const { monitor, incident, type, durationMs } = payload;

  const emoji = type === 'down' ? ':red_circle:' : type === 'slow' ? ':yellow_circle:' : ':green_circle:';
  const heading =
    type === 'down'
      ? 'Down'
      : type === 'slow'
        ? 'Slow'
        : 'Recovered';

  const details =
    type === 'down'
      ? `Response time ${durationMs ?? 0}ms — failing since ${new Date(incident.startedAt).toUTCString()}`
      : type === 'slow'
        ? `Response time elevated to ${durationMs ?? 0}ms`
        : `Down for ${formatDuration(durationMs ?? 0)}`;

  const blocks: SlackBlock[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *${escapeSlackMrkdwn(monitor.name)}* — ${heading}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${escapeSlackMrkdwn(details)}\n<${escapeSlackMrkdwn(monitor.url)}|${escapeSlackMrkdwn(new URL(monitor.url).hostname)}>`,
      },
    },
  ];

  if (payload.note) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Note:* ${escapeSlackMrkdwn(payload.note)}`,
      },
    });
  }

  const slackPayload: SlackPayload = {
    blocks,
    metadata: {
      event_type: type === 'down' ? 'monitor_down' : type === 'slow' ? 'monitor_slow' : 'monitor_recovered',
      event_payload: {
        monitorId: monitor.id,
        incidentId: incident.id,
      },
    },
  };

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service: 'alert-worker', channel: 'slack', webhookUrl: config.webhookUrl, slackPayload },
      'ALERT_DRY_RUN — skipping Slack send'
    );
    return;
  }

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackPayload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Slack webhook returned ${response.status}: ${body}`);
  }

  logger.info(
    { service: 'alert-worker', channel: 'slack', monitorId: monitor.id },
    'Slack alert sent'
  );
};
