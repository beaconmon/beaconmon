import type { ContentNotifyJob } from '@beaconmon/queue';
import { logger } from './lib/logger.js';
import { notifyContentChange } from './lib/content-change-notifier.js';

const service = 'content-worker';

export async function processContentNotifyJob(data: ContentNotifyJob): Promise<void> {
  const { teamId, monitorName, monitorUrl, monitorId, changedAt, summary, classification, appUrl } = data;

  logger.info({ service, monitorId, teamId }, 'Processing content notify job');

  await notifyContentChange(
    teamId,
    monitorName,
    monitorUrl,
    monitorId,
    new Date(changedAt),
    summary,
    classification,
    appUrl
  );
}
