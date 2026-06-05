import { createHash } from 'crypto';
import {
  Prisma,
  prisma,
  contentSnapshotWorkerRepository,
  competitorPageRepository,
} from '@beaconmon/db';
import { runContentCheck } from '@beaconmon/checker';
import type { CompetitorPageCheckJob, CompetitorNotifyJob } from '@beaconmon/queue';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import { logger } from './lib/logger.js';
import { runAiAnalysisIfEligible } from './lib/ai-content-diff.js';

const service = 'competitor-page-worker';

const PROCESSING_LOCK_TTL_S = 120;
const CHANGE_DEDUP_TTL_S = 300;
const CONTENT_CHECK_TIMEOUT_MS = 15_000;
const NOISE_CONFIDENCE_THRESHOLD = 0.8;

function computeNextCheckAt(now: Date, intervalSeconds: number): Date {
  return new Date(now.getTime() + intervalSeconds * 1000);
}

export async function processCompetitorPageCheckJob(
  data: CompetitorPageCheckJob,
  redis: Redis,
  notifyQueue: Queue<CompetitorNotifyJob>
): Promise<void> {
  const { competitorPageId } = data;
  const startedAt = Date.now();

  logger.info({ service, competitorPageId }, 'Competitor page check started');

  const page = await competitorPageRepository.findByIdWithPlan(competitorPageId);
  if (!page) {
    logger.warn({ service, competitorPageId }, 'CompetitorPage not found, skipping');
    return;
  }

  const { url, selector, teamId, competitorId } = page;
  const now = new Date();

  // Prevent concurrent workers from checking the same page simultaneously
  const processingKey = `cpc:processing:${competitorPageId}`;
  const claimed = await redis.set(processingKey, '1', 'EX', PROCESSING_LOCK_TTL_S, 'NX');
  if (!claimed) {
    logger.info({ service, competitorPageId }, 'Skipping — already processing');
    return;
  }

  try {
    const result = await runContentCheck({
      monitorId: competitorPageId,
      url,
      selector: selector ?? undefined,
      timeoutMs: CONTENT_CHECK_TIMEOUT_MS,
    });

    if (!result.success || result.content === null) {
      logger.warn({ service, competitorPageId, errorType: result.errorType }, 'Content check failed');
      await competitorPageRepository.updateAfterCheck(competitorPageId, {
        lastCheckedAt: now,
        nextCheckAt: computeNextCheckAt(now, page.intervalSeconds),
      });
      return;
    }

    const { content, checkedAt } = result;
    const contentHash = createHash('sha256').update(content).digest('hex');

    if (page.lastSnapshotHash === null) {
      await handleFirstRun(competitorPageId, teamId, content, checkedAt, contentHash, now, page.intervalSeconds);
      return;
    }

    if (contentHash === page.lastSnapshotHash) {
      await handleNoChange(competitorPageId, now, page.intervalSeconds, startedAt);
      return;
    }

    await handleContentChange({
      competitorPageId,
      teamId,
      competitorId,
      url,
      content,
      contentHash,
      checkedAt,
      now,
      intervalSeconds: page.intervalSeconds,
      teamPlan: page.teamPlan,
      teamTrialEndsAt: page.teamTrialEndsAt,
      teamSubscriptionStatus: page.teamSubscriptionStatus,
      redis,
      notifyQueue,
      startedAt,
    });
  } finally {
    await redis.del(processingKey);
  }
}

async function handleFirstRun(
  competitorPageId: string,
  teamId: string,
  content: string,
  checkedAt: Date,
  contentHash: string,
  now: Date,
  intervalSeconds: number
): Promise<void> {
  await prisma.$transaction([
    prisma.contentSnapshot.create({
      data: { competitorPageId, teamId, content, contentHash, capturedAt: checkedAt },
    }),
    prisma.competitorPage.update({
      where: { id: competitorPageId },
      data: {
        lastSnapshotHash: contentHash,
        lastCheckedAt: now,
        nextCheckAt: computeNextCheckAt(now, intervalSeconds),
      },
    }),
  ]);
  logger.info({ service, competitorPageId }, 'First-run snapshot stored');
}

async function handleNoChange(
  competitorPageId: string,
  now: Date,
  intervalSeconds: number,
  startedAt: number
): Promise<void> {
  await competitorPageRepository.updateAfterCheck(competitorPageId, {
    lastCheckedAt: now,
    nextCheckAt: computeNextCheckAt(now, intervalSeconds),
  });
  logger.info({ service, competitorPageId, durationMs: Date.now() - startedAt }, 'Content unchanged');
}

