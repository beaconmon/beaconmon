import { withAuth } from '@/lib/api/with-auth';
import { statusPageRepository } from '@/lib/repositories/status-pages';
import { getRedis } from '@/lib/redis';
import { detectDnsProvider } from '@/lib/dns-provider-detect';
import { STATUS_PAGE_CACHE_PREFIX } from '@beaconmon/status-pages';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const page = await statusPageRepository.findById(teamId, params.id);
  if (!page) throw new NotFoundError();
  return Response.json(page);
});

const updateStatusPageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  customDomain: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  monitorIds: z.array(z.string()).optional(),
});

export const PUT = withAuth<Params>(async (req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateStatusPageSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const existing = await statusPageRepository.findById(teamId, params.id);
  if (!existing) throw new NotFoundError();

  const { monitorIds, ...rest } = parsed.data;

  // If the custom domain is changing, reset verification and clean up Redis
  const domainChanging =
    rest.customDomain !== undefined &&
    rest.customDomain !== existing.customDomain;

  const detectedDnsProvider = rest.customDomain
    ? await detectDnsProvider(rest.customDomain)
    : domainChanging
      ? null
      : undefined;

  const updateData = {
    ...rest,
    // Reset verified flag and re-detect provider whenever domain changes
    ...(domainChanging && { customDomainVerified: false }),
    ...(detectedDnsProvider !== undefined && { detectedDnsProvider }),
  };

  let updated: Awaited<ReturnType<typeof statusPageRepository.update>>;
  try {
    updated = await statusPageRepository.update(teamId, params.id, updateData, monitorIds);
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_MONITOR_IDS') {
      throw new ValidationError('One or more monitor IDs are invalid');
    }
    throw err;
  }

  const redis = getRedis();

  // Invalidate status page cache whenever monitors or public settings change
  if (updated && (monitorIds !== undefined || rest.isPublic !== undefined)) {
    try {
      await redis.del(`${STATUS_PAGE_CACHE_PREFIX}:${updated.slug}`);
    } catch (err) {
      logger.warn({ service: 'web', teamId, statusPageId: params.id, err }, 'Failed to invalidate status page cache');
    }
  }

  // Remove old custom domain from Redis when domain changes or page is made private
  const shouldRemoveDomain =
    (domainChanging && existing.customDomain) ||
    (rest.isPublic === false && existing.customDomain && existing.customDomainVerified);

  if (shouldRemoveDomain && existing.customDomain) {
    try {
      await redis.hdel('custom_domains', existing.customDomain);
    } catch (err) {
      logger.warn({ service: 'web', teamId, statusPageId: params.id, err }, 'Failed to remove old custom domain from Redis');
    }
  }

  logger.info({ service: 'web', teamId, statusPageId: params.id }, 'Status page updated');

  return Response.json(updated);
});
