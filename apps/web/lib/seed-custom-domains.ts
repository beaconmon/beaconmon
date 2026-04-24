export async function seedCustomDomains(): Promise<void> {
  const { prisma } = await import('@beaconmon/db');
  const { getRedis } = await import('@/lib/redis');
  const { logger } = await import('@/lib/logger');

  const pages = await prisma.statusPage.findMany({
    where: {
      customDomain: { not: null },
      customDomainVerified: true,
      isPublic: true,
    },
    select: { customDomain: true, slug: true },
  });

  if (pages.length === 0) return;

  const redis = getRedis();
  const args: string[] = [];
  for (const page of pages) {
    if (page.customDomain) {
      args.push(page.customDomain, page.slug);
    }
  }

  await redis.hset('custom_domains', ...args);

  logger.info({ count: pages.length }, 'Seeded custom domains into Redis');
}