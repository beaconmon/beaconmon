import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { isHostnameSafe } from '@/lib/discovery/ssrf-guard';
import { getWebAiProvider, isWebAiSmartSetupEnabled } from '@/lib/ai';
import { suggestCompetitors } from '@beaconmon/ai';
import { logger } from '@/lib/logger';

const inputSchema = z.object({
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

  if (!hostname || hostname.length > 253) return { domain: '', error: 'Invalid domain' };
  if (!/^[a-z0-9.-]+$/i.test(hostname)) return { domain: '', error: 'Domain contains invalid characters' };
  if (!hostname.includes('.')) return { domain: '', error: 'Domain must include a TLD' };

  return { domain: hostname.toLowerCase() };
}

export const POST = withAuth(async (req, { teamId, plan, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  if (!isWebAiSmartSetupEnabled(plan)) {
    return Response.json({ suggestions: [], degraded: true }, { status: 200 });
  }

  try {
    const rl = await rateLimit(`onboarding:suggest-competitors:${teamId}`, 5, 3600);
    if (!rl.allowed) {
      logger.warn({ service: 'web', teamId }, 'Suggest-competitors rate limit exceeded');
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

  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { domain, error } = normalizeDomain(parsed.data.domain);
  if (error) throw new ValidationError(error);

  const ssrfCheck = await isHostnameSafe(domain);
  if (!ssrfCheck.allowed) {
    throw new ValidationError(`We can't scan that host: ${ssrfCheck.reason ?? 'reserved address'}`);
  }

  let extractedText = `Domain: ${domain}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://${domain}`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const contentLength = res.headers.get('content-length');
      const maxSizeBytes = 1024 * 1024;
      if (!contentLength || parseInt(contentLength, 10) <= maxSizeBytes) {
        const html = await res.text();
        const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
        const descMatch =
          html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,300})["']/i) ??
          html.match(/<meta[^>]+content=["']([^"']{1,300})["'][^>]+name=["']description["']/i);
        const bodyText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2000);

        extractedText = [
          titleMatch?.[1] && `Title: ${titleMatch[1]}`,
          descMatch?.[1] && `Description: ${descMatch[1]}`,
          bodyText && `Body: ${bodyText}`,
        ]
          .filter(Boolean)
          .join('\n');
      }
    }
  } catch {
    // fetch failed, use domain-only prompt
  }

  try {
    const provider = getWebAiProvider();
    const result = await suggestCompetitors(provider, { domain, extractedText });
    return Response.json({ suggestions: result.competitors, degraded: false });
  } catch (err) {
    logger.warn({ service: 'web', teamId, domain, err }, 'Competitor suggestion AI call failed');
    return Response.json({ suggestions: [], degraded: true });
  }
});
