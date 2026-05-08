import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { prisma } from '@beaconmon/db';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

const updateSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  reportAgencyName: z.string().min(1).max(100).optional(),
  reportBrandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #1e40af')
    .optional(),
  reportLogoUrl: z.string().url().max(500).optional().nullable(),
});

export const PATCH = withAuth(async (req, { teamId, role }) => {
  if (role === 'viewer') throw new ForbiddenError();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { name, reportAgencyName, reportBrandColor, reportLogoUrl } = parsed.data;

  await prisma.team.update({
    where: { id: teamId },
    data: {
      ...(name !== undefined && { name }),
      ...(reportAgencyName !== undefined && { reportAgencyName }),
      ...(reportBrandColor !== undefined && { reportBrandColor }),
      ...(reportLogoUrl !== undefined && { reportLogoUrl }),
    },
  });

  logger.info({ service: 'web', teamId }, 'Team report settings updated');
  return Response.json({ updated: true });
});
