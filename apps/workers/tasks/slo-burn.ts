import { sloRepository } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import { connection, sloBurnQueue } from '../lib/redis.js';
import type { SchedulerTask } from './types.js';

const SLO_FAST_BURN_WINDOW_MINUTES = 5;
const SLO_SLOW_BURN_WINDOW_MINUTES = 60;
const SLO_BURN_ALERT_COOLDOWN_MINUTES = 30;

export const sloBurnTask: SchedulerTask = {
  name: 'slo-burn',
  runIntervalMs: 60 * 1000,
  runOnStartup: false,
  async run(): Promise<void> {
    try {
      const monitors = await sloRepository.findMonitorsWithSlo();
      if (monitors.length === 0) return;

      let alertCount = 0;

      for (const monitor of monitors) {
        const fast = await sloRepository.computeShortWindowBurnRate(
          monitor.id,
          monitor.sloTarget,
          SLO_FAST_BURN_WINDOW_MINUTES
        );

        if (fast.totalChecks >= 2 && fast.burnRate > monitor.sloBurnRateFastThreshold) {
          const cooldownKey = `slo:burn:cooldown:${monitor.id}:fast`;
          const cooled = await connection.get(cooldownKey);
          if (!cooled) {
            const metrics = await sloRepository.computeMetrics(
              monitor.id,
              monitor.sloTarget,
              monitor.sloWindowDays
            );
            await sloBurnQueue.add(`slo-burn:${monitor.id}:fast`, {
              monitorId: monitor.id,
              teamId: monitor.teamId,
              burnRate: fast.burnRate,
              severity: 'fast',
              uptimePercent: metrics.uptimePercent,
              errorBudgetRemainingMinutes: metrics.errorBudgetRemainingMinutes,
              windowDays: monitor.sloWindowDays,
            });
            await connection.set(cooldownKey, '1', 'EX', SLO_BURN_ALERT_COOLDOWN_MINUTES * 60);
            alertCount++;
            logger.warn(
              { service: 'scheduler', monitorId: monitor.id, burnRate: fast.burnRate, severity: 'fast' },
              'SLO fast-burn threshold exceeded'
            );
          }
        }

        const slow = await sloRepository.computeShortWindowBurnRate(
          monitor.id,
          monitor.sloTarget,
          SLO_SLOW_BURN_WINDOW_MINUTES
        );

        if (slow.totalChecks >= 5 && slow.burnRate > monitor.sloBurnRateSlowThreshold) {
          const cooldownKey = `slo:burn:cooldown:${monitor.id}:slow`;
          const cooled = await connection.get(cooldownKey);
          if (!cooled) {
            const metrics = await sloRepository.computeMetrics(
              monitor.id,
              monitor.sloTarget,
              monitor.sloWindowDays
            );
            await sloBurnQueue.add(`slo-burn:${monitor.id}:slow`, {
              monitorId: monitor.id,
              teamId: monitor.teamId,
              burnRate: slow.burnRate,
              severity: 'slow',
              uptimePercent: metrics.uptimePercent,
              errorBudgetRemainingMinutes: metrics.errorBudgetRemainingMinutes,
              windowDays: monitor.sloWindowDays,
            });
            await connection.set(cooldownKey, '1', 'EX', SLO_BURN_ALERT_COOLDOWN_MINUTES * 60);
            alertCount++;
            logger.warn(
              { service: 'scheduler', monitorId: monitor.id, burnRate: slow.burnRate, severity: 'slow' },
              'SLO slow-burn threshold exceeded'
            );
          }
        }
      }

      if (alertCount > 0) {
        logger.info({ service: 'scheduler', alertCount }, 'SLO burn-rate alerts enqueued');
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'SLO burn-rate evaluation failed');
      Sentry.captureException(err);
    }
  },
};