interface ChangeArgs {
  competitorPageId: string;
  teamId: string;
  competitorId: string;
  url: string;
  content: string;
  contentHash: string;
  checkedAt: Date;
  now: Date;
  intervalSeconds: number;
  teamPlan: string;
  teamTrialEndsAt: Date | null;
  teamSubscriptionStatus: string | null;
  redis: Redis;
  notifyQueue: Queue<CompetitorNotifyJob>;
  startedAt: number;
}

async function handleContentChange(args: ChangeArgs): Promise<void> {
  const {
    competitorPageId, teamId, competitorId, url, content, contentHash,
    checkedAt, now, intervalSeconds, redis, notifyQueue, startedAt,
  } = args;

  // Guard against concurrent workers double-processing the same new hash
  const dedupKey = `content:dedup:${competitorPageId}:${contentHash}`;
  const dedupClaimed = await redis.set(dedupKey, '1', 'EX', CHANGE_DEDUP_TTL_S, 'NX');
  if (!dedupClaimed) {
    logger.info({ service, competitorPageId }, 'Duplicate change skipped by dedup guard');
    return;
  }

  // Load previous content for AI diff
  const prevRow = await prisma.contentSnapshot.findFirst({
    where: { competitorPageId },
    orderBy: { capturedAt: 'desc' },
    select: { content: true },
  });
  const prevContent = prevRow?.content ?? '';

  // AI analysis runs before the transaction so event type and noise suppression are informed by it
  const aiResult = await runAiAnalysisIfEligible(redis, {
    monitorId: competitorPageId,
    teamPlan: args.teamPlan,
    trialEndsAt: args.teamTrialEndsAt,
    subscriptionStatus: args.teamSubscriptionStatus,
    previousContent: prevContent,
    nextContent: content,
  });

  if (aiResult) {
    logger.info(
      { service, competitorPageId, classification: aiResult.classification, model: aiResult.model },
      'AI analysis complete'
    );
  }

  // Suppress events for high-confidence noise — only update page state, no event or notification
  if (aiResult?.classification === 'noise' && (aiResult.confidence ?? 0) >= NOISE_CONFIDENCE_THRESHOLD) {
    logger.info({ service, competitorPageId, summary: aiResult.summary }, 'Change classified as noise — suppressing event');
    await competitorPageRepository.updateAfterCheck(competitorPageId, {
      lastSnapshotHash: contentHash,
      lastCheckedAt: now,
      nextCheckAt: computeNextCheckAt(now, intervalSeconds),
    });
    return;
  }

  const eventType: 'site_changed' | 'promo_detected' =
    aiResult?.classification === 'pricing' ? 'promo_detected' : 'site_changed';

  // Atomically persist snapshot, event, and updated page hash — partial writes would
  // cause duplicate events on BullMQ retry once the dedup TTL expires
  const [snapshot, { id: eventId }] = await prisma.$transaction([
    prisma.contentSnapshot.create({
      data: { competitorPageId, teamId, content, contentHash, capturedAt: checkedAt },
      select: { id: true },
    }),
    prisma.competitorEvent.create({
      data: {
        teamId,
        competitorId,
        pageId: competitorPageId,
        type: eventType,
        payload: {
          pageUrl: url,
          diffSummary: aiResult?.summary ?? null,
          classification: aiResult?.classification ?? null,
          aiConfidence: aiResult?.confidence ?? null,
        } as Prisma.InputJsonValue,
        detectedAt: now,
      },
      select: { id: true },
    }),
    prisma.competitorPage.update({
      where: { id: competitorPageId },
      data: {
        lastSnapshotHash: contentHash,
        lastCheckedAt: now,
        nextCheckAt: computeNextCheckAt(now, intervalSeconds),
      },
    }),
  ]);

  logger.info({ service, competitorPageId, eventType, eventId, durationMs: Date.now() - startedAt }, 'Competitor page change detected');

  // Attach AI annotation to snapshot — best-effort, the event is already persisted
  if (aiResult) {
    try {
      await contentSnapshotWorkerRepository.attachAiAnalysisById(snapshot.id, {
        summary: aiResult.summary,
        classification: aiResult.classification,
        confidence: aiResult.confidence,
        model: aiResult.model,
      });
    } catch (err) {
      logger.warn({ service, competitorPageId, snapshotId: snapshot.id, err }, 'Failed to attach AI analysis to snapshot');
    }
  }

  // Enqueue notification if channels are configured — best-effort, the event is persisted regardless
  const channelCount = await prisma.competitorNotificationChannel.count({
    where: { competitorId },
  });
  if (channelCount > 0) {
    try {
      await notifyQueue.add('competitor-notify', { competitorEventId: eventId, teamId, competitorId });
    } catch (err) {
      logger.warn({ service, competitorPageId, eventId, err }, 'Failed to enqueue notification — event is persisted');
    }
  } else {
    logger.debug({ service, competitorPageId }, 'No notification channels configured');
  }
}
