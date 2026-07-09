/**
 * Seeds realistic demo data for Shopify app screenshots.
 * Run with: DATABASE_URL=... pnpm exec tsx scripts/seed-shopify-demo.ts
 */
import { prisma } from '../packages/db/src/index.js';

const TEAM_ID = 'cmqp44yeo0002ygfbuesqcr0i';
const SHOP = 'beaconmon-test-store.myshopify.com';
const COMPETITOR_ID = 'cmr0omgpl0000tefbx5zlnd3m';
const EMAIL_CHANNEL_ID = 'cmqp44yg10005ygfb6xlry65q';

const MONITORS = {
  checkout:  'cmqp44yfe0004ygfbz7voiv5p',
  storefront: 'cmqp44yfd0003ygfbjbkdd3tt',
  giftCardPage: 'cmqp5y1ap0007ygfbb5k219jy',
  giftCardOos: 'cmqp5y7qx0008ygfbwi9t0br2',
  contactPage: 'cmqp5yzs60009ygfb1zclfmej',
};

const now = new Date();
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const MIN = 60 * 1000;

function daysAgo(d: number, offsetMs = 0) {
  return new Date(now.getTime() - d * DAY + offsetMs);
}

async function main() {
  console.log('Seeding Shopify demo data...');

  // 1. Fix the URL-named monitor
  await prisma.monitor.update({
    where: { id: MONITORS.giftCardPage },
    data: { name: 'Gift Card Page' },
  });
  console.log('Fixed monitor name');

  // 2. Set avgHourlyRevenue in ShopifyInstall settings
  await prisma.shopifyInstall.update({
    where: { shop: SHOP },
    data: { settings: { avgHourlyRevenue: 850 } },
  });
  console.log('Updated ShopifyInstall settings');

  // 3. Update monitor lastCheckedAt and nextCheckAt
  const monitorIds = Object.values(MONITORS);
  for (const [i, id] of monitorIds.entries()) {
    await prisma.monitor.update({
      where: { id },
      data: {
        lastCheckedAt: new Date(now.getTime() - (90 + i * 15) * 1000),
        nextCheckAt: new Date(now.getTime() + (30 - i * 5) * 1000),
        currentStatus: 'up',
      },
    });
  }
  console.log('Updated monitor timestamps');

  // 4. Clear existing check results and incidents to avoid duplicates
  await prisma.checkResult.deleteMany({
    where: { monitorId: { in: monitorIds } },
  });
  await prisma.incident.deleteMany({ where: { teamId: TEAM_ID } });
  console.log('Cleared existing check results and incidents');

  // 5. Seed 7 days of hourly check results
  // Incident window: Checkout was down for ~47 min, 4 days ago
  const incidentStart = daysAgo(4, -2 * HOUR);
  const incidentEnd = new Date(incidentStart.getTime() + 47 * MIN);

  const checkResults: {
    monitorId: string;
    checkedAt: Date;
    success: boolean;
    statusCode: number | null;
    responseTimeMs: number | null;
    errorMessage: string | null;
    region: string;
  }[] = [];

  for (let d = 7; d >= 0; d--) {
    for (let h = 0; h < 24; h++) {
      const checkedAt = daysAgo(d, h * HOUR + Math.floor(Math.random() * 30) * 1000);
      if (checkedAt > now) continue;

      for (const [name, monitorId] of Object.entries(MONITORS)) {
        const isCheckoutDuringIncident =
          name === 'checkout' &&
          checkedAt >= incidentStart &&
          checkedAt <= incidentEnd;

        const baseRt = { checkout: 210, storefront: 185, giftCardPage: 290, giftCardOos: 310, contactPage: 260 }[name] ?? 220;
        const jitter = Math.floor((Math.random() - 0.5) * 80);

        checkResults.push({
          monitorId,
          checkedAt,
          success: !isCheckoutDuringIncident,
          statusCode: isCheckoutDuringIncident ? 503 : 200,
          responseTimeMs: isCheckoutDuringIncident ? null : baseRt + jitter,
          errorMessage: isCheckoutDuringIncident ? 'Service unavailable' : null,
          region: 'us-east',
        });
      }
    }
  }

  await prisma.checkResult.createMany({ data: checkResults, skipDuplicates: true });
  console.log(`Inserted ${checkResults.length} check results`);

  // 6. Create the resolved incident for Checkout
  await prisma.incident.create({
    data: {
      teamId: TEAM_ID,
      monitorId: MONITORS.checkout,
      startedAt: incidentStart,
      resolvedAt: incidentEnd,
      resolutionType: 'automatic',
    },
  });
  console.log('Created resolved incident');

  // 7. Clear and re-seed competitor events
  await prisma.competitorDecision.deleteMany({ where: { teamId: TEAM_ID } });
  await prisma.competitorEvent.deleteMany({ where: { teamId: TEAM_ID } });

  const events = [
    {
      type: 'price_changed',
      significance: 'high',
      payload: { oldPrice: 'USD 98', newPrice: 'USD 79', currency: 'USD', productTitle: 'Tree Dasher 2' },
      detectedAt: daysAgo(0, -2 * HOUR),
      decision: 'match',
    },
    {
      type: 'promo_detected',
      significance: 'high',
      payload: { diffSummary: 'Sitewide 20% off banner added to homepage' },
      detectedAt: daysAgo(0, -4 * HOUR),
      decision: null,
    },
    {
      type: 'product_added',
      significance: 'medium',
      payload: { title: 'Trail Runner SWT', category: 'Running', price: 'USD 135' },
      detectedAt: daysAgo(1, -9 * HOUR),
      decision: null,
    },
    {
      type: 'site_changed',
      significance: 'medium',
      payload: { diffSummary: 'Hero banner updated' },
      detectedAt: daysAgo(2, -3 * HOUR),
      decision: 'ignore',
    },
    {
      type: 'price_changed',
      significance: 'high',
      payload: { oldPrice: 'USD 125', newPrice: 'USD 105', currency: 'USD', productTitle: 'SuperLight Trainer' },
      detectedAt: daysAgo(3, -6 * HOUR),
      decision: 'counter',
    },
    {
      type: 'stock_changed',
      significance: 'medium',
      payload: { productTitle: 'Wool Runner 2', changeType: 'back_in_stock' },
      detectedAt: daysAgo(4, -1 * HOUR),
      decision: null,
    },
    {
      type: 'promo_detected',
      significance: 'high',
      payload: { diffSummary: 'Free shipping threshold lowered to $75' },
      detectedAt: daysAgo(5, -8 * HOUR),
      decision: 'ignore',
    },
  ];

  for (const ev of events) {
    const created = await prisma.competitorEvent.create({
      data: {
        teamId: TEAM_ID,
        competitorId: COMPETITOR_ID,
        type: ev.type,
        significance: ev.significance,
        payload: ev.payload,
        detectedAt: ev.detectedAt,
      },
    });

    if (ev.decision) {
      await prisma.competitorDecision.create({
        data: {
          teamId: TEAM_ID,
          eventId: created.id,
          response: ev.decision,
          decidedBy: 'haimanotgetu18@gmail.com',
        },
      });
    }
  }
  console.log(`Inserted ${events.length} competitor events`);

  // 8. Wire the email channel to the competitor if not already linked
  const existing = await prisma.competitorNotificationChannel.findFirst({
    where: { competitorId: COMPETITOR_ID, channelId: EMAIL_CHANNEL_ID },
  });
  if (!existing) {
    await prisma.competitorNotificationChannel.create({
      data: {
        competitor: { connect: { id: COMPETITOR_ID } },
        channel: { connect: { id: EMAIL_CHANNEL_ID } },
        team: { connect: { id: TEAM_ID } },
      },
    });
    console.log('Linked email channel to competitor');
  }

  console.log('Done. All demo data seeded.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
