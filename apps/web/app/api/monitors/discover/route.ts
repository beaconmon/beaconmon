import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { monitorRepository } from '@/lib/repositories/monitors';
import { PLAN_LIMITS } from '@beaconmon/types';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { discoverMonitors } from '@/lib/discovery';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { runSmartSetupOrDegrade } from '@/lib/discovery/smart-setup';
import { isWebAiSmartSetupEnabled } from '@/lib/ai';
import { logger } from '@/lib/logger';
import { getPostHogClient } from '@/lib/posthog-server';

const discoverSchema = z.object({
  domain: z.string().min(1).max(253),
});

function normalizeDomain(input: string): { domain: string; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { domain: '', error: 'Domain is required' };

  let hostname: string;
  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(candidate);
    hostname = parsed.hostname;
  } catch {
    return { domain: '', error: 'Could not read that domain' };
  }

  if (!hostname || hostname.length > 253) {
    return { domain: '', error: 'Invalid domain' };
  }
  if (!/^[a-z0-9.-]+$/i.test(hostname)) {
    return { domain: '', error: 'Domain contains invalid characters' };
  }
  if (!hostname.includes('.')) {
    return { domain: '', error: 'Domain must include a TLD' };
  }

  return { domain: hostname.toLowerCase() };
}

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  try {
    const rl = await rateLimit(`monitors:discover:${teamId}`, 10, 3600);
    if (!rl.allowed) {
      logger.warn({ service: 'web', teamId }, 'Discover rate limit exceeded');
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

  const parsed = discoverSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { domain, error } = normalizeDomain(parsed.data.domain);
  if (error) throw new ValidationError(error);

  const ssrfCheck = await isHostnameSafe(domain);
  if (!ssrfCheck.allowed) {
    throw new ValidationError(
      `We can't scan that host: ${ssrfCheck.reason ?? 'reserved address'}`
    );
  }

  const limits = PLAN_LIMITS[plan];
  const [existing, count] = await Promise.all([
    monitorRepository.findAll(teamId),
    monitorRepository.countByTeam(teamId),
  ]);
  const existingUrls = existing.map((m) => m.url);

  const totalBudgetMs = 30_000;
  const controller = new AbortController();
  const budgetTimer = setTimeout(() => controller.abort(), totalBudgetMs);

  try {
    const result = await discoverMonitors(
      domain,
      {
        existingUrls,
        planMonitorLimit: limits.monitors,
        existingMonitorCount: count,
        planMinIntervalSeconds: limits.checkIntervalSeconds,
      },
      controller.signal
    );

    try {
      getPostHogClient().capture({
        distinctId: teamId,
        event: 'monitors_discovered',
        properties: {
          domain,
          suggestion_count: result.suggestions.length,
          capped_by_plan: result.cappedByPlan,
        },
      });
    } catch {
      // PostHog not configured locally — non-fatal
    }

    const aiEnabled = isWebAiSmartSetupEnabled(plan);

    const { sitemapUrls: _, ...clientResult } = result;

    if (!aiEnabled) {
      return Response.json(clientResult);
    }

    logger.info({ service: 'web', teamId, domain }, 'smart_setup: running AI enrichment');

    const aiResult = await runSmartSetupOrDegrade({
      domain,
      baseline: result,
      ctx: {
        teamId,
        existingUrls,
        planMonitorLimit: limits.monitors,
        existingMonitorCount: count,
        planMinIntervalSeconds: limits.checkIntervalSeconds,
      },
      signal: controller.signal,
      budgets: { classifyMs: 22_000, perFetchMs: 5_000, totalEnrichMs: 8_000 },
    });

    // Spread AI result over baseline — aiResult.suggestions overrides when not degraded
    return Response.json({ ...clientResult, ...aiResult });
  } finally {
    clearTimeout(budgetTimer);
  }
});
