import type {
  AdminApiContext,
  Session,
} from "@shopify/shopify-app-react-router/server";
import { prisma } from "@beaconmon/db";
import { emailChannelConfigSchema } from "@beaconmon/types";

// Free-tier default. Kept conservative to protect the single VPS / Redis.
const DEFAULT_INTERVAL_SECONDS = 300;

// Best-effort fetch of the shop's contact email so we can wire a zero-config
// alert channel. Requires no extra scope (Shop basics are always readable by the
// app). Returns null on any failure so provisioning never blocks on it.
async function fetchShopEmail(admin: AdminApiContext): Promise<string | null> {
  try {
    const response = await admin.graphql(
      `#graphql
      query ShopContactEmail {
        shop {
          email
          contactEmail
        }
      }`,
    );
    const body = (await response.json()) as {
      data?: { shop?: { email?: string | null; contactEmail?: string | null } };
    };
    const shop = body.data?.shop;
    return shop?.email ?? shop?.contactEmail ?? null;
  } catch {
    return null;
  }
}

/**
 * Silent provisioning, run from the afterAuth hook once OAuth/token exchange has
 * completed (the ShopifyInstall row + offline token already exist via
 * storeSession). Idempotent: a no-op once the install has a teamId, so reinstall
 * and repeated auth are safe.
 *
 * Creates a dedicated free Team keyed to the shop, the two default uptime
 * monitors (storefront + checkout), a zero-config email alert channel, and
 * backfills ShopifyInstall.teamId.
 */
export async function provisionShopifyInstall({
  session,
  admin,
}: {
  session: Session;
  admin: AdminApiContext;
}): Promise<void> {
  const { shop } = session;

  // Fast path: already provisioned.
  const existing = await prisma.shopifyInstall.findUnique({ where: { shop } });
  if (existing?.teamId) return;

  const email = await fetchShopEmail(admin);

  await prisma.$transaction(async (tx) => {
    // Lock the row to serialize concurrent installs. At READ COMMITTED, two
    // simultaneous first-installs could both pass the findUnique check and each
    // create a Team, orphaning the first one. SELECT FOR UPDATE blocks the
    // second transaction until the first commits.
    await tx.$queryRawUnsafe(`SELECT id FROM "shopify_installs" WHERE "shop" = $1 FOR UPDATE`, shop);

    const current = await tx.shopifyInstall.findUnique({ where: { shop } });
    if (current?.teamId) return;

    const team = await tx.team.create({
      data: { name: shop, plan: "free" },
    });

    const now = new Date();
    await tx.monitor.createMany({
      data: [
        {
          teamId: team.id,
          name: "Storefront",
          url: `https://${shop}`,
          type: "http",
          intervalSeconds: DEFAULT_INTERVAL_SECONDS,
          nextCheckAt: now,
          tags: ["shopify-core"],
        },
        {
          teamId: team.id,
          name: "Checkout",
          url: `https://${shop}/checkout`,
          type: "http",
          intervalSeconds: DEFAULT_INTERVAL_SECONDS,
          nextCheckAt: now,
          tags: ["shopify-core"],
        },
      ],
    });

    if (email) {
      const config = emailChannelConfigSchema.parse({ recipients: [email] });
      await tx.alertChannel.create({
        data: {
          teamId: team.id,
          name: "Store owner email",
          type: "email",
          config,
        },
      });
    }

    // Backfill the shop -> team link. Upsert guards the (unexpected) case where
    // storeSession has not yet created the row.
    await tx.shopifyInstall.upsert({
      where: { shop },
      create: {
        shop,
        accessToken: session.accessToken ?? "",
        teamId: team.id,
        // Persisted so the Chrome extension can adopt this team on a matching
        // magic-link sign-in (chrome-extension-mvp decision #14).
        ownerEmail: email,
      },
      update: { teamId: team.id, ownerEmail: email },
    });
  });

  // Instrumentation (Coolify logs). `install` is a day-1 funnel metric.
  console.log(
    JSON.stringify({
      event: "install",
      shop,
      hasEmail: Boolean(email),
      at: new Date().toISOString(),
    }),
  );
}
