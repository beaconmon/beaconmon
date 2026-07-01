import {
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  useLoaderData,
  useFetcher,
} from "react-router";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  ButtonGroup,
  TextField,
  Select,
  Banner,
  Box,
  Divider,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { prisma, competitorTeamRepository } from "@beaconmon/db";
import { PLAN_LIMITS, emailChannelConfigSchema } from "@beaconmon/types";
import { getShopifyFeedQueue, getQueueRedis } from "../lib/queue.server";

// ─── Loader ──────────────────────────────────────────────────────────────────

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });

  if (!install?.teamId) {
    return {
      provisioning: true as const,
      competitors: [] as { id: string; name: string; domain: string; platform: string; dataTier: string; discoveryState: string; isActive: boolean; createdAt: string }[],
      activeCompetitorId: null as string | null,
      events: [] as SerializedEvent[],
      nextCursor: null as string | null,
      competitorIntent: [] as string[],
      planLimit: 1 as number,
      activeCount: 0,
      atCap: false,
      ownerEmail: install?.ownerEmail ?? null,
    };
  }

  const teamId = install.teamId;
  const planLimit = PLAN_LIMITS.free.competitorMonitors as number;

  const [competitors, activeCount] = await Promise.all([
    competitorTeamRepository.findAll(teamId),
    competitorTeamRepository.countActive(teamId),
  ]);

  const atCap = planLimit !== -1 && activeCount >= planLimit;
  const activeCompetitor = competitors.find((c) => c.isActive) ?? competitors[0] ?? null;

  let events: SerializedEvent[] = [];
  let nextCursor: string | null = null;

  if (activeCompetitor) {
    const result = await competitorTeamRepository.findEvents(
      teamId,
      activeCompetitor.id,
      { limit: 20 }
    );
    nextCursor = result.nextCursor;
    events = result.events.map((e) => ({
      id: e.id,
      type: e.type,
      significance: e.significance,
      payload: e.payload,
      detectedAt: e.detectedAt.toISOString(),
      decision: e.decision
        ? { id: e.decision.id, response: e.decision.response, note: e.decision.note, decidedBy: e.decision.decidedBy }
        : null,
    }));
  }

  return {
    provisioning: false as const,
    competitors: competitors.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    activeCompetitorId: activeCompetitor?.id ?? null,
    events,
    nextCursor,
    competitorIntent: (install.competitorIntent as string[]) ?? [],
    planLimit,
    activeCount,
    atCap,
    ownerEmail: install.ownerEmail ?? null,
  };
};

// ─── Action ──────────────────────────────────────────────────────────────────

async function provisionDiscovery(
  competitorId: string,
  teamId: string,
  domain: string,
  platform: string
) {
  const queue = getShopifyFeedQueue();
  const redis = getQueueRedis();
  await queue.add(
    "catalog-sync",
    { competitorId, teamId, domain },
    { jobId: `sf_${competitorId}_initial` }
  );
  const guardKey =
    platform === "shopify"
      ? `shopify:scheduled:${competitorId}`
      : `probe:scheduled:${competitorId}`;
  await redis.set(guardKey, "1", "EX", 3600, "NX");
  await competitorTeamRepository.updateDiscoveryState(teamId, competitorId, {
    discoveryState: "syncing",
  });
}

