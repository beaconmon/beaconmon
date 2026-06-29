import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { prisma, checkResultRepository } from "@beaconmon/db";
import { PLAN_LIMITS, planRetentionCutoff, type DailyUptimeStat } from "@beaconmon/types";
import { UptimeBar, aggregateUptime } from "../components/UptimeBar";

const DISPLAY_DAYS = 30;
// Shopify installs are on the free plan.
const RETENTION_DAYS = PLAN_LIMITS.free.historyDays;

function padStatsToDisplay(
  statsMap: Map<string, DailyUptimeStat[]>,
  monitorIds: string[],
): DailyUptimeStat[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Build per-date average across all monitors (only within retention window).
  const aggregated: DailyUptimeStat[] = [];

  for (let i = DISPLAY_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    if (i >= RETENTION_DAYS) {
      aggregated.push({ date: dateStr, state: "nodata", uptimePercent: 0 });
      continue;
    }

    const percents: number[] = [];
    for (const id of monitorIds) {
      const stat = statsMap.get(id)?.find((s) => s.date === dateStr);
      if (stat && stat.state !== "nodata") {
        percents.push(stat.uptimePercent);
      }
    }

    if (percents.length === 0) {
      aggregated.push({ date: dateStr, state: "nodata", uptimePercent: 0 });
    } else {
      const avg = percents.reduce((a, b) => a + b, 0) / percents.length;
      let state: DailyUptimeStat["state"];
      if (avg === 100) state = "up";
      else if (avg === 0) state = "outage";
      else state = "degraded";
      aggregated.push({ date: dateStr, state, uptimePercent: avg });
    }
  }

  return aggregated;
}

function formatDuration(startedAt: string, resolvedAt: string | null): string {
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const mins = Math.floor((end - new Date(startedAt).getTime()) / 60_000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type IncidentRow = {
  id: string;
  monitorName: string;
  startedAt: string;
  resolvedAt: string | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  if (!install?.teamId) {
    return {
      aggregateStats: [] as DailyUptimeStat[],
      overallUptime: null as number | null,
      incidents: [] as IncidentRow[],
      retentionDays: RETENTION_DAYS,
    };
  }

  const teamId = install.teamId;
  const retentionCutoff = planRetentionCutoff("free");

  const [monitors, rawIncidents] = await Promise.all([
    prisma.monitor.findMany({
      where: { teamId, deletedAt: null, isActive: true },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.incident.findMany({
      where: { teamId, startedAt: { gte: retentionCutoff } },
      orderBy: { startedAt: "desc" },
      take: 20,
      select: {
        id: true,
        startedAt: true,
        resolvedAt: true,
        monitor: { select: { name: true } },
      },
    }),
  ]);

  const monitorIds = monitors.map((m) => m.id);
  const dailyStatsMap = await checkResultRepository.getDailyUptimeStats(
    monitorIds,
    RETENTION_DAYS,
  );

  const aggregateStats = padStatsToDisplay(dailyStatsMap, monitorIds);
  const overallUptime = aggregateUptime(aggregateStats);

  const incidents: IncidentRow[] = rawIncidents.map((inc) => ({
    id: inc.id,
    monitorName: inc.monitor.name,
    startedAt: inc.startedAt.toISOString(),
    resolvedAt: inc.resolvedAt?.toISOString() ?? null,
  }));

  return { aggregateStats, overallUptime, incidents, retentionDays: RETENTION_DAYS };
};

export default function History() {
  const { aggregateStats, overallUptime, incidents, retentionDays } =
    useLoaderData<typeof loader>();

  const uptimeLabel =
    overallUptime === null
      ? "No data yet"
      : `${overallUptime.toFixed(2)}% uptime`;

  return (
    <Page>
      <TitleBar title="Uptime history" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h2" variant="headingMd">
                      Last {DISPLAY_DAYS} days
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Data shown for the last {retentionDays} days on your current plan. Upgrade for longer history.
                    </Text>
                  </BlockStack>
                  <Text as="span" variant="headingLg">
                    {uptimeLabel}
                  </Text>
                </InlineStack>

                <UptimeBar stats={aggregateStats} />

                <InlineStack gap="300">
                  {(["up", "degraded", "outage", "nodata"] as const).map((state) => {
                    const labels: Record<string, string> = {
                      up: "Operational",
                      degraded: "Degraded",
                      outage: "Outage",
                      nodata: "No data",
                    };
                    const tones: Record<string, "success" | "warning" | "critical" | undefined> = {
                      up: "success",
                      degraded: "warning",
                      outage: "critical",
                      nodata: undefined,
                    };
                    return (
                      <Badge key={state} tone={tones[state]}>
                        {labels[state]}
                      </Badge>
                    );
                  })}
                </InlineStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Incidents
                </Text>
                {incidents.length === 0 ? (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No incidents in this period.
                  </Text>
                ) : (
                  <BlockStack gap="0">
                    {incidents.map((inc, i) => (
                      <Box key={inc.id}>
                        {i > 0 && <Divider />}
                        <Box paddingBlockStart="300" paddingBlockEnd="300">
                          <InlineStack align="space-between" blockAlign="center">
                            <BlockStack gap="050">
                              <Text as="span" variant="bodyMd" fontWeight="semibold">
                                {inc.monitorName}
                              </Text>
                              <Text as="span" variant="bodySm" tone="subdued">
                                {formatDate(inc.startedAt)}
                              </Text>
                            </BlockStack>
                            <InlineStack gap="200" blockAlign="center">
                              <Text as="span" variant="bodySm" tone="subdued">
                                {formatDuration(inc.startedAt, inc.resolvedAt)}
                              </Text>
                              {inc.resolvedAt ? (
                                <Badge tone="success">Resolved</Badge>
                              ) : (
                                <Badge tone="critical">Ongoing</Badge>
                              )}
                            </InlineStack>
                          </InlineStack>
                        </Box>
                      </Box>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
