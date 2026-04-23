import { withAuth } from '@/lib/api/with-auth';
import { statusPageRepository } from '@/lib/repositories/status-pages';
import { ErrorCode } from '@beaconmon/types';
import { z } from 'zod';
import { logger } from '@/lib/logger';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (_req, { teamId }, params) => {
  const page = await statusPageRepository.findById(teamId, params.id);

  if (!page) {
    return Response.json({ error: 'Not found', code: ErrorCode.RESOURCE_NOT_FOUND }, { status: 404 });
  }

  return Response.json(page);
});

const updateStatusPageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  customDomain: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  monitorIds: z.array(z.string()).optional(),
});

export const PUT = withAuth<Params>(async (req, { teamId, role }, params) => {
  if (role === 'viewer') {
    return Response.json({ error: 'Forbidden', code: ErrorCode.FORBIDDEN }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body', code: ErrorCode.VALIDATION_ERROR }, { status: 400 });
  }

  const parsed = updateStatusPageSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'Validation error', code: ErrorCode.VALIDATION_ERROR, issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await statusPageRepository.findById(teamId, params.id);
  if (!existing) {
    return Response.json({ error: 'Not found', code: ErrorCode.RESOURCE_NOT_FOUND }, { status: 404 });
  }

  const { monitorIds, ...rest } = parsed.data;

  let updated: Awaited<ReturnType<typeof statusPageRepository.update>>;
  try {
    updated = await statusPageRepository.update(teamId, params.id, rest, monitorIds);
  } catch (err) {
    if (err instanceof Error && err.message === 'INVALID_MONITOR_IDS') {
      return Response.json(
        { error: 'One or more monitor IDs are invalid', code: ErrorCode.VALIDATION_ERROR },
        { status: 400 }
      );
    }
    throw err;
  }

  logger.info({ service: 'web', teamId, statusPageId: params.id }, 'Status page updated');

  return Response.json(updated);
});
