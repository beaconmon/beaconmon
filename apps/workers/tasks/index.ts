import { partitionPurgeTask } from './partition-purge.js';
import { retentionCleanupTask } from './retention-cleanup.js';
import { contentSnapshotRetentionTask } from './content-snapshot-retention.js';
import { pastDueDowngradeTask } from './past-due-downgrade.js';
import { deployExpiryTask } from './deploy-expiry.js';
import { uptimeComputeTask } from './uptime-compute.js';
import { sloBurnTask } from './slo-burn.js';
import { intelligenceDigestTask } from './intelligence-digest.js';
import { monitoringRunPruneTask } from './monitoring-run-prune.js';
import { lifecycleEmailsTask } from './lifecycle-emails.js';
import type { SchedulerTask } from './types.js';

export const tasks: SchedulerTask[] = [
  partitionPurgeTask,
  retentionCleanupTask,
  contentSnapshotRetentionTask,
  pastDueDowngradeTask,
  deployExpiryTask,
  uptimeComputeTask,
  sloBurnTask,
  intelligenceDigestTask,
  monitoringRunPruneTask,
  lifecycleEmailsTask,
];
