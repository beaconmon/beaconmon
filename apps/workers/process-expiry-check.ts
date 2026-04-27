import { logger } from './lib/logger.js';
import { expiryAlertRepository } from '@beaconmon/db';
import type { CheckResult } from '@beaconmon/types';
import type { monitorRepository } from '@beaconmon/db';

const EXPIRY_THRESHOLDS = [7, 14, 30] as const;

export interface CheckContext {
  monitorId: string;
  type: string;
  monitor: Awaited<ReturnType<typeof monitorRepository.findById>>;
  result: CheckResult;
}

export async function processExpiryCheck(ctx: CheckContext): Promise<void> {
  const { monitorId, type, monitor, result } = ctx;
  const service = 'check-worker';

  if (!monitor) return;

  const sslResult = result as typeof result & { sslDetail?: { daysRemaining: number } };
  const domainResult = result as typeof result & { domainDetail?: { daysRemaining: number } };
  const daysRemaining =
    sslResult.sslDetail?.daysRemaining ?? domainResult.domainDetail?.daysRemaining;

  if (daysRemaining == null) return;

  const threshold = EXPIRY_THRESHOLDS.find((t) => daysRemaining <= t) ?? null;
  if (threshold == null) return;

  try {
    const existing = await expiryAlertRepository.findByMonitorAndThreshold(monitorId, threshold);
    if (!existing) {
      await expiryAlertRepository.create({
        teamId: monitor.teamId,
        monitorId,
        type: type as 'ssl' | 'domain',
        daysRemaining,
        threshold,
      });
      logger.info(
        { service, monitorId, type, daysRemaining, threshold },
        'Expiry alert created'
      );
    }
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to process expiry alert');
  }
}
