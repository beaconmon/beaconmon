// Next.js instrumentation hook — runs once on server startup.
// Seeds the Redis `custom_domains` hash so middleware can resolve custom domains
// without a DB hit on every request.
// Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env['NEXT_RUNTIME'] !== 'nodejs') return;

  try {
    // Dynamic imports to avoid loading DB/Redis on edge workers
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
  } catch (err) {
    // Non-fatal — middleware falls back to pass-through on Redis miss
    const { logger } = await import('@/lib/logger');
    logger.error({ err }, 'Failed to seed custom domains into Redis');
  }
}
