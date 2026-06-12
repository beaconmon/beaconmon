import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/api/errors';
import { assertPublicHttpUrl } from '@/lib/validations/public-url';

const MAX_TRACKED_URLS = 50;

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const competitor = await competitorRepository.findById(teamId, params.id);
  if (!competitor) throw new NotFoundError();
  return Response.json(competitor);
});

const updateCompetitorSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  platform: z.enum(['shopify', 'woocommerce', 'other']).optional(),
  trackedProductUrls: z.array(z.string().url()).max(MAX_TRACKED_URLS).optional(),
});

export const PATCH = withAuth<Params>(async (req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateCompetitorSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  // Tracked product URLs feed the fallback-tier worker fetches, so they must be
  // public HTTPS URLs on the competitor's own domain.
  if (parsed.data.trackedProductUrls) {
    const existing = await competitorRepository.findById(teamId, params.id);
    if (!existing) throw new NotFoundError();
    const bareDomain = existing.domain.toLowerCase().replace(/^www\./, '');
    for (const url of parsed.data.trackedProductUrls) {
      assertPublicHttpUrl(url);
      const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
      if (host !== bareDomain && !host.endsWith(`.${bareDomain}`)) {
        throw new ValidationError(`URL ${url} is not on the competitor domain ${existing.domain}`);
      }
    }
  }

  const competitor = await competitorRepository.update(teamId, params.id, parsed.data);
  if (!competitor) throw new NotFoundError();
  return Response.json(competitor);
});

export const DELETE = withAuth<Params>(async (_req, { teamId, role }, params) => {
  if (role === 'viewer') throw new ForbiddenError();

  const deleted = await competitorRepository.softDelete(teamId, params.id);
  if (!deleted) throw new NotFoundError();

  return new Response(null, { status: 204 });
});
