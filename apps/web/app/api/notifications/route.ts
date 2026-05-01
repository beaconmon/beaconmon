import { withAuth } from '@/lib/api/with-auth';
import { notificationsFeedRepository } from '@/lib/repositories/notifications-feed';

export const GET = withAuth(async (_req, { teamId, userId }) => {
  const feed = await notificationsFeedRepository.getFeed(teamId, userId);
  return Response.json(feed);
});

export const POST = withAuth(async (_req, { teamId, userId }) => {
  await notificationsFeedRepository.markAllRead(teamId, userId);
  return Response.json({ ok: true });
});
