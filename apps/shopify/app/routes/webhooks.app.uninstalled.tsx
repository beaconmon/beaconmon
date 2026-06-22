import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "~/shopify.server";
import { prisma } from "@beaconmon/db";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop } = await authenticate.webhook(request);

  if (topic !== "APP_UNINSTALLED") {
    return new Response("Unexpected topic", { status: 400 });
  }

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  if (!install || install.uninstalledAt) {
    return new Response(null, { status: 200 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.shopifyInstall.update({
      where: { shop },
      data: { uninstalledAt: new Date() },
    });

    if (install.teamId) {
      await tx.monitor.updateMany({
        where: { teamId: install.teamId, deletedAt: null },
        data: {
          isActive: false,
          currentStatus: "paused",
          pausedReason: "App uninstalled",
          pausedAt: new Date(),
        },
      });
    }
  });

  console.log(
    JSON.stringify({ event: "uninstall", shop, at: new Date().toISOString() }),
  );

  return new Response(null, { status: 200 });
};
