import { PrismaClient } from '../generated/prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@beaconmon.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@beaconmon.com',
      emailVerified: true,
    },
  });

  // Create a personal team for the demo user
  const team = await prisma.team.upsert({
    where: { id: 'seed-team-1' },
    update: {},
    create: {
      id: 'seed-team-1',
      name: "Demo's Workspace",
      plan: 'pro',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Add user as team owner
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: user.id } },
    update: {},
    create: {
      teamId: team.id,
      userId: user.id,
      role: 'owner',
    },
  });

  // Create sample monitors
  const now = new Date();

  await prisma.monitor.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'seed-monitor-1',
        teamId: team.id,
        name: 'My Website',
        url: 'https://example.com',
        type: 'http',
        isActive: true,
        currentStatus: 'up',
        intervalSeconds: 60,
        timeoutMs: 10000,
        nextCheckAt: now,
      },
      {
        id: 'seed-monitor-2',
        teamId: team.id,
        name: 'API Health',
        url: 'https://api.example.com/health',
        type: 'http',
        isActive: true,
        currentStatus: 'up',
        intervalSeconds: 60,
        timeoutMs: 10000,
        responseTimeThresholdMs: 2000,
        nextCheckAt: now,
      },
      {
        id: 'seed-monitor-3',
        teamId: team.id,
        name: 'example.com SSL',
        url: 'https://example.com',
        type: 'ssl',
        isActive: true,
        currentStatus: 'up',
        intervalSeconds: 3600,
        timeoutMs: 10000,
        nextCheckAt: now,
      },
    ],
  });

  // Create a default email alert channel
  await prisma.alertChannel.upsert({
    where: { id: 'seed-channel-1' },
    update: {},
    create: {
      id: 'seed-channel-1',
      teamId: team.id,
      name: 'Email Alerts',
      type: 'email',
      config: { recipients: ['demo@beaconmon.com'] },
      isActive: true,
    },
  });

  console.log('Seed complete.');
  console.log(`  Team: ${team.name} (${team.id})`);
  console.log(`  User: ${user.email} (${user.id})`);
  console.log('  Monitors: 3 created');
  console.log('  Alert channels: 1 created');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
