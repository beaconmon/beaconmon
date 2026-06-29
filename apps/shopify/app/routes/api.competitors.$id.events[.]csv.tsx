import { type LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { prisma, competitorTeamRepository } from "@beaconmon/db";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  const teamId = install?.teamId;
  if (!teamId) return new Response("Not provisioned", { status: 403 });

  const id = (params as Record<string, string>)["id"] ?? "";
  if (!id) return new Response("Missing competitor ID", { status: 400 });

  const url = new URL(request.url);
  const rawDays = parseInt(url.searchParams.get("days") ?? "30", 10);
  const days = Number.isFinite(rawDays) ? Math.min(Math.max(rawDays, 1), 90) : 30;

  let rows;
  try {
    rows = await competitorTeamRepository.findEventsForExport(teamId, id, { days });
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const csvLines: string[] = [
    "id,type,product,detected_at,payload",
    ...rows.map((r) => {
      const rawTitle = r.productTitle ?? "";
      // Strip leading formula-trigger characters to prevent spreadsheet injection.
      const safeTitle = rawTitle.replace(/^[=+\-@\t\r]+/, "");
      const product = safeTitle ? `"${safeTitle.replace(/"/g, '""')}"` : "";
      const payload = `"${JSON.stringify(r.payload).replace(/"/g, '""')}"`;
      return [r.id, r.type, product, r.detectedAt.toISOString(), payload].join(",");
    }),
  ];

  return new Response(csvLines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="competitor-events-${id}.csv"`,
    },
  });
};