async function autoWireEmail(
  teamId: string,
  ownerEmail: string | null,
  competitorId: string
) {
  let channel = await prisma.alertChannel.findFirst({
    where: { teamId, type: "email", isActive: true },
    select: { id: true },
  });
  if (!channel && ownerEmail) {
    const config = emailChannelConfigSchema.parse({ recipients: [ownerEmail] });
    channel = await prisma.alertChannel.create({
      data: { teamId, name: "Store owner email", type: "email", config },
      select: { id: true },
    });
  }
  if (channel) {
    await competitorTeamRepository.addChannel(teamId, competitorId, channel.id);
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  if (!install?.teamId) {
    return { ok: false as const, error: "Account not provisioned yet." };
  }
  const teamId = install.teamId;
  const ownerEmail = install.ownerEmail ?? null;

  const formData = await request.formData();
  const intent = formData.get("_intent") as string;

  // ── create ──────────────────────────────────────────────────────────────
  if (intent === "create") {
    const name = ((formData.get("name") as string) ?? "").trim();
    const rawUrl = ((formData.get("url") as string) ?? "").trim();
    const platform = ((formData.get("platform") as string) ?? "shopify") as
      | "shopify"
      | "woocommerce"
      | "other";

    if (!name || !rawUrl) {
      return { ok: false as const, error: "Name and URL are required." };
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
    } catch {
      return {
        ok: false as const,
        error: "Enter a valid URL, for example https://example.com.",
      };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false as const, error: "URL must use http or https." };
    }

    const limit = PLAN_LIMITS.free.competitorMonitors as number;
    const count = await competitorTeamRepository.countActive(teamId);
    if (limit !== -1 && count >= limit) {
      return {
        ok: false as const,
        error: `Your plan allows ${limit} competitor. Upgrade to track more.`,
      };
    }

    const competitor = await competitorTeamRepository.create(teamId, {
      name,
      url: parsed.href,
      platform,
    });

    try {
      await provisionDiscovery(competitor.id, teamId, parsed.hostname, platform);
    } catch {
      // Fail open: scheduler will pick it up later
    }

    try {
      await autoWireEmail(teamId, ownerEmail, competitor.id);
    } catch {
      // Fail open: merchant can add channel in settings
    }

    return { ok: true as const, intent: "create" };
  }

  // ── activate-from-intent ─────────────────────────────────────────────────
  if (intent === "activate-from-intent") {
    const domain = ((formData.get("domain") as string) ?? "").trim();
    if (!domain) return { ok: false as const, error: "Domain is required." };

    const limit = PLAN_LIMITS.free.competitorMonitors as number;
    const count = await competitorTeamRepository.countActive(teamId);
    if (limit !== -1 && count >= limit) {
      return {
        ok: false as const,
        error: `Your plan allows ${limit} competitor. Upgrade to track more.`,
      };
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(domain.startsWith("http") ? domain : `https://${domain}`);
    } catch {
      return { ok: false as const, error: "Invalid domain in watchlist." };
    }

    const competitor = await competitorTeamRepository.create(teamId, {
      name: parsedUrl.hostname,
      url: parsedUrl.href,
      platform: "shopify",
    });

    try {
      await provisionDiscovery(
        competitor.id,
        teamId,
        parsedUrl.hostname,
        "shopify"
      );
    } catch {
      // Fail open
    }

    try {
      await autoWireEmail(teamId, ownerEmail, competitor.id);
    } catch {
      // Fail open
    }

    const currentIntent = (install.competitorIntent as string[]) ?? [];
    await prisma.shopifyInstall.update({
      where: { shop },
      data: { competitorIntent: currentIntent.filter((d) => d !== domain) },
    });

    return { ok: true as const, intent: "activate-from-intent" };
  }

  // ── delete ───────────────────────────────────────────────────────────────
  if (intent === "delete") {
    const id = (formData.get("id") as string | null) ?? "";
    if (!id) return { ok: false as const, error: "Missing competitor ID." };
    await competitorTeamRepository.softDelete(teamId, id);
    return { ok: true as const, intent: "delete" };
  }

  // ── decision ─────────────────────────────────────────────────────────────
  if (intent === "decision") {
    const eventId = (formData.get("eventId") as string | null) ?? "";
    const response = (formData.get("response") as string | null) ?? "";
    if (!eventId || !response) {
      return { ok: false as const, error: "Missing event ID or response." };
    }

    if (response === "clear") {
      await competitorTeamRepository.deleteDecision(teamId, eventId);
    } else if (
      response === "match" ||
      response === "counter" ||
      response === "ignore"
    ) {
      const decidedBy = ownerEmail ?? "shopify";
      await competitorTeamRepository.upsertDecision(
        teamId,
        eventId,
        response,
        undefined,
        decidedBy
      );
    } else {
      return { ok: false as const, error: "Invalid response." };
    }

    return { ok: true as const, intent: "decision" };
  }

  return { ok: false as const, error: "Unknown action." };
};

// ─── Types ────────────────────────────────────────────────────────────────────

type SerializedEvent = {
  id: string;
  type: string;
  significance: string | null;
  payload: unknown;
  detectedAt: string;
  decision?: {
    id: string;
    response: string;
    note: string | null;
    decidedBy: string;
  } | null;
};

