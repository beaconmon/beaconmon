import { createHash } from 'crypto';
import {
  prisma,
  contentSnapshotWorkerRepository,
  competitorPageRepository,
  competitorEventRepository,
} from '@beaconmon/db';
import { runContentCheck } from '@beaconmon/checker';
import type { CompetitorPageCheckJob, CompetitorNotifyJob } from '@beaconmon/queue';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import { logger } from './lib/logger.js';
import { runAiAnalysisIfEligible } from './lib/ai-content-diff.js';

const service = 'competitor-page-worker';

export async function processCompetitorPageCheckJob(
  data: CompetitorPageCheckJob,
  redis: Redis,
  notifyQueue: Queue<CompetitorNotifyJob>
): Promise<void> {
  const { competitorPageId, competitorId, teamId, url, selector } = data;
  const now = new Date();

  // 1. Load page with billing plan
  const page = await competitorPageRepository.findByIdWithPlan(competitorPageId);
  if (!page) {
    logger.warn({ service, competitorPageId }, 'CompetitorPage not found, skipping');
    return;
  }

  // 2. Processing dedup — prevent concurrent workers checking the same page simultaneously
  const processingKey = `cpc:processing:${competitorPageId}`;
  const claimed = await redis.set(processingKey, '1', 'EX', 120, 'NX');
  if (!claimed) {
    logger.info({ service, competitorPageId }, 'Skipping — already processing');
    return;
  }

  // 3. Fetch and parse
  const result = await runContentCheck({ monitorId: competitorPageId, url, selector, timeoutMs: 15000 });

  // 4. Fetch failed — advance schedule so we don't hammer a failing URL
  if (!result.success || result.content === null) {
    logger.warn({ service, competitorPageId, errorType: result.errorType }, 'Content check failed');
    await competitorPageRepository.updateAfterCheck(competitorPageId, {
      lastCheckedAt: now,
      nextCheckAt: new Date(now.getTime() + page.intervalSeconds * 1000),
    });
    return;
  }

  const { content, checkedAt } = result;
  const contentHash = createHash('sha256').update(content).digest('hex');

  // 5/6. First run — store initial snapshot, no event or notification
  if (page.lastSnapshotHash === null) {
    await contentSnapshotWorkerRepository.recordChangeForCompetitorPage(
      competitorPageId, teamId, content, checkedAt, contentHash
    );
    await competitorPageRepository.updateAfterCheck(competitorPageId, {
      lastSnapshotHash: contentHash,
      lastCheckedAt: now,
      nextCheckAt: new Date(now.getTime() + page.intervalSeconds * 1000),
    });
    logger.info({ service, competitorPageId }, 'First-run snapshot stored');
    return;
  }

  // 7. No change
  if (contentHash === page.lastSnapshotHash) {
    await competitorPageRepository.updateAfterCheck(competitorPageId, {
      lastCheckedAt: now,
      nextCheckAt: new Date(now.getTime() + page.intervalSeconds * 1000),
    });
    logger.info({ service, competitorPageId }, 'Content unchanged');
    return;
  }

  // 8. Change detected

  // 8a. Change-dedup: guard against concurrent workers double-processing the same new hash
  const dedupKey = `content:dedup:${competitorPageId}:${contentHash}`;
  const dedupClaimed = await redis.set(dedupKey, '1', 'EX', 60, 'NX');
  if (!dedupClaimed) {
    logger.info({ service, competitorPageId }, 'Duplicate change skipped by dedup guard');
    return;
  }

  // 8b. Load previous content for AI diff
  const prevRow = await prisma.contentSnapshot.findFirst({
    where: { competitorPageId },
    orderBy: { capturedAt: 'desc' },
    select: { content: true },
  });
  const prevContent = prevRow?.content ?? '';

  // 8c. Persist snapshot
  const snapshot = await contentSnapshotWorkerRepository.recordChangeForCompetitorPage(
    competitorPageId, teamId, content, checkedAt, contentHash
  );

  // 8d. AI analysis
  const aiResult = await runAiAnalysisIfEligible(redis, {
    monitorId: competitorPageId,
    teamPlan: page.teamPlan,
    trialEndsAt: page.teamTrialEndsAt,
    subscriptionStatus: page.teamSubscriptionStatus,
    previousContent: prevContent,
    nextContent: content,
  });

  // 8e. Attach AI result to snapshot
  if (aiResult) {
    await contentSnapshotWorkerRepository.attachAiAnalysisById(snapshot.id, {
      summary: aiResult.summary,
      classification: aiResult.classification,
      confidence: aiResult.confidence,
      model: aiResult.model,
    });
    logger.info(
      { service, competitorPageId, classification: aiResult.classification, model: aiResult.model },
      'AI analysis attached'
    );
  }

  // 8f. Suppress events for high-confidence noise
  if (aiResult?.classification === 'noise' && (aiResult.confidence ?? 0) >= 0.8) {
    logger.info({ service, competitorPageId, summary: aiResult.summary }, 'Change classified as noise — suppressing event');
    await competitorPageRepository.updateAfterCheck(competitorPageId, {
      lastSnapshotHash: contentHash,
      lastCheckedAt: now,
      nextCheckAt: new Date(now.getTime() + page.intervalSeconds * 1000),
    });
    return;
  }

  // 8g. Determine event type
  const eventType: 'site_changed' | 'promo_detected' =
    aiResult?.classification === 'pricing' ? 'promo_detected' : 'site_changed';

  // 8h. Create competitor event
  const { id: eventId } = await competitorEventRepository.createEvent({
    teamId,
    competitorId,
    pageId: competitorPageId,
    type: eventType,
    payload: {
      pageUrl: url,
      diffSummary: aiResult?.summary ?? null,
      classification: aiResult?.classification ?? null,
      aiConfidence: aiResult?.confidence ?? null,
    },
    detectedAt: now,
  });

  // 8i. Enqueue notification if channels are configured
  const channelCount = await prisma.competitorNotificationChannel.count({
    where: { competitorId },
  });
  if (channelCount > 0) {
    await notifyQueue.add('competitor-notify', { competitorEventId: eventId, teamId, competitorId });
  }

  logger.info({ service, competitorPageId, eventType, eventId }, 'Competitor page change detected');

  // 9. Update page check state with new hash
  await competitorPageRepository.updateAfterCheck(competitorPageId, {
    lastSnapshotHash: contentHash,
    lastCheckedAt: now,
    nextCheckAt: new Date(now.getTime() + page.intervalSeconds * 1000),
  });
}
