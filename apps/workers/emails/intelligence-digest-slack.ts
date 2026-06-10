import { formatBriefDateTimeUTC } from '@beaconmon/emails';
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

const SLACK_MRKDWN_LIMIT = 3000;

function escapeSlackMrkdwn(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function splitIntoMrkdwnBlocks(header: string, itemLines: string[]): object[] {
  const blocks: object[] = [];
  let currentText = header;

  for (const line of itemLines) {
    const candidate = currentText + '\n' + line;
    if (candidate.length > SLACK_MRKDWN_LIMIT) {
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: currentText } });
      currentText = header + ' (continued)\n' + line;
    } else {
      currentText = candidate;
    }
  }

  if (currentText) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: currentText } });
  }

  return blocks;
}

export function buildSlackPayload(
  frequency: 'daily' | 'weekly',
  windowStart: Date,
  windowEnd: Date,
  dashboardUrl: string,
  sections: DigestSections,
  timezone = 'UTC'
): object {
  const label = frequency === 'daily' ? 'Daily' : 'Weekly';
  const dateRange = `${formatBriefDateTimeUTC(windowStart, timezone)} to ${formatBriefDateTimeUTC(windowEnd, timezone)}`;

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
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `*Incidents (${sections.incidents.length})*`,
        sections.incidents.map(
          (inc) =>
            `• *${escapeSlackMrkdwn(inc.monitorName)}* — started ${formatBriefDateTimeUTC(inc.startedAt, timezone)}${inc.resolvedAt ? `, resolved ${formatBriefDateTimeUTC(inc.resolvedAt, timezone)}` : ' (ongoing)'}`
        )
      )
    );
  }

  if (sections.smartAlerts && sections.smartAlerts.length > 0) {
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `*Smart Alerts (${sections.smartAlerts.length})*`,
        sections.smartAlerts.map(
          (a) => `• *${escapeSlackMrkdwn(a.monitorName)}* — ${a.responseTimeMs}ms response time`
        )
      )
    );
  }

  if (sections.expiry && sections.expiry.length > 0) {
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `*SSL and Domain Expiry (${sections.expiry.length})*`,
        sections.expiry.map(
          (e) => `• *${escapeSlackMrkdwn(e.monitorName)}* — ${e.type.toUpperCase()} expires in ${e.daysRemaining} days`
        )
      )
    );
  }

  if (sections.competitors && sections.competitors.length > 0) {
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `*Competitor Changes (${sections.competitors.length})*`,
        sections.competitors.map(
          (c) => `• *${escapeSlackMrkdwn(c.monitorName)}* — ${escapeSlackMrkdwn(c.diffSummary ?? 'content changed')}`
        )
      )
    );
  }

  if (sections.ownContent && sections.ownContent.length > 0) {
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `*Own Content Changes (${sections.ownContent.length})*`,
        sections.ownContent.map(
          (c) => `• *${escapeSlackMrkdwn(c.monitorName)}* — ${escapeSlackMrkdwn(c.diffSummary ?? 'content changed')}`
        )
      )
    );
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
