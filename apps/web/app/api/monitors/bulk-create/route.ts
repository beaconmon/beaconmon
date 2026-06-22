import { z } from 'zod';
import { prisma } from '@beaconmon/db';
import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { competitorRepository } from '@/lib/repositories/competitors';
import { createMonitorSchema } from '@/lib/validations/monitors';
import { PLAN_LIMITS } from '@beaconmon/types';
import { ForbiddenError, ValidationError, PlanLimitError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';
import { getPostHogClient } from '@/lib/posthog-server';
import { getLifecycleEmailQueue } from '@/lib/queue';
import { enqueueLimitHitEmail } from '@/lib/lifecycle/limit-hit';
import { assertPublicHttpUrl } from '@/lib/validations/public-url';

const bulkCreateSchema = z.object({
  monitors: z.array(createMonitorSchema).min(1).max(50),
  source: z.enum(['discovery', 'template', 'import', 'smart-setup', 'extension']).optional(),
});

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  try {
    const rl = await rateLimit(`monitors:bulk-create:${teamId}`, 20, 3600);
    if (!rl.allowed) {
      logger.warn({ service: 'web', teamId }, 'Bulk-create rate limit exceeded');
      return rateLimitResponse(rl.reset);
    }
  } catch {
    logger.warn({ service: 'web', teamId }, 'Rate limit Redis unavailable — failing open');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = bulkCreateSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { monitors: inputs, source } = parsed.data;
  const limits = PLAN_LIMITS[plan];

  if (limits.monitors !== -1) {
    const existing = await monitorRepository.countByTeam(teamId);
    if (existing + inputs.length > limits.monitors) {
      void enqueueLimitHitEmail({ teamId, limitType: 'monitor', currentCount: existing, planLimit: limits.monitors, planTier: plan });
      throw new PlanLimitError(
        `Your plan allows ${limits.monitors} monitors — you have ${existing} and tried to add ${inputs.length}.`
      );
    }
  }

  for (const input of inputs) {
    if (input.intervalSeconds < limits.checkIntervalSeconds) {
      throw new PlanLimitError(
        `Your plan minimum check interval is ${limits.checkIntervalSeconds}s`
      );
    }
  }

  const created = await monitorRepository.bulkCreate(teamId, inputs);

  logger.info(
    { service: 'web', teamId, count: created.length, source },
    'Monitors bulk-created'
  );

  // Sync competitor records for any isCompetitor inputs so the wire page can find them.
  // The monitors table is the checker's source of truth; the competitors table is the
  // intelligence domain's source of truth, so both need a row. Enforces the same
  // competitor plan limit as POST /api/competitors; inputs beyond the limit are
  // skipped with a log rather than failing the request, since the monitors are
  // already created at this point.
  const competitorInputs = inputs.filter((m) => m.isCompetitor);
  if (competitorInputs.length > 0) {
    const competitorLimit = PLAN_LIMITS[plan].competitorMonitors;
    let activeCount = await competitorRepository.countActive(teamId);
    for (const ci of competitorInputs) {
      try {
        assertPublicHttpUrl(ci.url);
        const domain = new URL(ci.url).hostname;
        const existing = await prisma.competitor.findFirst({ where: { teamId, domain, deletedAt: null } });
        if (existing) continue;
        if (competitorLimit !== -1 && activeCount >= competitorLimit) {
          logger.warn(
            { service: 'web', teamId, url: ci.url, limit: competitorLimit },
            'Competitor plan limit reached during bulk-create, skipping competitor record'
          );
          continue;
        }
        const competitor = await competitorRepository.create(teamId, { name: ci.name, url: ci.url, platform: 'other' });
        // Non-Shopify competitors have no catalog discovery; without this the
        // record stays 'pending' forever (POST /api/competitors does the same).
        await competitorRepository.updateDiscoveryState(teamId, competitor.id, { discoveryState: 'not_applicable' });
        activeCount++;
      } catch (err) {
        logger.warn({ service: 'web', teamId, url: ci.url, err }, 'Competitor record sync failed during bulk-create');
      }
    }
  }

  try {
    const ph = getPostHogClient();
    ph.capture({
      distinctId: teamId,
      event: 'monitors_bulk_created',
      properties: { count: created.length, source: source ?? 'manual' },
    });
    for (const m of created) {
      ph.capture({
        distinctId: teamId,
        event: 'monitor_created',
        properties: { type: m.type, intervalSeconds: m.intervalSeconds },
      });
    }
  } catch {
    // PostHog not configured locally — non-fatal
  }

  // Mark onboarding complete and enqueue welcome email (idempotent via updateMany + job dedup)
  try {
    const { count } = await prisma.team.updateMany({
      where: { id: teamId, onboardingCompletedAt: null },
      data: { onboardingCompletedAt: new Date() },
    });

    if (count > 0) {
      const teamWithOwner = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
          members: {
            where: { role: 'owner' },
            select: { user: { select: { email: true } } },
            take: 1,
          },
        },
      });

      const ownerEmail = teamWithOwner?.members[0]?.user.email;
      if (ownerEmail) {
        const competitorDomains = inputs
          .filter((m) => m.isCompetitor)
          .map((m) => {
            try {
              return new URL(m.url).hostname;
            } catch {
              return m.url;
            }
          });

        const dedupKey = `welcome:${teamId}`;
        await getLifecycleEmailQueue().add(
          `lifecycle:welcome:${teamId}`,
          { teamId, emailType: 'welcome', payload: { competitorDomains }, dedupKey, ownerEmail },
          { jobId: `lc_${dedupKey.replace(/:/g, '_')}` }
        );
      }
    }
  } catch (err) {
    logger.warn({ service: 'web', teamId, err }, 'Welcome email enqueue failed — scheduler will retry');
  }

  return Response.json({ created }, { status: 201 });
});
