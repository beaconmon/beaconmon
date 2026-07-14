import { withAuth } from '@/lib/api/with-auth';
import { teamRepository } from '@/lib/repositories/teams';

// Persists "onboarding is done" server-side so /today and /onboarding never
// disagree about it. Used when a user skips the wizard without creating any
// monitors (monitor count alone can't signal that).
export const POST = withAuth(async (_req, { teamId }) => {
  await teamRepository.markOnboardingComplete(teamId);
  return Response.json({ ok: true });
});
