import { withAuth } from '@/lib/api/with-auth';
import { checkResultRepository } from '@/lib/repositories/check-results';
import { checkResultsQuerySchema } from '@/lib/validations/monitors';
import { NotFoundError, ValidationError } from '@/lib/api/errors';

type Params = { id: string; [key: string]: string };

export const GET = withAuth<Params>(async (req, { teamId, plan }, params) => {
  const url = new URL(req.url);
  const raw = {
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  };

  const parsed = checkResultsQuerySchema.safeParse(raw);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { from, to, limit } = parsed.data;

  const results = await checkResultRepository.findByMonitor(teamId, params.id, plan, {
    from: new Date(from),
    to: new Date(to),
    limit,
  });

  if (results === null) throw new NotFoundError();

  return Response.json(results);
});
