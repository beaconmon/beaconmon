import { withAuth } from '@/lib/api/with-auth';
import { contentSnapshotRepository } from '@/lib/repositories/content-snapshots';
import { getContentNotifyQueue } from '@/lib/queue';
import { NotFoundError } from '@/lib/api/errors';

type Params = { id: string; snapshotId: string; [key: string]: string };

export const POST = withAuth<Params>(async (_req, { teamId }, params) => {
  const snapshot = await contentSnapshotRepository.getByIdWithMeta(
    teamId,
    params.id,
    params.snapshotId
  );
  if (!snapshot) throw new NotFoundError();

  const notifyQueue = getContentNotifyQueue();
  await notifyQueue.add('content-notify', {
    teamId,
    monitorName: snapshot.monitorName,
    monitorUrl: snapshot.monitorUrl,
    monitorId: snapshot.monitorId!,
    changedAt: snapshot.capturedAt.toISOString(),
    summary: snapshot.diffSummary ?? undefined,
    classification: snapshot.classification ?? undefined,
    appUrl: process.env['BETTER_AUTH_URL'] ?? '',
  });

  return Response.json({ ok: true });
});
