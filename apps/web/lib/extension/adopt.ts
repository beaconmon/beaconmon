import 'server-only';
import { prisma } from '@beaconmon/db';
import { logger } from '@/lib/logger';

// Team adoption by email match (chrome-extension-mvp decision #14). A merchant
// who installed the Shopify App got a silently-provisioned team (uptime monitors,
// no member). When that same person later connects the extension via magic-link,
// we want their competitor monitors to land in THAT team, not a separate personal
// team. Magic-link verifies email ownership, so matching the verified user email
// against the shop's captured owner_email is a safe claim signal.
//
// Runs only in the extension token-mint path, so it never alters normal web
// signup behavior. Returns the team the extension token should be scoped to.
export async function resolveExtensionTeam(
  userId: string,
  email: string,
  fallbackTeamId: string
): Promise<string> {
  const install = await prisma.shopifyInstall.findFirst({
    where: {
      ownerEmail: { equals: email, mode: 'insensitive' },
      teamId: { not: null },
      uninstalledAt: null,
    },
    select: { shop: true, teamId: true },
  });

  const teamId = install?.teamId;
  if (!teamId || teamId === fallbackTeamId) return fallbackTeamId;

  // Only adopt a team that is unclaimed (no members — the silent-provision state)
  // or one this user already belongs to. A team with other members must not be
  // joined on an email match alone.
  const [memberCount, existing] = await Promise.all([
    prisma.teamMember.count({ where: { teamId } }),
    prisma.teamMember.findUnique({ where: { teamId_userId: { teamId, userId } } }),
  ]);

  if (memberCount > 0 && !existing) {
    logger.warn(
      { service: 'web', userId, shop: install?.shop, teamId },
      'Extension team adoption skipped: shop team already has other members'
    );
    return fallbackTeamId;
  }

  if (!existing) {
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: { teamId, userId, role: 'owner' },
      update: {},
    });
    logger.info(
      { service: 'web', userId, shop: install?.shop, teamId },
      'Extension adopted Shopify-provisioned team via email match'
    );
  }

  return teamId;
}
