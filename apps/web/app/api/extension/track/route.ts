import { z } from 'zod';
import { PLAN_LIMITS } from '@beaconmon/types';
import { prisma } from '@beaconmon/db';
import { withExtensionAuth } from '@/lib/api/with-extension-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, PlanLimitError, ValidationError } from '@/lib/api/errors';
import { getShopifyFeedQueue, getQueueRedis } from '@/lib/queue';
import { enqueueLimitHitEmail } from '@/lib/lifecycle/limit-hit';
import { assertPublicHttpUrl } from '@/lib/validations/public-url';
import { getPostHogClient } from '@/lib/posthog-server';
import { logger } from '@/lib/logger';

// One-click Track from the extension. The store was just X-rayed client-side, so
// we know it's Shopify: create a single full_catalog competitor and kick off the
// initial catalog-sync (price/new-product/on-sale detection). Mirrors the
// catalog-sync setup in POST /api/competitors, scoped by the bearer token's team.
const trackSchema = z.object({
  domain: z.string().min(1).max(255),
  name: z.string().min(1).max(100),
});

export const POST = withExtensionAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const domain = parsed.data.domain.trim().toLowerCase().replace(/^www\./, '');
  const url = `https://${domain}`;
  assertPublicHttpUrl(url);

  // Idempotent: re-tracking a store you already watch is a success, not a dupe
  // or a wasted plan slot.
  const existing = await prisma.competitor.findFirst({
    where: { teamId, domain, deletedAt: null },
    select: { id: true },
  });
  if (existing) {
    return Response.json({ ok: true, alreadyTracking: true }, { status: 200 });
  }

  // Free competitor cap. Same enforcement as POST /api/competitors so the
  // extension and the web app agree on the limit.
  const limit = PLAN_LIMITS[plan].competitorMonitors;
  if (limit !== -1) {
    const count = await competitorRepository.countActive(teamId);
    if (count >= limit) {
      void enqueueLimitHitEmail({ teamId, limitType: 'competitor', currentCount: count, planLimit: limit, planTier: plan });
      throw new PlanLimitError(`Your plan allows a maximum of ${limit} competitors`);
    }
  }

  const competitor = await competitorRepository.create(teamId, {
    name: parsed.data.name,
    url,
    platform: 'shopify',
  });

  // Enqueue the initial catalog sync; guard against the scheduler double-firing
  // within the hour. Fail open — the scheduler picks it up if enqueue fails.
  try {
    const queue = getShopifyFeedQueue();
    const redis = getQueueRedis();
    await queue.add(
      'catalog-sync',
      { competitorId: competitor.id, teamId, domain },
      { jobId: `sf_${competitor.id}_initial` }
    );
    await redis.set(`shopify:scheduled:${competitor.id}`, '1', 'EX', 3600, 'NX');
    await competitorRepository.updateDiscoveryState(teamId, competitor.id, { discoveryState: 'syncing' });
  } catch (err) {
    logger.error({ service: 'web', competitorId: competitor.id, err }, 'Failed to enqueue extension catalog sync');
  }

  try {
    getPostHogClient().capture({
      distinctId: teamId,
      event: 'competitor_created',
      properties: { source: 'extension', domain },
    });
  } catch {
    // PostHog not configured locally — non-fatal.
  }

  logger.info({ service: 'web', teamId, competitorId: competitor.id, source: 'extension' }, 'Competitor tracked from extension');
  return Response.json({ ok: true }, { status: 201 });
});
