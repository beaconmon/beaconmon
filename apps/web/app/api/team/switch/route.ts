import { z } from 'zod';
import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';
import { ForbiddenError, ValidationError } from '@/lib/api/errors';

export const ACTIVE_TEAM_COOKIE = 'bm_active_team';

const switchSchema = z.object({ teamId: z.string().min(1) });

export const POST = withAuth(async (req, { userId }) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body', []);
  }

  const parsed = switchSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError('Validation error', parsed.error.issues);

  const { teamId } = parsed.data;
  const isMember = await teamRepository.isMember(teamId, userId);
  if (!isMember) throw new ForbiddenError();

  const res = Response.json({ teamId });
  res.headers.append(
    'Set-Cookie',
    [
      `${ACTIVE_TEAM_COOKIE}=${encodeURIComponent(teamId)}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${60 * 60 * 24 * 365}`,
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ]
      .filter(Boolean)
      .join('; ')
  );
  return res;
});
