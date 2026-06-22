import type { ChannelSender } from './types.js';
import { discordChannelConfigSchema } from '@beaconmon/types';
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

// Discord colour integers: #dc2626 → 14423100 (red), #16a34a → 1484074 (green), #d97706 → 14254854 (amber)
const COLOR_DOWN = 14423100;
const COLOR_UP = 1484074;
const COLOR_SLOW = 14254854;

export const discordSender: ChannelSender = async (rawConfig, payload) => {
  const config = discordChannelConfigSchema.parse(rawConfig);
  const { monitor, incident, type, durationMs } = payload;

  const color = type === 'down' ? COLOR_DOWN : type === 'slow' ? COLOR_SLOW : COLOR_UP;
  const title =
    type === 'down'
      ? `Monitor Down: ${monitor.name}`
      : type === 'slow'
        ? `Smart Alert: ${monitor.name}`
        : `Monitor Recovered: ${monitor.name}`;

  const fields =
    type === 'down'
      ? [
          { name: 'URL', value: monitor.url, inline: false },
          { name: 'Detected at', value: incident.startedAt.toUTCString(), inline: true },
          { name: 'Incident ID', value: incident.id, inline: true },
        ]
      : type === 'slow'
        ? [
            { name: 'URL', value: monitor.url, inline: false },
            { name: 'Response time', value: `${durationMs ?? 0}ms`, inline: true },
            { name: 'Detected at', value: incident.startedAt.toUTCString(), inline: true },
          ]
        : [
            { name: 'URL', value: monitor.url, inline: false },
            { name: 'Downtime', value: formatDuration(durationMs ?? 0), inline: true },
            { name: 'Incident ID', value: incident.id, inline: true },
          ];

  const allFields = payload.note
    ? [...fields, { name: 'Note', value: payload.note, inline: false }]
    : fields;

  const discordPayload = {
    embeds: [
      {
        title,
        color,
        fields: allFields,
        footer: { text: 'Beaconmon' },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service: 'alert-worker', channel: 'discord', webhookUrl: config.webhookUrl, discordPayload },
      'ALERT_DRY_RUN — skipping Discord send'
    );
    return;
  }

  const response = await fetch(config.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(discordPayload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Discord webhook returned ${response.status}: ${body}`);
  }

  logger.info(
    { service: 'alert-worker', channel: 'discord', monitorId: monitor.id },
    'Discord alert sent'
  );
};
