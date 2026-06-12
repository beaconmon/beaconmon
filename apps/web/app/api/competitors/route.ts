import { z } from 'zod';
import { PLAN_LIMITS } from '@beaconmon/types';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, PlanLimitError, ValidationError } from '@/lib/api/errors';
import { getShopifyFeedQueue, getQueueRedis } from '@/lib/queue';
import { logger } from '@/lib/logger';
import { enqueueLimitHitEmail } from '@/lib/lifecycle/limit-hit';
import { assertPublicHttpUrl } from '@/lib/validations/public-url';

export const GET = withAuth(async (_req, { teamId }) => {
  const competitors = await competitorRepository.findAll(teamId);
  return Response.json(competitors);
});

const createCompetitorSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  platform: z.enum(['shopify', 'woocommerce', 'other']).default('other'),
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  const limit = PLAN_LIMITS[plan].competitorMonitors;
  if (limit !== -1) {
    const count = await competitorRepository.countActive(teamId);
    if (count >= limit) {
      void enqueueLimitHitEmail({ teamId, limitType: 'competitor', currentCount: count, planLimit: limit, planTier: plan });
      throw new PlanLimitError(`Your plan allows a maximum of ${limit} competitors`);
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = createCompetitorSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  // Competitor creation also creates a default tracked page the worker will fetch
  assertPublicHttpUrl(parsed.data.url);

  const competitor = await competitorRepository.create(teamId, parsed.data);

  if (parsed.data.platform === 'shopify') {
    try {
      const domain = new URL(parsed.data.url).hostname;
      const queue = getShopifyFeedQueue();
      const redis = getQueueRedis();
      await queue.add(
        'shopify-feed',
        { competitorId: competitor.id, teamId, domain },
        { jobId: `sf_${competitor.id}_initial` }
      );
      // Prevent scheduler from double-enqueueing within the same hour
      await redis.set(`shopify:scheduled:${competitor.id}`, '1', 'EX', 3600, 'NX');
      await competitorRepository.updateDiscoveryState(teamId, competitor.id, { discoveryState: 'syncing' });
    } catch (err) {
      logger.error({ competitorId: competitor.id, err }, 'Failed to enqueue initial Shopify feed job');
      // Fail open: scheduler will pick it up later
    }
  } else {
    await competitorRepository.updateDiscoveryState(teamId, competitor.id, { discoveryState: 'not_applicable' });
  }

  return Response.json(competitor, { status: 201 });
});
