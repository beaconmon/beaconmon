import { promises as dns } from 'dns';
import { withAuth } from '@/lib/api/with-auth';
import { statusPageRepository } from '@/lib/repositories/status-pages';
import { getRedis } from '@/lib/redis';
import { ErrorCode } from '@beaconmon/types';
import { logger } from '@/lib/logger';

type Params = { id: string; [key: string]: string };

function getAppHost(): string {
  const url = process.env['BETTER_AUTH_URL'] ?? process.env['NEXT_PUBLIC_APP_URL'] ?? '';
  try {
    return new URL(url).hostname;
  } catch {
    return 'localhost';
  }
}

export const POST = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  const page = await statusPageRepository.findById(teamId, params.id);
  if (!page) {
    return Response.json({ error: 'Not found', code: ErrorCode.RESOURCE_NOT_FOUND }, { status: 404 });
  }

  if (!page.customDomain) {
    return Response.json(
      { error: 'No custom domain configured', code: ErrorCode.VALIDATION_ERROR },
      { status: 400 }
    );
  }

  const appHost = getAppHost();

  // Perform DNS CNAME lookup
  let cnames: string[] = [];
  try {
    cnames = await dns.resolveCname(page.customDomain);
  } catch {
    return Response.json(
      {
        error: 'DNS verification failed',
        message: `Could not resolve CNAME for ${page.customDomain}. Please add a CNAME record pointing to ${appHost} and wait for DNS propagation.`,
        expectedCname: appHost,
      },
      { status: 422 }
    );
  }

  const verified = cnames.some((c) => c === appHost || c === `${appHost}.`);
  if (!verified) {
    return Response.json(
      {
        error: 'CNAME mismatch',
        message: `${page.customDomain} points to ${cnames.join(', ')} but expected ${appHost}.`,
        expectedCname: appHost,
        foundCnames: cnames,
      },
      { status: 422 }
    );
  }

  // Mark as verified in DB
  await statusPageRepository.verifyCustomDomain(teamId, params.id, true);

  // Register in Redis for middleware routing
  try {
    const redis = getRedis();
    await redis.hset('custom_domains', page.customDomain, page.slug);
  } catch (err) {
    logger.warn({ teamId, statusPageId: params.id, err }, 'Failed to register custom domain in Redis');
  }

  logger.info({ service: 'web', teamId, statusPageId: params.id, customDomain: page.customDomain }, 'Custom domain verified');

  return Response.json({ verified: true, customDomain: page.customDomain });
});
