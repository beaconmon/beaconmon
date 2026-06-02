import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { competitorRepository } from '@/lib/repositories/competitors';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';
import { prisma } from '@beaconmon/db';

export const GET = withAuth(async (_req, { teamId }) => {
  const competitors = await competitorRepository.findAll(teamId);
  return Response.json(competitors);
});

const createCompetitorSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  platform: z.enum(['shopify', 'woocommerce', 'other']).default('other'),
});

export const POST = withAuth(async (req, { teamId, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = createCompetitorSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { name, url, platform } = parsed.data;
  const domain = new URL(url).hostname;

  const competitor = await prisma.competitor.create({
    data: {
      teamId,
      name,
      domain,
      platform,
      pages: {
        create: {
          teamId,
          label: name,
          url,
        },
      },
    },
    select: { id: true, name: true, domain: true, isActive: true },
  });

  return Response.json(competitor, { status: 201 });
});
