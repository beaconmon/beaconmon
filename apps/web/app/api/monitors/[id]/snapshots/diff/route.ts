import { withAuth } from '@/lib/api/with-auth';
import { contentSnapshotRepository } from '@/lib/repositories/content-snapshots';
import { diffSnapshotsQuerySchema } from '@/lib/validations/content-snapshots';
import { NotFoundError, ValidationError } from '@/lib/api/errors';
import { diffLines } from '@/lib/text-diff';

type Params = { id: string; [key: string]: string };

// Cap raw content to avoid quadratic-time blowups in diffLines on huge pages.
const MAX_DIFF_BYTES = 256 * 1024;

function truncateToBytes(str: string, maxBytes: number): string {
  const buf = Buffer.from(str, 'utf8');
  if (buf.length <= maxBytes) return str;
  return buf.slice(0, maxBytes).toString('utf8');
}

export const GET = withAuth<Params>(async (req, { teamId }, params) => {
  const ok = await contentSnapshotRepository.assertContentMonitor(teamId, params.id);
  if (!ok) throw new NotFoundError();

  const url = new URL(req.url);
  const parsed = diffSnapshotsQuerySchema.safeParse({
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
  });
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const [fromSnap, toSnap] = await Promise.all([
    contentSnapshotRepository.getById(teamId, params.id, parsed.data.from),
    contentSnapshotRepository.getById(teamId, params.id, parsed.data.to),
  ]);

  if (!fromSnap || !toSnap) throw new NotFoundError();

  const truncated =
    Buffer.byteLength(fromSnap.content, 'utf8') > MAX_DIFF_BYTES ||
    Buffer.byteLength(toSnap.content, 'utf8') > MAX_DIFF_BYTES;

  const fromContent = truncated ? truncateToBytes(fromSnap.content, MAX_DIFF_BYTES) : fromSnap.content;
  const toContent = truncated ? truncateToBytes(toSnap.content, MAX_DIFF_BYTES) : toSnap.content;

  const lines = diffLines(fromContent, toContent);

  let added = 0;
  let removed = 0;
  for (const line of lines) {
    if (line.op === 'add') added++;
    else if (line.op === 'remove') removed++;
  }

  return Response.json({
    from: { id: fromSnap.id, capturedAt: fromSnap.capturedAt },
    to: { id: toSnap.id, capturedAt: toSnap.capturedAt },
    added,
    removed,
    truncated,
    lines,
  });
});
