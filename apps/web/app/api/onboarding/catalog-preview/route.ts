import 'server-only';
import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';
import { rateLimit, rateLimitResponse } from '@/lib/api/rate-limit';
import { logger } from '@/lib/logger';
import { fetchCatalogPreviews } from '@/lib/shopify/catalog-preview';

const bodySchema = z.object({
  domains: z.array(z.string().min(1)).min(1).max(5),
});

export const POST = withAuth(async (req, { teamId, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  try {
    const rl = await rateLimit(`onboarding:catalog-preview:${teamId}`, 20, 3600);
    if (!rl.allowed) {
      logger.warn({ service: 'web', teamId }, 'Catalog preview rate limit exceeded');
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

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const results = await fetchCatalogPreviews(parsed.data.domains);

  logger.info(
    { service: 'web', teamId, domainCount: results.length, errorCount: results.filter((r) => r.error).length },
    'Catalog preview complete'
  );

  return Response.json({ results });
});
