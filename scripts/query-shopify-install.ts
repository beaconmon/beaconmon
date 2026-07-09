import { prisma } from '../packages/db/src/index.js';

async function main() {
  const installs = await prisma.shopifyInstall.findMany({ take: 5 });
  console.log('installs:', JSON.stringify(installs.map(i => ({ id: i.id, shop: i.shop, teamId: i.teamId, ownerEmail: i.ownerEmail, settings: i.settings })), null, 2));

  if (installs[0]?.teamId) {
    const [monitors, competitors, team, channels] = await Promise.all([
      prisma.monitor.findMany({
        where: { teamId: installs[0].teamId },
        select: { id: true, name: true, currentStatus: true, type: true, tags: true }
      }),
      prisma.competitor.findMany({
        where: { teamId: installs[0].teamId },
        select: { id: true, name: true, domain: true, discoveryState: true, isActive: true }
      }),
      prisma.team.findUnique({ where: { id: installs[0].teamId }, select: { id: true, plan: true } }),
      prisma.alertChannel.findMany({ where: { teamId: installs[0].teamId }, select: { id: true, type: true, isActive: true } }),
    ]);
    console.log('monitors:', JSON.stringify(monitors, null, 2));
    console.log('competitors:', JSON.stringify(competitors, null, 2));
    console.log('team:', JSON.stringify(team, null, 2));
    console.log('channels:', JSON.stringify(channels, null, 2));
  }
  await prisma.$disconnect();
}

main().catch(console.error);
