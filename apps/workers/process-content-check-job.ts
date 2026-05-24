import { createHash } from 'crypto';
import {
  monitorRepository,
  checkResultRepository,
  contentSnapshotWorkerRepository,
} from '@beaconmon/db';
import { runContentCheck } from '@beaconmon/checker';
import type { ContentCheckJob, ContentNotifyJob } from '@beaconmon/queue';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';
import { runAiAnalysisIfEligible } from './lib/ai-content-diff.js';

const TIMEOUT_MS = 30_000;
const service = 'content-worker';

export async function processContentCheckJob(
  data: ContentCheckJob,
  redis?: Redis,
  notifyQueue?: Queue<ContentNotifyJob>
): Promise<void> {
  const { monitorId, url, selector, isCompetitor: _isCompetitor = false, instantAlerts: _instantAlerts = false } = data;

  // 1. Load monitor — bail if missing. Include the team's plan/billing state
  // so step 7b can plan-gate AI analysis without a second query.
  const monitor = await monitorRepository.findByIdWithPlan(monitorId);
  if (!monitor) {
    logger.warn({ service, monitorId }, 'Monitor not found, skipping content check');
    return;
  }

  // 2. Fetch and parse
  const result = await runContentCheck({ monitorId, url, selector, timeoutMs: TIMEOUT_MS });

  // 3. Persist check result — abort if this fails (no audit trail)
  try {
    await checkResultRepository.create({
      monitorId,
      checkedAt: result.checkedAt,
      success: result.success,
      statusCode: result.statusCode,
      responseTimeMs: result.responseTimeMs,
      errorType: result.errorType,
      errorMessage: result.errorMessage,
      type: 'content',
    });
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to persist check result, aborting');
    return;
  }

  // 4. Fetch failed — log and done (no content to compare)
  if (!result.success || result.content === null) {
    logger.warn({ service, monitorId, errorType: result.errorType }, 'Content check failed, skipping diff');
    return;
  }

  const { content, checkedAt } = result;
  const contentHash = createHash('sha256').update(content).digest('hex');

  // 5. First run — initialize snapshot (also write the first history row).
  if (monitor.contentSnapshot === null) {
    try {
      await contentSnapshotWorkerRepository.recordChange(monitorId, monitor.teamId, content, checkedAt, contentHash);
      logger.info({ service, monitorId }, 'Content snapshot initialized');
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Failed to initialize content snapshot');
    }
    return;
  }

  // 6. No change
  if (content === monitor.contentSnapshot) {
    logger.info({ service, monitorId }, 'Content unchanged');
    return;
  }

  // 7. Content changed — guard against concurrent workers processing the same
  // change simultaneously (e.g., a BullMQ retry arriving before the first run
  // finishes). The key expires after 60 seconds, so content reversions (A->B->A)
  // are correctly detected once the window passes.
  if (redis) {
    const dedupKey = `content:dedup:${monitorId}:${contentHash}`;
    const claimed = await redis.set(dedupKey, '1', 'EX', 60, 'NX');
    if (!claimed) {
      logger.info({ service, monitorId }, 'Duplicate snapshot skipped by dedup guard (Redis)');
      return;
    }
  }

  logger.info({ service, monitorId }, 'Content change detected');

  const previousContent = monitor.contentSnapshot;

  // 7b. AI summarize + classify FIRST (no DB side-effects).
  // Crash before recordChange → retry re-runs AI (one extra API call, no data loss).
  // Crash after recordChange but before attachAiAnalysis → snapshot exists without summary, acceptable.
  let aiResult: Awaited<ReturnType<typeof runAiAnalysisIfEligible>> = null;
  if (redis) {
    aiResult = await runAiAnalysisIfEligible(redis, {
      monitorId,
      teamPlan: monitor.teamPlan,
      trialEndsAt: monitor.teamTrialEndsAt,
      subscriptionStatus: monitor.teamSubscriptionStatus,
      previousContent,
      nextContent: content,
    });
  }

  // 7a. Persist new snapshot (history row + hot column) — abort before notifying
  // so retries see no diff and don't double-notify.
  try {
    await contentSnapshotWorkerRepository.recordChange(monitorId, monitor.teamId, content, checkedAt, contentHash);
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to update content snapshot, skipping notification');
    return;
  }

  if (aiResult) {
    const attached = await contentSnapshotWorkerRepository.attachAiAnalysis({
      monitorId,
      capturedAt: checkedAt,
      summary: aiResult.summary,
      classification: aiResult.classification,
      confidence: aiResult.confidence,
      model: aiResult.model,
    });
    logger.info(
      {
        service,
        monitorId,
        classification: aiResult.classification,
        model: aiResult.model,
        inputTokens: aiResult.inputTokens,
        outputTokens: aiResult.outputTokens,
        rowsUpdated: attached,
      },
      'AI analysis attached to snapshot'
    );
  }

  // 7c. Suppress alerts for high-confidence noise only (confidence >= 0.8).
  // Low-confidence noise classifications still fire an alert so users see the change.
  if (aiResult?.classification === 'noise' && (aiResult.confidence ?? 0) >= 0.8) {
    logger.info(
      { service, monitorId, summary: aiResult.summary },
      'Change classified as noise — suppressing alert'
    );
    return;
  }

  // 7d. Notify all active channels.
  // Competitor monitors skip per-change notifications unless instant alerts is enabled —
  // changes are batched into the daily digest instead. Use live DB values (not job payload)
  // so a mid-flight toggle is respected.
  if (monitor.isCompetitor && !monitor.instantAlerts) {
    logger.info({ service, monitorId }, 'Competitor change recorded — skipping per-change alert (digest mode)');
    return;
  }

  if (notifyQueue) {
    await notifyQueue.add('content-notify', {
      teamId: monitor.teamId,
      monitorName: monitor.name,
      monitorUrl: url,
      monitorId,
      changedAt: checkedAt.toISOString(),
      summary: aiResult?.summary,
      classification: aiResult?.classification,
      appUrl: env.APP_URL,
    });
  } else {
    logger.warn({ service, monitorId }, 'No notify queue provided — content change notification skipped');
  }
}
