import { partitionCreateTask } from './partition-create.js';
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
import { trialEndEnforceTask } from './trial-end-enforce.js';
import { staleSyncWatchdogTask } from './stale-sync-watchdog.js';
import { toolReportSweepTask } from './tool-report-sweep.js';
import type { SchedulerTask } from './types.js';

export const tasks: SchedulerTask[] = [
  partitionCreateTask,
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
  trialEndEnforceTask,
  staleSyncWatchdogTask,
  toolReportSweepTask,
];
