import { deployEventRepository } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { Sentry } from '../lib/sentry.js';
import type { SchedulerTask } from './types.js';

const DEPLOY_AUTO_EXPIRE_MINUTES = 30;

export const deployExpiryTask: SchedulerTask = {
  name: 'deploy-expiry',
  runIntervalMs: 5 * 60 * 1000,
  runOnStartup: true,
  async run(): Promise<void> {
    try {
      const expired = await deployEventRepository.expireStaleDeployEvents(DEPLOY_AUTO_EXPIRE_MINUTES);
      if (expired > 0) {
        logger.info({ service: 'scheduler', expired }, 'Auto-expired stale deploy events');
      }
    } catch (err) {
      logger.error({ service: 'scheduler', err }, 'Failed to expire stale deploy events');
      Sentry.captureException(err);
    }
  },
};
