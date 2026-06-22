import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "~/shopify.server";
import { prisma } from "@beaconmon/db";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
      // No Protected Customer Data is held (zero orders/customers scopes).
      return new Response(null, { status: 200 });

    case "SHOP_REDACT": {
      const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
      if (!install) return new Response(null, { status: 200 });

      await prisma.$transaction(async (tx) => {
        if (install.teamId) {
          // Deleting the team cascades to monitors, alert channels, incidents,
          // and the ShopifyInstall row itself (its team_id FK is onDelete:
          // Cascade), so this single delete purges everything.
          await tx.team.delete({ where: { id: install.teamId } });
        }
        // Idempotent: removes the row only if it still exists (an unprovisioned
        // install has a null team_id and is not covered by the cascade above).
        await tx.shopifyInstall.deleteMany({ where: { shop } });
      });

      console.log(
        JSON.stringify({ event: "shop_redact", shop, at: new Date().toISOString() }),
      );

      return new Response(null, { status: 200 });
    }

    default:
      return new Response("Unexpected topic", { status: 400 });
  }
};
