import { partitionPurgeTask } from './partition-purge.js';
import { retentionCleanupTask } from './retention-cleanup.js';
import { contentSnapshotRetentionTask } from './content-snapshot-retention.js';
import { pastDueDowngradeTask } from './past-due-downgrade.js';
import { trialRemindersTask } from './trial-reminders.js';
import { deployExpiryTask } from './deploy-expiry.js';
import { uptimeComputeTask } from './uptime-compute.js';
import { sloBurnTask } from './slo-burn.js';
import { intelligenceDigestTask } from './intelligence-digest.js';
import type { SchedulerTask } from './types.js';

export const tasks: SchedulerTask[] = [
  partitionPurgeTask,
  retentionCleanupTask,
  contentSnapshotRetentionTask,
  pastDueDowngradeTask,
  trialRemindersTask,
  deployExpiryTask,
  uptimeComputeTask,
  sloBurnTask,
  intelligenceDigestTask,
];
