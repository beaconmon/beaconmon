import type {
  DigestIncidentItem,
  DigestContentItem,
  DigestExpiryItem,
  DigestSmartAlertItem,
} from './intelligence-digest.js';

type DigestSections = {
  incidents?: DigestIncidentItem[];
  ownContent?: DigestContentItem[];
  competitors?: DigestContentItem[];
  smartAlerts?: DigestSmartAlertItem[];
  expiry?: DigestExpiryItem[];
};

export function buildSlackPayload(
  frequency: 'daily' | 'weekly',
  windowStart: Date,
  windowEnd: Date,
  dashboardUrl: string,
  sections: DigestSections
): object {
  const label = frequency === 'daily' ? 'Daily' : 'Weekly';
  const dateRange = `${windowStart.toUTCString().slice(0, 16)} to ${windowEnd.toUTCString().slice(0, 16)} UTC`;

  const blocks: object[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${label} Intelligence Digest` },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Period:* ${dateRange}` },
    },
    { type: 'divider' },
  ];

  if (sections.incidents && sections.incidents.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Incidents (${sections.incidents.length})*\n` +
          sections.incidents
            .map(
              (inc) =>
                `• *${inc.monitorName}* — started ${inc.startedAt.toUTCString()}${inc.resolvedAt ? `, resolved ${inc.resolvedAt.toUTCString()}` : ' (ongoing)'}`
            )
            .join('\n'),
      },
    });
  }

  if (sections.smartAlerts && sections.smartAlerts.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Smart Alerts (${sections.smartAlerts.length})*\n` +
          sections.smartAlerts
            .map((a) => `• *${a.monitorName}* — ${a.responseTimeMs}ms response time`)
            .join('\n'),
      },
    });
  }

  if (sections.expiry && sections.expiry.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*SSL and Domain Expiry (${sections.expiry.length})*\n` +
          sections.expiry
            .map((e) => `• *${e.monitorName}* — ${e.type.toUpperCase()} expires in ${e.daysRemaining} days`)
            .join('\n'),
      },
    });
  }

  if (sections.competitors && sections.competitors.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Competitor Changes (${sections.competitors.length})*\n` +
          sections.competitors.map((c) => `• *${c.monitorName}* — ${c.diffSummary ?? 'content changed'}`).join('\n'),
      },
    });
  }

  if (sections.ownContent && sections.ownContent.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Own Content Changes (${sections.ownContent.length})*\n` +
          sections.ownContent.map((c) => `• *${c.monitorName}* — ${c.diffSummary ?? 'content changed'}`).join('\n'),
      },
    });
  }

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: 'Open Intelligence Dashboard' },
        url: dashboardUrl,
        style: 'primary',
      },
    ],
  });

  return { blocks };
}
