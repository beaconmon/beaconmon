import * as React from 'react';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import type { Redis } from 'ioredis';
import { prisma, contentSnapshotWorkerRepository, digestRepository } from '@beaconmon/db';
import type { IntelligenceDigestJob } from '@beaconmon/queue';
import { digestPrefsSchema } from '@beaconmon/types';
import { emailChannelConfigSchema, slackChannelConfigSchema } from '@beaconmon/types';
import { IntelligenceDigestEmail } from './emails/intelligence-digest.js';
import { getEffectivePlan } from './lib/get-effective-plan.js';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';
import type {
  DigestIncidentItem,
  DigestContentItem,
  DigestExpiryItem,
  DigestSmartAlertItem,
} from './emails/intelligence-digest.js';

const service = 'digest-worker';

// Slack Block Kit digest payload
function buildSlackPayload(
  frequency: 'daily' | 'weekly',
  windowStart: Date,
  windowEnd: Date,
  dashboardUrl: string,
  sections: {
    incidents?: DigestIncidentItem[];
    ownContent?: DigestContentItem[];
    competitors?: DigestContentItem[];
    smartAlerts?: DigestSmartAlertItem[];
    expiry?: DigestExpiryItem[];
  }
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

export async function processIntelligenceDigestJob(
  data: IntelligenceDigestJob,
  jobId?: string,
  redis?: Redis
): Promise<void> {
  const { teamId, frequency, windowStart, windowEnd } = data;

  const team = await digestRepository.getTeamForDigest(teamId);
  if (!team) {
    logger.info({ service, teamId }, 'Digest: team not found, skipping');
    return;
  }

  const prefs = digestPrefsSchema.parse(team.digestPrefs ?? {});
  const effectivePlan = getEffectivePlan(team);

  if (effectivePlan === 'free') {
    logger.info({ service, teamId }, 'Digest: team on free plan, skipping');
    return;
  }

  if (effectivePlan === 'starter' && frequency === 'daily') {
    logger.info({ service, teamId }, 'Digest: starter plan cannot receive daily digest, skipping');
    return;
  }

  if (!prefs.channelIds.length) {
    logger.info({ service, teamId }, 'Digest: no opted-in channels, skipping');
    return;
  }

  const channels = await prisma.alertChannel.findMany({
    where: {
      id: { in: prefs.channelIds },
      teamId,
      isActive: true,
      disabledAt: null,
    },
    select: { id: true, type: true, config: true, name: true },
  });

  if (channels.length === 0) {
    logger.info({ service, teamId }, 'Digest: opted-in channels are all inactive, skipping');
    return;
  }

  const start = new Date(windowStart);
  const end = new Date(windowEnd);

  // Gather section data, skipping disabled sections
  const sections: {
    incidents?: DigestIncidentItem[];
    ownContent?: DigestContentItem[];
    competitors?: DigestContentItem[];
    smartAlerts?: DigestSmartAlertItem[];
    expiry?: DigestExpiryItem[];
  } = {};

  const appUrl = env.APP_URL ?? 'https://beaconmon.com';

  if (prefs.sections.incidents) {
    sections.incidents = await digestRepository.findIncidentsInWindow(teamId, start, end);
  }

  if (prefs.sections.ownContent) {
    const snaps = await digestRepository.findOwnContentSnapshots(teamId, start, end);
    sections.ownContent = snaps.map((s) => ({
      monitorId: s.monitorId,
      monitorName: s.monitorName,
      monitorUrl: s.monitorUrl,
      capturedAt: s.capturedAt,
      diffSummary: s.diffSummary,
      classification: s.classification,
      dashboardUrl: `${appUrl}/monitors/${s.monitorId}`,
    }));
  }

  if (prefs.sections.competitors) {
    const snaps = await contentSnapshotWorkerRepository.findSnapshotsForDigest(teamId, start, end);
    sections.competitors = snaps
      .map((s) => ({
        monitorId: s.competitorPageId,
        monitorName: s.competitorName,
        monitorUrl: s.pageUrl,
        capturedAt: s.capturedAt,
        diffSummary: s.diffSummary,
        classification: s.classification,
        dashboardUrl: `${appUrl}/intelligence`,
      }));
  }

  if (prefs.sections.smartAlerts) {
    sections.smartAlerts = await digestRepository.findSmartAlertsInWindow(teamId, start, end);
  }

  if (prefs.sections.expiry) {
    const alerts = await digestRepository.findExpiryAlertsInWindow(teamId, start, end);
    sections.expiry = alerts.map((a) => ({
      monitorName: a.monitorName,
      monitorUrl: a.monitorUrl,
      type: a.type,
      daysRemaining: a.daysRemaining,
    }));
  }

  const totalEvents =
    (sections.incidents?.length ?? 0) +
    (sections.ownContent?.length ?? 0) +
    (sections.competitors?.length ?? 0) +
    (sections.smartAlerts?.length ?? 0) +
    (sections.expiry?.length ?? 0);

  if (totalEvents === 0) {
    logger.info({ service, teamId, frequency }, 'Digest: no events in window, skipping');
    return;
  }

  if (env.ALERT_DRY_RUN) {
    logger.info(
      { service, teamId, frequency, totalEvents, channelCount: channels.length },
      'ALERT_DRY_RUN — skipping intelligence digest send'
    );
    return;
  }

  const dashboardUrl = `${appUrl}/intelligence`;
  let successCount = 0;
  let failureCount = 0;

  for (const channel of channels) {
    // Per-channel idempotency: skip if this job already delivered to this channel.
    // Guards against duplicate sends when BullMQ retries after a partial failure.
    if (jobId && redis) {
      const idempotencyKey = `digest:sent:${jobId}:${channel.id}`;
      try {
        const alreadySent = await redis.exists(idempotencyKey);
        if (alreadySent) {
          logger.info({ service, teamId, channelId: channel.id }, 'Digest: already sent to channel, skipping (idempotency)');
          // Do not count as successCount — idempotent skips shouldn't mask
          // failures on other channels and suppress BullMQ retries.
          continue;
        }
      } catch {
        // Redis unavailable — proceed without idempotency check rather than blocking send.
      }
    }

    try {
      if (channel.type === 'email') {
        if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
          throw new Error('RESEND_API_KEY or EMAIL_FROM not set');
        }

        const parsed = emailChannelConfigSchema.safeParse(channel.config);
        if (!parsed.success) {
          logger.warn({ service, teamId, channelId: channel.id }, 'Digest: invalid email channel config');
          continue;
        }

        const html = await render(
          React.createElement(IntelligenceDigestEmail, {
            frequency,
            windowStart: start,
            windowEnd: end,
            dashboardUrl,
            sections,
          })
        );

        const resend = new Resend(env.RESEND_API_KEY);
        const label = frequency === 'daily' ? 'Daily' : 'Weekly';
        const { error } = await resend.emails.send({
          from: env.EMAIL_FROM,
          to: parsed.data.recipients,
          subject: `${label} Intelligence Digest — ${totalEvents} event${totalEvents !== 1 ? 's' : ''}`,
          html,
        });

        if (error) throw new Error(`Resend API error: ${error.message}`);
        if (jobId && redis) {
          await redis.set(`digest:sent:${jobId}:${channel.id}`, '1', 'EX', 48 * 60 * 60).catch(() => null);
        }
        successCount++;
      } else if (channel.type === 'slack') {
        const parsed = slackChannelConfigSchema.safeParse(channel.config);
        if (!parsed.success) {
          logger.warn({ service, teamId, channelId: channel.id }, 'Digest: invalid slack channel config');
          continue;
        }

        const payload = buildSlackPayload(frequency, start, end, dashboardUrl, sections);
        const response = await fetch(parsed.data.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`Slack webhook returned ${response.status}: ${body}`);
        }
        if (jobId && redis) {
          await redis.set(`digest:sent:${jobId}:${channel.id}`, '1', 'EX', 48 * 60 * 60).catch(() => null);
        }
        successCount++;
      } else {
        logger.warn({ service, teamId, channelId: channel.id, type: channel.type }, 'Digest: unsupported channel type, skipping');
      }
    } catch (err) {
      logger.error({ service, teamId, channelId: channel.id, err }, 'Digest: failed to send to channel');
      failureCount++;
    }
  }

  if (successCount === 0 && failureCount > 0) {
    throw new Error(`Intelligence digest: all ${failureCount} channel(s) failed — triggering retry`);
  }

  logger.info(
    { service, teamId, frequency, totalEvents, successCount, failureCount },
    'Intelligence digest sent'
  );
}
