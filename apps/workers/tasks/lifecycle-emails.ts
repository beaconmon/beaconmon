import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { connection } from '../lib/redis.js';
import { processLifecycleEmailJob } from '../process-lifecycle-email-job.js';
import { lifecycleEmailRegistry } from '../lib/lifecycle/registry.js';
import type { SchedulerTask } from './types.js';

const LAST_RUN_KEY = 'scheduler:lifecycle_emails:last_run';

export const lifecycleEmailsTask: SchedulerTask = {
  name: 'lifecycle-emails',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    const todayKey = new Date().toISOString().slice(0, 10);
    const lastRun = await connection.get(LAST_RUN_KEY);
    if (lastRun === todayKey) return;

    try {
      const now = new Date();

      const teams = await prisma.team.findMany({
        select: {
          id: true,
          plan: true,
          trialEndsAt: true,
          onboardingCompletedAt: true,
          createdAt: true,
          subscription: { select: { status: true } },
          members: {
            where: { role: 'owner' },
            select: { user: { select: { email: true } } },
            take: 1,
          },
          competitors: {
            where: { deletedAt: null, isActive: true },
            select: { domain: true },
          },
          _count: {
            select: {
              competitors: { where: { deletedAt: null, isActive: true } },
              alertChannels: { where: { isActive: true, disabledAt: null } },
            },
          },
        },
      });

      // Preload lifecycle unsubscribes for all teams in one query
      const teamIds = teams.map((t) => t.id);
      const unsubscribeRows = await prisma.emailUnsubscribe.findMany({
        where: { teamId: { in: teamIds } },
        select: { teamId: true, category: true },
      });
      const unsubscribed = new Map<string, Set<string>>();
      for (const row of unsubscribeRows) {
        if (!unsubscribed.has(row.teamId)) unsubscribed.set(row.teamId, new Set());
        unsubscribed.get(row.teamId)!.add(row.category);
      }

      let enqueued = 0;

      for (const team of teams) {
        const ownerEmail = team.members[0]?.user.email ?? null;
        if (!ownerEmail) continue;

        const teamData = {
          id: team.id,
          plan: team.plan,
          trialEndsAt: team.trialEndsAt,
          onboardingCompletedAt: team.onboardingCompletedAt,
          createdAt: team.createdAt,
          subscription: team.subscription,
          ownerEmail,
          competitorDomains: team.competitors.map((c) => c.domain),
          competitorCount: team._count.competitors,
          alertChannelCount: team._count.alertChannels,
        };

        for (const config of lifecycleEmailRegistry.values()) {
          if (!config.trigger(teamData, now)) continue;

          // Check category-level unsubscribe
          if (unsubscribed.get(team.id)?.has(config.category)) continue;

          const dedupKey = config.dedupKey(teamData);

          // Redis dedup: skip if already sent (defense layer 1)
          const alreadySent = await connection.get(`lifecycle:dedup:${dedupKey}`);
          if (alreadySent) continue;

          let payload: Record<string, unknown>;
          try {
            payload = await config.payload(teamData);
          } catch (payloadErr) {
            logger.error(
              { service: 'scheduler', teamId: team.id, emailType: config.type, err: payloadErr },
              'Failed to generate lifecycle email payload, skipping'
            );
            Sentry.captureException(payloadErr);
            continue;
          }

          try {
            await processLifecycleEmailJob(
              { teamId: team.id, emailType: config.type, payload, dedupKey, ownerEmail },
              connection
            );
            enqueued++;
          } catch (enqueueErr) {
            logger.error(
              { service: 'scheduler', teamId: team.id, emailType: config.type, err: enqueueErr },
              'Failed to send lifecycle email, continuing'
            );
            Sentry.captureException(enqueueErr);
          }
        }
      }

      await connection.set(LAST_RUN_KEY, todayKey, 'EX', 60 * 60 * 48);

      if (enqueued > 0) {
        logger.info({ service: 'scheduler', enqueued }, 'Lifecycle emails sent');
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Lifecycle emails task failed');
      Sentry.captureException(err);
    }
  },
};
