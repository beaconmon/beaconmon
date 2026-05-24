import { withAuth } from '@/lib/api/with-auth';
import { contentSnapshotRepository } from '@/lib/repositories/content-snapshots';
import { listSnapshotsQuerySchema } from '@/lib/validations/content-snapshots';
import { NotFoundError, ValidationError } from '@/lib/api/errors';
import { getSnapshotRetentionLimit } from '@beaconmon/billing';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (req, { teamId, plan }, params) => {
  const ok = await contentSnapshotRepository.assertContentMonitor(teamId, params.id);
  if (!ok) throw new NotFoundError();

  const url = new URL(req.url);
  const parsed = listSnapshotsQuerySchema.safeParse({
    limit: url.searchParams.get('limit') ?? undefined,
  });
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  // Clamp to plan retention limit so callers can't see past their plan.
  const planLimit = getSnapshotRetentionLimit(plan);
  const effectiveLimit = Math.min(parsed.data.limit, planLimit);

  const snapshots = await contentSnapshotRepository.list(teamId, params.id, effectiveLimit);
  return Response.json({ snapshots, planLimit });
});
