import { prisma } from '@beaconmon/db';
import { PLAN_LIMITS } from '@beaconmon/types';
import { connection } from '../lib/redis.js';
import { processLifecycleEmailJob } from '../process-lifecycle-email-job.js';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import type { SchedulerTask } from './types.js';
import { selectMonitorsToPause } from './trial-end-select.js';
export type { MonitorForPauseSelect } from './trial-end-select.js';
export { selectMonitorsToPause } from './trial-end-select.js';

// Grace period before pausing: gives in-flight Freemius webhooks time to arrive.
const GRACE_PERIOD_MS = 2 * 60 * 60 * 1000;
const STALE_PAUSE_MS = 30 * 24 * 60 * 60 * 1000;

// Subscription statuses that mean the team has a real billing relationship.
// 'incomplete' is intentionally excluded: it means payment is pending/unfinished, not active.
const ACTIVE_BILLING_STATUSES = new Set(['active', 'trialing', 'past_due']);

export const trialEndEnforceTask: SchedulerTask = {
  name: 'trial-end-enforce',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: false,

  async run(): Promise<void> {
    const now = new Date();

    try {
      await runEnforcementPass(now);
      await runStalenessSweeper(now);
    } catch (err) {
      logger.error({ service: 'scheduler', task: 'trial-end-enforce', err }, 'Task failed');
      Sentry.captureException(err);
    }
  },
};

async function runEnforcementPass(now: Date): Promise<void> {
  const cutoff = new Date(now.getTime() - GRACE_PERIOD_MS);

  const expiredTeams = await prisma.team.findMany({
    where: {
      trialEndsAt: { lte: cutoff },
      trialEndProcessedAt: null,
    },
    select: {
      id: true,
      subscription: { select: { status: true } },
      members: {
        where: { role: 'owner' },
        select: { user: { select: { email: true } } },
        take: 1,
      },
      monitors: {
        where: { isActive: true, deletedAt: null },
        select: { id: true, name: true, isCompetitor: true, createdAt: true },
      },
    },
  });

  const teamsToProcess = expiredTeams.filter((t) => {
    const status = t.subscription?.status ?? null;
    return !status || !ACTIVE_BILLING_STATUSES.has(status);
  });

  if (teamsToProcess.length === 0) return;

  const freeCaps = { monitors: PLAN_LIMITS.free.monitors, competitorMonitors: PLAN_LIMITS.free.competitorMonitors };

  for (const team of teamsToProcess) {
    const toPause = selectMonitorsToPause(team.monitors, freeCaps);
    const ownerEmail = team.members[0]?.user.email ?? null;

    if (toPause.length > 0) {
      await prisma.monitor.updateMany({
        where: { id: { in: toPause.map((m) => m.id) } },
        data: { isActive: false, pausedReason: 'trial_end', pausedAt: now },
      });
    }

    await prisma.team.update({
      where: { id: team.id },
      data: { trialEndProcessedAt: now },
    });

    logger.info(
      { service: 'scheduler', teamId: team.id, pausedCount: toPause.length },
      'Trial end enforced',
    );

    if (ownerEmail && toPause.length > 0) {
      const dedupKey = `lifecycle:day14:paused:${team.id}`;
      try {
        await processLifecycleEmailJob(
          {
            teamId: team.id,
            emailType: 'day14-paused',
            payload: {
              pausedMonitors: toPause.map((m) => ({ id: m.id, name: m.name, isCompetitor: m.isCompetitor })),
            },
            dedupKey,
            ownerEmail,
          },
          connection,
        );
      } catch (err) {
        logger.error({ service: 'scheduler', teamId: team.id, err }, 'Failed to send day14-paused email');
        Sentry.captureException(err);
      }
    }
  }

  logger.info(
    { service: 'scheduler', processed: teamsToProcess.length },
    'Trial-end enforcement pass complete',
  );
}

async function runStalenessSweeper(now: Date): Promise<void> {
  const staleCutoff = new Date(now.getTime() - STALE_PAUSE_MS);

  const { count } = await prisma.monitor.updateMany({
    where: {
      pausedReason: 'trial_end',
      pausedAt: { lte: staleCutoff },
    },
    data: { pausedReason: null, pausedAt: null },
  });

  if (count > 0) {
    logger.info({ service: 'scheduler', count }, 'Cleared stale trial-end pauses (30-day cutoff)');
  }
}
