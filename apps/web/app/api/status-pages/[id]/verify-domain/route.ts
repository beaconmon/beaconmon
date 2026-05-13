import { promises as dns } from 'dns';
import { withAuth } from '@/lib/api/with-auth';
import { statusPageRepository } from '@/lib/repositories/status-pages';
import { getRedis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { createCustomHostname } from '@/lib/cloudflare-saas';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

function getCnameTarget(): string {
  const explicit = process.env['CUSTOM_DOMAIN_CNAME_TARGET'];
  if (explicit) return explicit;
  const url = process.env['BETTER_AUTH_URL'] ?? process.env['NEXT_PUBLIC_APP_URL'] ?? '';
  try {
    return new URL(url).hostname;
  } catch {
    return 'localhost';
  }
}

export const POST = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const page = await statusPageRepository.findById(teamId, params.id);
  if (!page) throw new NotFoundError();

  if (!page.customDomain) {
    throw new ValidationError('No custom domain configured');
  }

  const cnameTarget = getCnameTarget();

  let cnames: string[] = [];
  try {
    cnames = await dns.resolveCname(page.customDomain);
  } catch {
    return Response.json(
      {
        error: 'DNS verification failed',
        message: `Could not resolve CNAME for ${page.customDomain}. Add a CNAME record pointing to ${cnameTarget} and wait for DNS propagation.`,
        expectedCname: cnameTarget,
      },
      { status: 422 }
    );
  }

  const verified = cnames.some((c) => c === cnameTarget || c === `${cnameTarget}.`);
  if (!verified) {
    return Response.json(
      {
        error: 'CNAME mismatch',
        message: `${page.customDomain} points to ${cnames.join(', ')} but expected ${cnameTarget}.`,
        expectedCname: cnameTarget,
        foundCnames: cnames,
      },
      { status: 422 }
    );
  }

  // Register with Cloudflare for SaaS — idempotent: skip if already registered
  let cfHostnameId = page.cloudflareHostnameId;
  if (!cfHostnameId) {
    try {
      cfHostnameId = await createCustomHostname(page.customDomain);
    } catch (err) {
      logger.warn({ teamId, statusPageId: params.id, err }, 'Failed to register custom hostname with Cloudflare for SaaS');
    }
  }

  await statusPageRepository.verifyCustomDomain(teamId, params.id, true, cfHostnameId);

  try {
    const redis = getRedis();
    await redis.hset('custom_domains', page.customDomain, page.slug);
  } catch (err) {
    logger.warn({ teamId, statusPageId: params.id, err }, 'Failed to register custom domain in Redis');
  }

  logger.info({ service: 'web', teamId, statusPageId: params.id, customDomain: page.customDomain }, 'Custom domain verified');

  return Response.json({ verified: true, customDomain: page.customDomain });
});
