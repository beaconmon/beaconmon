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

export const slackSender: ChannelSender = async (rawConfig, payload) => {
  const config = slackChannelConfigSchema.parse(rawConfig);
  const { monitor, incident, type, durationMs } = payload;

  const color = type === 'down' ? '#dc2626' : type === 'slow' ? '#d97706' : '#16a34a';
  const title =
    type === 'down'
      ? `Monitor Down: ${monitor.name}`
      : type === 'slow'
        ? `Smart Alert: ${monitor.name}`
        : `Monitor Recovered: ${monitor.name}`;

  const fields =
    type === 'down'
      ? [
          { title: 'URL', value: monitor.url, short: false },
          { title: 'Detected at', value: incident.startedAt.toUTCString(), short: true },
          { title: 'Incident ID', value: incident.id, short: true },
        ]
      : type === 'slow'
        ? [
            { title: 'URL', value: monitor.url, short: false },
            { title: 'Response time', value: `${durationMs ?? 0}ms`, short: true },
            { title: 'Detected at', value: incident.startedAt.toUTCString(), short: true },
          ]
        : [
            { title: 'URL', value: monitor.url, short: false },
            { title: 'Downtime', value: formatDuration(durationMs ?? 0), short: true },
            { title: 'Incident ID', value: incident.id, short: true },
          ];

  const allFields = payload.note
    ? [...fields, { title: 'Note', value: payload.note, short: false }]
    : fields;

  const slackPayload = {
    attachments: [
      {
        color,
        title,
        fields: allFields,
        footer: 'Beaconmon',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
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
