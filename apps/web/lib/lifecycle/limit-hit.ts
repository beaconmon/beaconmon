import { prisma } from '@beaconmon/db';
import { logger } from '@/lib/logger';
import { getLifecycleEmailQueue, getQueueRedis } from '@/lib/queue';

const DEDUP_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const DEDUP_KEY_PREFIX = 'lifecycle:dedup:limit:hit:';

export async function enqueueLimitHitEmail(opts: {
  teamId: string;
  limitType: 'competitor' | 'monitor';
  currentCount: number;
  planLimit: number;
  planTier: string;
}): Promise<void> {
  const { teamId, limitType, currentCount, planLimit, planTier } = opts;

  try {
    const redis = getQueueRedis();
    const dedupKey = `limit:hit:${teamId}`;
    const redisKey = `${DEDUP_KEY_PREFIX}${teamId}`;

    const member = await prisma.teamMember.findFirst({
      where: { teamId, role: 'owner' },
      select: { user: { select: { email: true } } },
    });
    const ownerEmail = member?.user.email;
    if (!ownerEmail) return;

    // Atomic SET NX: only proceed if no email has been sent within the dedup window.
    const acquired = await redis.set(redisKey, '1', 'EX', DEDUP_TTL_SECONDS, 'NX');
    if (!acquired) return;

    const queue = getLifecycleEmailQueue();
    try {
      await queue.add(
        `lifecycle:limit_hit:${teamId}`,
        {
          teamId,
          emailType: 'limit_hit',
          payload: { limitType, currentCount, planLimit, planTier },
          dedupKey,
          ownerEmail,
        },
        { jobId: `lc_${dedupKey}` }
      );
    } catch (enqueueErr) {
      await redis.del(redisKey);
      throw enqueueErr;
    }
  } catch (err) {
    logger.warn({ service: 'web', teamId, err }, 'Failed to enqueue limit-hit lifecycle email, continuing');
  }
}
