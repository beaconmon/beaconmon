import { prisma } from '@beaconmon/db';
import { withAuth } from '@/lib/api/with-auth';
import { mintExtensionToken } from '@/lib/extension/token';
import { resolveExtensionTeam } from '@/lib/extension/adopt';
import { UnauthorizedError } from '@/lib/api/errors';
import { logger } from '@/lib/logger';

// Mint a bearer token for the Chrome extension. Session-authed: the connect page
// is same-origin (beaconmon.com) so the magic-link session cookie is present.
// The page hands the returned token to the extension via runtime.sendMessage.
export const POST = withAuth(async (_req, { userId, teamId }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) throw new UnauthorizedError();

  // Adopt the user's Shopify-provisioned team if their email matches, so
  // competitor monitors land beside their uptime monitors in one team.
  const scopedTeamId = await resolveExtensionTeam(userId, user.email, teamId);

  // One live token per user: reconnecting revokes the old one so a token left on
  // an old machine stops working once the extension is re-paired elsewhere.
  await prisma.extensionToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const token = await mintExtensionToken(userId, scopedTeamId);
  const team = await prisma.team.findUnique({
    where: { id: scopedTeamId },
    select: { name: true },
  });

  logger.info({ service: 'web', userId, teamId: scopedTeamId }, 'Extension token minted');
  return Response.json({ token, teamName: team?.name ?? null }, { status: 201 });
});
