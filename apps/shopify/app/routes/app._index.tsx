import { type LoaderFunctionArgs } from "react-router";
import { useLoaderData, Link as RouterLink } from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Banner,
  Box,
  Divider,
  type BoxProps,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import { prisma, checkResultRepository } from "@beaconmon/db";
import { PLAN_LIMITS, type DailyUptimeStat } from "@beaconmon/types";
import { getShopifyStatus } from "../lib/shopify-status.server";
import { UptimeBar, aggregateUptime } from "../components/UptimeBar";

// Shopify-provisioned stores are on the free plan. The uptime bar honors the
// free-plan history retention window rather than special-casing it.
const UPTIME_DAYS = PLAN_LIMITS.free.historyDays;

function isBFCMWeek(): boolean {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed: November = 10, December = 11
  const day = now.getDate();
  return (month === 10 && day >= 25) || (month === 11 && day <= 3);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  // Fetched regardless of provisioning state so the platform-incident banner
  // shows even moments after install.
  const shopifyStatus = await getShopifyStatus();

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  if (!install?.teamId) {
    return {
      shop,
      monitors: [] as MonitorView[],
      incidentCount: 0,
      shopifyStatus,
      avgHourlyRevenue: 0,
      incidentStartedAt: null as string | null,
      isBFCM: isBFCMWeek(),
      checklist: {
        watching: false,
        email: false,
        slack: false,
        keyPage: false,
        competitor: false,
      },
    };
  }

  const teamId = install.teamId;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [rawMonitors, incidentCount, emailChannel, slackChannel, keyPageCount, competitorCount] =
    await Promise.all([
      prisma.monitor.findMany({
        where: { teamId, deletedAt: null },
        select: {
          id: true,
          name: true,
          url: true,
          currentStatus: true,
          lastCheckedAt: true,
          nextCheckAt: true,
          isActive: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.incident.count({
        where: { teamId, startedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.alertChannel.findFirst({
        where: { teamId, type: "email", isActive: true },
        select: { id: true },
      }),
      prisma.alertChannel.findFirst({
        where: { teamId, type: "slack", isActive: true },
        select: { id: true },
      }),
      prisma.monitor.count({
        where: {
          teamId,
          deletedAt: null,
          isActive: true,
          tags: { has: "shopify-page" },
        },
      }),
      prisma.competitor.count({
        where: { teamId, isActive: true, deletedAt: null },
      }),
    ]);

  const monitorIds = rawMonitors.map((m) => m.id);
  const downMonitorIds = rawMonitors
    .filter((m) => m.isActive && m.currentStatus === "down")
    .map((m) => m.id);

  const [dailyStatsMap, responseTimeStats, earliestOpenIncident, latestSslAlert] = await Promise.all([
    checkResultRepository.getDailyUptimeStats(monitorIds, UPTIME_DAYS),
    checkResultRepository.getResponseTimeStats(monitorIds, 24),
    downMonitorIds.length > 0
      ? prisma.incident.findFirst({
          where: { monitorId: { in: downMonitorIds }, resolvedAt: null },
          orderBy: { startedAt: "asc" },
          select: { startedAt: true },
        })
      : Promise.resolve(null),
    prisma.expiryAlert.findFirst({
      where: { teamId, type: "ssl" },
      orderBy: { createdAt: "desc" },
      select: { monitorId: true, daysRemaining: true, sentAt: true },
    }),
  ]);

  const settings = (install.settings as Record<string, unknown>) ?? {};
  const avgHourlyRevenue =
    typeof settings.avgHourlyRevenue === "number" ? settings.avgHourlyRevenue : 0;

  const monitors: MonitorView[] = rawMonitors.map((m) => {
    const stats = responseTimeStats.get(m.id) ?? null;
    return {
      id: m.id,
      name: m.name,
      url: m.url,
      currentStatus: m.currentStatus,
      isActive: m.isActive,
      lastCheckedAt: m.lastCheckedAt?.toISOString() ?? null,
      nextCheckAt: m.nextCheckAt?.toISOString() ?? null,
      dailyStats: dailyStatsMap.get(m.id) ?? [],
      responseTimeAvg: stats?.avg ?? null,
      responseTimeMin: stats?.min ?? null,
      responseTimeMax: stats?.max ?? null,
    };
  });

  // Approximate current days remaining: stored daysRemaining minus days elapsed since alert.
  let sslWarning: { monitorName: string; daysRemaining: number } | null = null;
  if (latestSslAlert) {
    const daysSinceSent = Math.floor(
      (Date.now() - new Date(latestSslAlert.sentAt).getTime()) / 86_400_000
    );
    const approxDays = latestSslAlert.daysRemaining - daysSinceSent;
    if (approxDays >= 0 && approxDays <= 30) {
      const monitorName =
        rawMonitors.find((m) => m.id === latestSslAlert.monitorId)?.name ?? "your store";
      sslWarning = { monitorName, daysRemaining: Math.max(0, approxDays) };
    }
  }

  return {
    shop,
    monitors,
    incidentCount,
    shopifyStatus,
    avgHourlyRevenue,
    incidentStartedAt: earliestOpenIncident?.startedAt?.toISOString() ?? null,
    isBFCM: isBFCMWeek(),
    sslWarning,
    checklist: {
      watching: rawMonitors.some((m) => m.isActive),
      email: !!emailChannel,
      slack: !!slackChannel,
      keyPage: keyPageCount > 0,
      competitor: competitorCount > 0,
    },
  };
};

type MonitorView = {
  id: string;
  name: string;
  url: string;
  currentStatus: string;
  isActive: boolean;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  dailyStats: DailyUptimeStat[];
  responseTimeAvg: number | null;
  responseTimeMin: number | null;
  responseTimeMax: number | null;
};

function statusBadge(monitor: MonitorView) {
  if (!monitor.isActive) {
    return <Badge tone="attention">Paused</Badge>;
  }
  switch (monitor.currentStatus) {
    case "up":
      return <Badge tone="success">Up</Badge>;
    case "down":
      return <Badge tone="critical">Down</Badge>;
    default:
      return <Badge tone="attention">Paused</Badge>;
  }
}

function formatCheckedAt(iso: string | null): string {
  if (!iso) return "never";
  const d = new Date(iso);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (diffMin < 2) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function formatNextCheck(iso: string | null, now: number): string | null {
  if (!iso) return null;
  const diffMs = new Date(iso).getTime() - now;
  if (diffMs <= 0) return "next check due now";
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "next check in under 1m";
  return `next check in ${min}m`;
}

// One subdued line under each monitor: latency stats, next check, and last check.
function metaLine(m: MonitorView, now: number): string {
  const parts: string[] = [];
  if (m.responseTimeAvg !== null) {
    const rtPart =
      m.responseTimeMin !== null && m.responseTimeMax !== null
        ? `avg ${m.responseTimeAvg}ms (${m.responseTimeMin} to ${m.responseTimeMax}ms)`
        : `${m.responseTimeAvg}ms avg`;
    parts.push(rtPart);
  }
  if (m.isActive) {
    const next = formatNextCheck(m.nextCheckAt, now);
    if (next) parts.push(next);
  }
  parts.push(`checked ${formatCheckedAt(m.lastCheckedAt)}`);
  return parts.join(" · ");
}

function MonitorRow({ m, now }: { m: MonitorView; now: number }) {
  const uptime = aggregateUptime(m.dailyStats);

  return (
    <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
      <BlockStack gap="050">
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          {m.name}
        </Text>
        <Text as="span" variant="bodySm" tone="subdued">
          {m.url}
        </Text>
        <Text as="span" variant="bodySm" tone="subdued">
          {metaLine(m, now)}
        </Text>
      </BlockStack>
      <InlineStack gap="400" blockAlign="center" wrap={false}>
        <BlockStack gap="100" inlineAlign="center">
          <UptimeBar stats={m.dailyStats} />
          <Text as="span" variant="bodySm" tone="subdued">
            {uptime === null
              ? "No checks yet"
              : `${uptime.toFixed(2)}% · ${UPTIME_DAYS}d`}
          </Text>
        </BlockStack>
        {statusBadge(m)}
      </InlineStack>
    </InlineStack>
  );
}


type ChecklistStep = {
  done: boolean;
  label: string;
  to?: string;
  action?: string;
};

function ChecklistDot({ done }: { done: boolean }) {
  const background: BoxProps["background"] = done
    ? "bg-fill-success"
    : "bg-fill-disabled";
  return (
    <Box
      background={background}
      borderRadius="full"
      width="16px"
      minHeight="16px"
    />
  );
}

function ActivationChecklist({
  checklist,
}: {
  checklist: {
    watching: boolean;
    email: boolean;
    slack: boolean;
    keyPage: boolean;
    competitor: boolean;
  };
}) {
  const steps: ChecklistStep[] = [
    { done: checklist.watching, label: "Watching your store" },
    {
      done: checklist.email,
      label: "Add an alert email",
      to: "/app/settings",
      action: "Add email",
    },
    {
      done: checklist.slack,
      label: "Connect Slack",
      to: "/app/settings",
      action: "Connect",
    },
    {
      done: checklist.keyPage,
      label: "Add a key page to watch",
      to: "/app/settings",
      action: "Add page",
    },
    {
      done: checklist.competitor,
      label: "Pick a competitor to track",
      to: "/app/competitors",
      action: "Pick one",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingMd">
            Finish setup
          </Text>
          <Badge tone={completed > 0 ? "info" : undefined}>
            {`${completed}/${steps.length}`}
          </Badge>
        </InlineStack>
        <BlockStack gap="300">
          {steps.map((s) => (
            <InlineStack key={s.label} align="space-between" blockAlign="center">
              <InlineStack gap="200" blockAlign="center">
                <ChecklistDot done={s.done} />
                <Text
                  as="span"
                  variant="bodyMd"
                  tone={s.done ? "subdued" : undefined}
                  textDecorationLine={s.done ? "line-through" : undefined}
                >
                  {s.label}
                </Text>
              </InlineStack>
              {!s.done && s.to && (
                <RouterLink to={s.to}>{s.action ?? "Set up"}</RouterLink>
              )}
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

export default function StatusHome() {
  const { shop, monitors, incidentCount, shopifyStatus, checklist, avgHourlyRevenue, incidentStartedAt, isBFCM, sslWarning } =
    useLoaderData<typeof loader>();

  // Re-render every 30s so the "next check in Nm" countdown stays fresh.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const activeMonitors = monitors.filter((m) => m.isActive);
  const downCount = activeMonitors.filter(
    (m) => m.currentStatus === "down",
  ).length;
  const allGreen = activeMonitors.length > 0 && downCount === 0;

  const revenueBanner = (() => {
    if (downCount === 0 || avgHourlyRevenue <= 0 || !incidentStartedAt) return null;
    const downtimeMins = Math.floor((now - new Date(incidentStartedAt).getTime()) / 60_000);
    if (downtimeMins <= 0) return null;
    const impact = Math.round((downtimeMins / 60) * avgHourlyRevenue);
    return { downtimeMins, impact };
  })();

  const bannerTone = allGreen ? "success" : downCount > 0 ? "critical" : "info";
  const bannerTitle = allGreen
    ? `${shop} is all clear`
    : downCount > 0
      ? `${downCount} monitor${downCount > 1 ? "s" : ""} down`
      : "Setting up monitoring...";
  const bannerBody = allGreen
    ? `${activeMonitors.length} monitors active.`
    : downCount > 0
      ? "Check the monitors below for details."
      : "Your monitors will appear here once the first checks run.";
  const shopifyIncidentNote = shopifyStatus
    ? ` Note: Shopify is reporting a platform incident: ${shopifyStatus.description.replace(/\.$/, "")}. If your store looks down, it may be related.`
    : "";

  return (
    <Page>
      <TitleBar title="Beaconmon" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Banner tone={bannerTone} title={bannerTitle}>
              <Text as="p" variant="bodyMd">
                {bannerBody}{shopifyIncidentNote}
              </Text>
            </Banner>

            {revenueBanner && (
              <Banner tone="warning" title="Revenue at risk">
                <Text as="p" variant="bodyMd">
                  Your store has been down for {revenueBanner.downtimeMins} minutes. Estimated revenue impact: ~${revenueBanner.impact.toLocaleString()}.
                </Text>
              </Banner>
            )}

            {isBFCM && activeMonitors.length > 0 && (
              <Banner tone="info" title="BFCM protection active">
                <Text as="p" variant="bodyMd">
                  Checking every 60 seconds through Cyber Monday so you catch outages the moment they happen.
                </Text>
              </Banner>
            )}

            {sslWarning && (
              <Banner tone="warning" title="SSL certificate expiring soon">
                <Text as="p" variant="bodyMd">
                  The SSL certificate for {sslWarning.monitorName} expires in approximately {sslWarning.daysRemaining} day{sslWarning.daysRemaining !== 1 ? "s" : ""}. Renew it before it lapses to avoid browser warnings for your customers.
                </Text>
              </Banner>
            )}

            <ActivationChecklist checklist={checklist} />

            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Monitors
                </Text>
                {monitors.length === 0 ? (
                  <Text as="p" variant="bodyMd" tone="subdued">
                    No monitors yet. Provisioning usually completes within a
                    minute of install.
                  </Text>
                ) : (
                  <BlockStack gap="0">
                    {monitors.map((m, i) => (
                      <Box key={m.id}>
                        {i > 0 && <Divider />}
                        <Box paddingBlockStart="300" paddingBlockEnd="300">
                          <MonitorRow m={m} now={now} />
                        </Box>
                      </Box>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">
                    Incidents (last 30 days)
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {incidentCount === 0
                      ? "No confirmed outages detected."
                      : "Confirmed outages detected by Beaconmon."}
                  </Text>
                </BlockStack>
                {incidentCount > 0 && (
                  <Text as="span" variant="heading2xl" tone="critical">
                    {incidentCount}
                  </Text>
                )}
              </InlineStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