type LoaderCompetitor = {
  id: string;
  name: string;
  domain: string;
  platform: string;
  dataTier: string;
  discoveryState: string;
  isActive: boolean;
  createdAt: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function eventLabel(type: string): string {
  switch (type) {
    case "price_changed":
      return "Price changed";
    case "out_of_stock":
      return "Out of stock";
    case "back_in_stock":
      return "Back in stock";
    case "promo_detected":
      return "Promo detected";
    case "sale_started":
      return "Sale started";
    case "sale_ended":
      return "Sale ended";
    case "site_changed":
      return "Site changed";
    case "product_added":
      return "New product";
    case "product_removed":
      return "Product removed";
    case "stock_changed":
      return "Stock changed";
    default:
      return type.replace(/_/g, " ");
  }
}

function formatPayload(type: string, payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (type === "price_changed") {
    const old = p["oldPrice"] ?? p["old_price"];
    const next = p["newPrice"] ?? p["new_price"];
    const currency = (p["currency"] as string | undefined) ?? "";
    const cur = currency ? `${currency} ` : "";
    if (old != null && next != null) {
      return `${cur}${old} to ${cur}${next}`;
    }
  }
  if (type === "promo_detected" || type === "site_changed") {
    const summary = p["diffSummary"] ?? p["summary"] ?? p["changeType"];
    if (summary) return String(summary);
  }
  return null;
}

function significanceBadge(sig: string | null) {
  if (sig === "high") return <Badge tone="critical">High</Badge>;
  if (sig === "medium") return <Badge tone="attention">Medium</Badge>;
  return null;
}

function discoveryBadge(state: string) {
  switch (state) {
    case "syncing":
      return <Badge tone="attention">Syncing</Badge>;
    case "ready":
      return <Badge tone="success">Ready</Badge>;
    case "failed":
      return <Badge tone="critical">Sync failed</Badge>;
    default:
      return <Badge tone="new">Pending</Badge>;
  }
}

// ─── Components ───────────────────────────────────────────────────────────────

function CompetitorCard({
  competitor,
  onRemove,
  removing,
}: {
  competitor: LoaderCompetitor;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingMd">
                {competitor.name}
              </Text>
              {discoveryBadge(competitor.discoveryState)}
              {!competitor.isActive && <Badge tone="attention">Paused</Badge>}
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              {competitor.domain}
            </Text>
          </BlockStack>
          <Button
            variant="plain"
            tone="critical"
            onClick={onRemove}
            loading={removing}
          >
            Remove
          </Button>
        </InlineStack>
        {competitor.discoveryState === "syncing" && (
          <Text as="p" variant="bodySm" tone="subdued">
            Catalog sync in progress. Events will appear once the first check
            completes.
          </Text>
        )}
      </BlockStack>
    </Card>
  );
}

function EventRow({
  event,
  fetcher,
}: {
  event: SerializedEvent;
  fetcher: ReturnType<typeof useFetcher>;
}) {
  const isThisEvent = fetcher.formData?.get("eventId") === event.id;
  const isSubmitting = fetcher.state !== "idle" && isThisEvent;

  const optimisticResponse =
    fetcher.state !== "idle" && isThisEvent
      ? (fetcher.formData?.get("response") as string)
      : null;

  const currentDecision =
    optimisticResponse === "clear"
      ? null
      : (optimisticResponse ?? event.decision?.response ?? null);

  const detail = formatPayload(event.type, event.payload);

  function submitDecision(response: string) {
    fetcher.submit(
      { _intent: "decision", eventId: event.id, response },
      { method: "post" }
    );
  }

  return (
    <Box paddingBlockStart="300" paddingBlockEnd="300">
      <BlockStack gap="100">
        <InlineStack align="space-between" blockAlign="start" wrap={false}>
          <BlockStack gap="050">
            <InlineStack gap="200" blockAlign="center">
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {eventLabel(event.type)}
              </Text>
              {significanceBadge(event.significance)}
            </InlineStack>
            {detail && (
              <Text as="span" variant="bodySm" tone="subdued">
                {detail}
              </Text>
            )}
            <Text as="span" variant="bodySm" tone="subdued">
              {formatRelativeTime(event.detectedAt)}
            </Text>
          </BlockStack>

          {currentDecision ? (
            <InlineStack gap="200" blockAlign="center">
              <Badge
                tone={
                  currentDecision === "ignore"
                    ? "attention"
                    : currentDecision === "match"
                      ? "success"
                      : "info"
                }
              >
                {currentDecision.charAt(0).toUpperCase() +
                  currentDecision.slice(1)}
              </Badge>
              <Button
                variant="plain"
                size="micro"
                onClick={() => submitDecision("clear")}
                loading={isSubmitting && optimisticResponse === "clear"}
              >
                Clear
              </Button>
            </InlineStack>
          ) : (
            <ButtonGroup>
              <Button
                size="micro"
                onClick={() => submitDecision("match")}
                loading={isSubmitting && optimisticResponse === "match"}
                disabled={isSubmitting}
              >
                Match
              </Button>
              <Button
                size="micro"
                onClick={() => submitDecision("counter")}
                loading={isSubmitting && optimisticResponse === "counter"}
                disabled={isSubmitting}
              >
                Counter
              </Button>
              <Button
                size="micro"
                tone="critical"
                onClick={() => submitDecision("ignore")}
                loading={isSubmitting && optimisticResponse === "ignore"}
                disabled={isSubmitting}
              >
                Ignore
              </Button>
            </ButtonGroup>
          )}
        </InlineStack>
      </BlockStack>
    </Box>
  );
}

function EventsFeed({
  events,
  competitorId,
}: {
  events: SerializedEvent[];
  competitorId: string;
}) {
  const fetcher = useFetcher<typeof action>();

  if (events.length === 0) {
    return (
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingMd">
            Recent events
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            No events yet. Check back after the first catalog sync completes.
          </Text>
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="0">
        <Box paddingBlockEnd="300">
          <InlineStack align="space-between" blockAlign="center">
            <Text as="h2" variant="headingMd">
              Recent events
            </Text>
            <Button
              variant="plain"
              url={`/api/competitors/${competitorId}/events.csv?days=30`}
              download
            >
              Export CSV
            </Button>
          </InlineStack>
        </Box>
        {events.map((event, i) => (
          <Box key={event.id}>
            {i > 0 && <Divider />}
            <EventRow event={event} fetcher={fetcher} />
          </Box>
        ))}
      </BlockStack>
    </Card>
  );
}

function AddCompetitorForm() {
  const fetcher = useFetcher<typeof action>();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [platform, setPlatform] = useState("shopify");

  const submitting = fetcher.state !== "idle";
  const actionData = fetcher.data;
  const error = actionData && !actionData.ok ? actionData.error : undefined;

  function handleSubmit() {
    if (!name.trim() || !url.trim()) return;
    fetcher.submit(
      { _intent: "create", name, url, platform },
      { method: "post" }
    );
    setName("");
    setUrl("");
  }

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd">
            Add a competitor store
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Beaconmon will watch for price changes, promos, and stock events and
            alert you by email.
          </Text>
        </BlockStack>

        {error && <Banner tone="critical">{error}</Banner>}

        <TextField
          label="Name"
          value={name}
          onChange={setName}
          placeholder="Rival Store"
          autoComplete="off"
        />
        <TextField
          label="Store URL"
          value={url}
          onChange={setUrl}
          placeholder="https://rival.com"
          autoComplete="off"
        />
        <Select
          label="Platform"
          options={[
            { label: "Shopify", value: "shopify" },
            { label: "WooCommerce", value: "woocommerce" },
            { label: "Other", value: "other" },
          ]}
          value={platform}
          onChange={setPlatform}
        />
        <Box>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!name.trim() || !url.trim()}
          >
            Start tracking
          </Button>
        </Box>
      </BlockStack>
    </Card>
  );
}

