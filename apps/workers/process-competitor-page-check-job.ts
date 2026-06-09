import { createHash, randomUUID } from 'crypto';
import {
  Prisma,
  prisma,
  contentSnapshotWorkerRepository,
  competitorPageRepository,
} from '@beaconmon/db';
import { runContentCheck } from '@beaconmon/checker';
import { createAiProvider, scoreSiteChange, scoreRuleBased } from '@beaconmon/ai';
import type { CompetitorPageCheckJob, CompetitorNotifyJob, LifecycleEmailJob } from '@beaconmon/queue';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';
import { logger } from './lib/logger.js';
import { env } from './lib/env.js';
import { runAiAnalysisIfEligible } from './lib/ai-content-diff.js';

const service = 'competitor-page-worker';

// Atomically delete a Redis key only if the stored value matches the caller's token.
// Prevents a worker whose lock expired from deleting a successor's lock.
const RELEASE_LOCK_IF_OWNER = `if redis.call("get",KEYS[1])==ARGV[1] then return redis.call("del",KEYS[1]) else return 0 end`;

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
  notifyQueue: Queue<CompetitorNotifyJob>,
  lifecycleEmailQueue?: Queue<LifecycleEmailJob>
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
  const lockValue = randomUUID();
  const claimed = await redis.set(processingKey, lockValue, 'EX', PROCESSING_LOCK_TTL_S, 'NX');
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
      lifecycleEmailQueue,
      startedAt,
    });
  } finally {
    await redis.eval(RELEASE_LOCK_IF_OWNER, 1, processingKey, lockValue);
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
  lifecycleEmailQueue?: Queue<LifecycleEmailJob>;
  startedAt: number;
}

async function handleContentChange(args: ChangeArgs): Promise<void> {
  const {
    competitorPageId, teamId, competitorId, url, content, contentHash,
    checkedAt, now, intervalSeconds, redis, notifyQueue, lifecycleEmailQueue, startedAt,
  } = args;

  // Guard against concurrent workers double-processing the same new hash
  const dedupKey = `content:dedup:${competitorPageId}:${contentHash}`;
  const dedupClaimed = await redis.set(dedupKey, '1', 'EX', CHANGE_DEDUP_TTL_S, 'NX');
  if (!dedupClaimed) {
    logger.info({ service, competitorPageId }, 'Duplicate change skipped by dedup guard');
    return;
  }

  // If the work below fails, remove the dedup key so BullMQ can retry the job.
  // Successful completion (including noise suppression) intentionally leaves the key set.
  try {

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
  
    // Suppress events for high-confidence noise — persist snapshot for audit trail and future
    // AI diffs, but create no event or notification
    if (aiResult?.classification === 'noise' && (aiResult.confidence ?? 0) >= NOISE_CONFIDENCE_THRESHOLD) {
      logger.info({ service, competitorPageId, summary: aiResult.summary }, 'Change classified as noise — suppressing event');
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
      return;
    }
  
    const eventType: 'site_changed' | 'promo_detected' =
      aiResult?.classification === 'pricing' ? 'promo_detected' : 'site_changed';
  
    const significance = aiResult
      ? await scoreSiteChange(
          aiResult.summary,
          createAiProvider({ provider: env.AI_PROVIDER, apiKey: env.AI_API_KEY, model: env.AI_MODEL })
        )
      : scoreRuleBased(eventType, {});
  
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
          significance,
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
  
    // Send first-competitor-change lifecycle email if this is the team's first event
    if (lifecycleEmailQueue) {
      const eventCount = await prisma.competitorEvent.count({ where: { teamId } });
      if (eventCount === 1) {
        const owner = await prisma.teamMember.findFirst({
          where: { teamId, role: 'owner' },
          select: { user: { select: { email: true } } },
        });
        const ownerEmail = owner?.user.email;
        if (ownerEmail) {
          const dedupKey = `first:competitor:change:${teamId}`;
          await lifecycleEmailQueue
            .add(
              `lifecycle:first-competitor-change:${teamId}`,
              {
                teamId,
                emailType: 'first-competitor-change',
                payload: { pageUrl: url, diffSummary: aiResult?.summary ?? null, competitorEventId: eventId },
                dedupKey,
                ownerEmail,
              },
              { jobId: `lc_${dedupKey}` }
            )
            .then(() => {
              logger.info({ service, competitorPageId, teamId }, 'First competitor change lifecycle email enqueued');
            })
            .catch((err) => {
              logger.warn({ service, competitorPageId, err }, 'Failed to enqueue first-competitor-change lifecycle email');
            });
        }
      }
    }
  
  } catch (err) {
    await redis.del(dedupKey);
    throw err;
  }
}
