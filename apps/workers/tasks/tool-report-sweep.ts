import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { processToolReportJob } from '../process-tool-report-job.js';
import type { SchedulerTask } from './types.js';

// Runs hourly. Precision on a 7-day window does not matter — a few hours drift
// is fine. runOnStartup ensures overdue reports fire even after a scheduler restart.
export const toolReportSweepTask: SchedulerTask = {
  name: 'tool-report-sweep',
  runIntervalMs: 60 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    const due = await prisma.toolReport.findMany({
      where: { status: 'pending', reportDueAt: { lte: new Date() } },
      select: { id: true, email: true, domain: true },
    });

    if (due.length === 0) return;

    logger.info({ service: 'scheduler', task: 'tool-report-sweep', count: due.length }, 'Processing due tool reports');

    for (const row of due) {
      try {
        await processToolReportJob({ toolReportId: row.id, email: row.email, domain: row.domain });
      } catch (err) {
        logger.error({ service: 'scheduler', task: 'tool-report-sweep', toolReportId: row.id, err }, 'Tool report send failed');
        Sentry.captureException(err);
        await prisma.toolReport.update({
          where: { id: row.id },
          data: { status: 'failed' },
        }).catch(() => undefined);
      }
    }
  },
};