function IntentActivationCard({ domains }: { domains: string[] }) {
  const fetcher = useFetcher<typeof action>();
  const activating = fetcher.state !== "idle";
  const activatingDomain = activating
    ? (fetcher.formData?.get("domain") as string | null)
    : null;

  return (
    <Card>
      <BlockStack gap="300">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd">
            Your watchlist
          </Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            You saved these domains earlier. Activate one to start live tracking.
          </Text>
        </BlockStack>
        <BlockStack gap="200">
          {domains.map((domain) => (
            <InlineStack key={domain} align="space-between" blockAlign="center">
              <Text as="span" variant="bodyMd">
                {domain}
              </Text>
              <Button
                size="micro"
                onClick={() =>
                  fetcher.submit(
                    { _intent: "activate-from-intent", domain },
                    { method: "post" }
                  )
                }
                loading={activatingDomain === domain}
                disabled={activating && activatingDomain !== domain}
              >
                Activate
              </Button>
            </InlineStack>
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Competitors() {
  const loaderData = useLoaderData<typeof loader>();
  const deleteFetcher = useFetcher<typeof action>();

  if (loaderData.provisioning) {
    return (
      <Page>
        <TitleBar title="Competitor Tracking" />
        <Layout>
          <Layout.Section>
            <Banner tone="info" title="Setting things up">
              <Text as="p" variant="bodyMd">
                Your account is being provisioned. This usually takes under a
                minute. Refresh the page to check.
              </Text>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const {
    competitors,
    activeCompetitorId,
    events,
    competitorIntent,
    atCap,
  } = loaderData;

  const activeCompetitor =
    competitors.find((c) => c.id === activeCompetitorId) ?? null;
  const removing =
    deleteFetcher.state !== "idle" &&
    deleteFetcher.formData?.get("id") === activeCompetitor?.id;

  return (
    <Page>
      <TitleBar title="Competitor Tracking" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {activeCompetitor && (
              <CompetitorCard
                competitor={activeCompetitor}
                onRemove={() =>
                  deleteFetcher.submit(
                    { _intent: "delete", id: activeCompetitor.id },
                    { method: "post" }
                  )
                }
                removing={removing}
              />
            )}

            {activeCompetitor && (
              <EventsFeed
                events={events}
                competitorId={activeCompetitor.id}
              />
            )}

            {!atCap && <AddCompetitorForm />}

            {!atCap && competitorIntent.length > 0 && (
              <IntentActivationCard domains={competitorIntent} />
            )}

            {atCap && (
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Competitor limit reached
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    You are tracking the maximum number of competitors on your
                    current plan. Remove an existing competitor to add a new
                    one.
                  </Text>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
