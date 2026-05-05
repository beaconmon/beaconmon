import { withAuth } from '@/lib/api/with-auth';
import { notificationPreferenceRepository } from '@/lib/repositories/notification-preferences';
import { ForbiddenError } from '@/lib/api/errors';

// Owner/admin read-only summary of every member's primary-channel choice.
// Surfaced on the team settings page so admins can audit routing without
// being able to mutate someone else's personal preference.
export const GET = withAuth(async (_req, { teamId, role }) => {
  if (role === 'viewer') throw new ForbiddenError();
  const summary = await notificationPreferenceRepository.findTeamSummary(teamId);
  return Response.json(summary);
});
