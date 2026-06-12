import { contentSnapshotWorkerRepository } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { getEffectivePlan, getSnapshotRetentionLimit } from '@beaconmon/billing';
import type { SchedulerTask } from './types.js';

export const contentSnapshotRetentionTask: SchedulerTask = {
  name: 'content-snapshot-retention',
  runIntervalMs: 24 * 60 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    try {
      const monitors = await contentSnapshotWorkerRepository.findContentMonitorsWithTeamPlan();

      let totalDeleted = 0;

      for (const m of monitors) {
        const effectivePlan = getEffectivePlan({
          plan: m.plan,
          trialEndsAt: m.trialEndsAt,
          subscription: m.subscriptionStatus ? { status: m.subscriptionStatus } : null,
        });
        const keep = getSnapshotRetentionLimit(effectivePlan);
        const deleted = await contentSnapshotWorkerRepository.pruneToLimit(m.monitorId, keep);
        totalDeleted += deleted;
      }

      // Competitor page snapshots carry the full page text per change and grow
      // unbounded without this pass.
      const pages = await contentSnapshotWorkerRepository.findCompetitorPagesWithTeamPlan();
      for (const p of pages) {
        const effectivePlan = getEffectivePlan({
          plan: p.plan,
          trialEndsAt: p.trialEndsAt,
          subscription: p.subscriptionStatus ? { status: p.subscriptionStatus } : null,
        });
        const keep = getSnapshotRetentionLimit(effectivePlan);
        const deleted = await contentSnapshotWorkerRepository.pruneToLimitByCompetitorPage(p.competitorPageId, keep);
        totalDeleted += deleted;
      }

      logger.info({ service: 'scheduler', totalDeleted }, 'Content snapshot retention complete');
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Content snapshot retention failed');
      Sentry.captureException(err);
    }
  },
};
