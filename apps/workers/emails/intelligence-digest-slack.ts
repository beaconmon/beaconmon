import { formatBriefDate, formatRelativeAgo } from '@beaconmon/emails';
import { formatCoverageLine } from './intelligence-digest.js';
import type {
  DigestIncidentItem,
  DigestContentItem,
  DigestExpiryItem,
  DigestSmartAlertItem,
  DigestCoverage,
} from './intelligence-digest.js';

type DigestSections = {
  incidents?: DigestIncidentItem[];
  ownContent?: DigestContentItem[];
  competitors?: DigestContentItem[];
  smartAlerts?: DigestSmartAlertItem[];
  expiry?: DigestExpiryItem[];
};

type SlackBlock =
  | { type: 'header'; text: { type: 'plain_text'; text: string } }
  | { type: 'section'; text: { type: 'mrkdwn' | 'plain_text'; text: string } }
  | { type: 'context'; elements: Array<{ type: 'mrkdwn'; text: string }> }
  | { type: 'actions'; elements: Array<{ type: 'button'; text: { type: 'plain_text'; text: string }; url: string; style?: string }> }
  | { type: 'divider' };

const SLACK_MRKDWN_LIMIT = 3000;

function escapeSlackMrkdwn(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function splitIntoMrkdwnBlocks(header: string, itemLines: string[]): SlackBlock[] {
  const blocks: SlackBlock[] = [];
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
  timezone = 'UTC',
  coverage?: DigestCoverage
): { blocks: SlackBlock[] } {
  const label = frequency === 'daily' ? 'Daily Briefing' : 'Weekly Briefing';
  const totalEvents =
    (sections.incidents?.length ?? 0) +
    (sections.smartAlerts?.length ?? 0) +
    (sections.expiry?.length ?? 0) +
    (sections.competitors?.length ?? 0) +
    (sections.ownContent?.length ?? 0);

  const blocks: SlackBlock[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${label} · ${formatBriefDate(windowStart, timezone)}` },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${totalEvents} ${totalEvents === 1 ? 'change' : 'changes'}* ${frequency === 'daily' ? 'overnight' : 'this week'}`,
      },
    },
    { type: 'divider' },
  ];

  if (sections.incidents && sections.incidents.length > 0) {
    const ongoingIncident = sections.incidents.find((i) => !i.resolvedAt);
    if (ongoingIncident) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:red_circle: *${escapeSlackMrkdwn(ongoingIncident.monitorName)}* still down · failing since ${formatRelativeAgo(ongoingIncident.startedAt)}`,
        },
      });
    }
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `Uptime & incidents (${sections.incidents.length})`,
        sections.incidents.map(
          (inc) =>
            `• *${escapeSlackMrkdwn(inc.monitorName)}* · ${inc.resolvedAt ? 'recovered' : 'down'} ${formatRelativeAgo(inc.startedAt)}`
        )
      )
    );
  }

  if (sections.competitors && sections.competitors.length > 0) {
    const highPriority = sections.competitors.find((c) =>
      c.classification === 'out_of_stock' || c.classification === 'sale_started' || c.classification === 'price_changed'
    );
    if (highPriority) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:yellow_circle: *${escapeSlackMrkdwn(highPriority.monitorName)}* — ${escapeSlackMrkdwn(highPriority.diffSummary ?? 'change detected')} · ${formatRelativeAgo(highPriority.capturedAt)}`,
        },
      });
    }
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `Competitor changes (${sections.competitors.length})`,
        sections.competitors.map(
          (c) =>
            `• <${escapeSlackMrkdwn(c.dashboardUrl)}|${escapeSlackMrkdwn(c.monitorName)}> · ${escapeSlackMrkdwn(c.diffSummary ?? 'content changed')} · ${formatRelativeAgo(c.capturedAt)}`
        )
      )
    );
  }

  if (sections.smartAlerts && sections.smartAlerts.length > 0) {
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `Performance alerts (${sections.smartAlerts.length})`,
        sections.smartAlerts.map(
          (a) => `• *${escapeSlackMrkdwn(a.monitorName)}* · ${a.responseTimeMs}ms · ${formatRelativeAgo(a.checkedAt)}`
        )
      )
    );
  }

  if (sections.expiry && sections.expiry.length > 0) {
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `SSL & domain expiry (${sections.expiry.length})`,
        sections.expiry.map(
          (e) => `• *${escapeSlackMrkdwn(e.monitorName)}* · ${e.type.toUpperCase()} expires in ${e.daysRemaining} day${e.daysRemaining !== 1 ? 's' : ''}`
        )
      )
    );
  }

  if (sections.ownContent && sections.ownContent.length > 0) {
    blocks.push(
      ...splitIntoMrkdwnBlocks(
        `Your content changes (${sections.ownContent.length})`,
        sections.ownContent.map(
          (c) =>
            `• <${escapeSlackMrkdwn(c.dashboardUrl)}|${escapeSlackMrkdwn(c.monitorName)}> · ${escapeSlackMrkdwn(c.diffSummary ?? 'content changed')} · ${formatRelativeAgo(c.capturedAt)}`
        )
      )
    );
  }

  if (coverage && coverage.totalCount > 0) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: escapeSlackMrkdwn(formatCoverageLine(coverage)) }],
    });
  }

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: 'Open Dashboard' },
        url: dashboardUrl,
        style: 'primary',
      },
    ],
  });

  return { blocks };
}
