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
  TextField,
  Box,
  Divider,
  Badge,
  Tooltip,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { prisma } from "@beaconmon/db";
import {
  emailChannelConfigSchema,
  slackChannelConfigSchema,
  discordChannelConfigSchema,
} from "@beaconmon/types";

const MAX_EMAIL_RECIPIENTS = 3;
const MAX_CUSTOM_PAGES = 3;
const MAX_OOS_MONITORS = 10;
const DEFAULT_OOS_TEXT = "Sold out";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  if (!install?.teamId) {
    return {
      shop,
      teamId: null,
      emailRecipients: [] as string[],
      slackWebhookUrl: "",
      slackChannelId: null,
      discordWebhookUrl: "",
      discordChannelId: null,
      customPages: [],
      oosMonitors: [],
      avgHourlyRevenue: 0,
      statusPageUrl: null as string | null,
    };
  }

  const teamId = install.teamId;

  const [emailChannel, slackChannel, discordChannel, customPages, oosMonitors, statusPage] =
    await Promise.all([
      prisma.alertChannel.findFirst({
        where: { teamId, type: "email", isActive: true },
        select: { id: true, config: true },
      }),
      prisma.alertChannel.findFirst({
        where: { teamId, type: "slack", isActive: true },
        select: { id: true, config: true },
      }),
      prisma.alertChannel.findFirst({
        where: { teamId, type: "discord", isActive: true },
        select: { id: true, config: true },
      }),
      prisma.monitor.findMany({
        where: {
          teamId,
          deletedAt: null,
          isActive: true,
          tags: { has: "shopify-page" },
        },
        select: { id: true, name: true, url: true },
        take: MAX_CUSTOM_PAGES,
      }),
      prisma.monitor.findMany({
        where: {
          teamId,
          deletedAt: null,
          isActive: true,
          tags: { has: "shopify-oos" },
        },
        select: { id: true, name: true, url: true },
        take: MAX_OOS_MONITORS,
      }),
      prisma.statusPage.findFirst({ where: { teamId }, select: { slug: true } }),
    ]);

  const emailCfg = emailChannel?.config as { recipients?: string[] } | null;
  const slackCfg = slackChannel?.config as { webhookUrl?: string } | null;
  const discordCfg = discordChannel?.config as { webhookUrl?: string } | null;
  const settings = (install.settings as Record<string, unknown>) ?? {};
  const avgHourlyRevenue =
    typeof settings.avgHourlyRevenue === "number" ? settings.avgHourlyRevenue : 0;

  return {
    shop,
    teamId,
    emailRecipients: emailCfg?.recipients ?? [],
    slackWebhookUrl: slackCfg?.webhookUrl ?? "",
    slackChannelId: slackChannel?.id ?? null,
    discordWebhookUrl: discordCfg?.webhookUrl ?? "",
    discordChannelId: discordChannel?.id ?? null,
    customPages,
    oosMonitors,
    avgHourlyRevenue,
    statusPageUrl: statusPage ? `https://beaconmon.com/status/${statusPage.slug}` : null,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const formData = await request.formData();
  const _action = formData.get("_action") as string;

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  if (!install?.teamId) {
    return { ok: false, error: "Account not provisioned yet." };
  }
  const teamId = install.teamId;

  if (_action === "save-revenue") {
    const raw = (formData.get("avgHourlyRevenue") as string | null)?.trim() ?? "";
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0) {
      return { ok: false, _action, error: "Enter a valid amount (0 or more)." };
    }
    const currentSettings = (install.settings as Record<string, unknown>) ?? {};
    await prisma.shopifyInstall.update({
      where: { shop },
      data: { settings: { ...currentSettings, avgHourlyRevenue: value } },
    });
    return { ok: true, _action };
  }

  if (_action === "add-email-recipient") {
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const parsed = emailChannelConfigSchema.safeParse({ recipients: [email] });
    if (!parsed.success) {
      return { ok: false, _action, error: "Enter a valid email address." };
    }
    const existing = await prisma.alertChannel.findFirst({
      where: { teamId, type: "email" },
    });
    const current = (existing?.config as { recipients?: string[] } | null)?.recipients ?? [];
    if (current.includes(email)) {
      return { ok: true, _action };
    }
    if (current.length >= MAX_EMAIL_RECIPIENTS) {
      return { ok: false, _action, error: `Up to ${MAX_EMAIL_RECIPIENTS} email addresses allowed.` };
    }
    const recipients = [...current, email];
    if (existing) {
      await prisma.alertChannel.update({
        where: { id: existing.id },
        data: { config: { recipients }, isActive: true },
      });
    } else {
      await prisma.alertChannel.create({
        data: { teamId, name: "Alert email", type: "email", config: { recipients } },
      });
    }
    return { ok: true, _action };
  }

  if (_action === "remove-email-recipient") {
    const email = (formData.get("email") as string | null)?.trim() ?? "";
    const existing = await prisma.alertChannel.findFirst({
      where: { teamId, type: "email" },
    });
    if (!existing) return { ok: true, _action };
    const current = (existing.config as { recipients?: string[] } | null)?.recipients ?? [];
    const recipients = current.filter((r) => r !== email);
    if (recipients.length === 0) {
      await prisma.alertChannel.update({
        where: { id: existing.id },
        data: { isActive: false },
      });
    } else {
      await prisma.alertChannel.update({
        where: { id: existing.id },
        data: { config: { recipients } },
      });
    }
    return { ok: true, _action };
  }

  if (_action === "save-slack") {
    const webhookUrl =
      (formData.get("webhookUrl") as string | null)?.trim() ?? "";
    const parsed = slackChannelConfigSchema.safeParse({ webhookUrl });
    if (!parsed.success) {
      return { ok: false, _action, error: "Enter a valid Slack webhook URL." };
    }
    const existing = await prisma.alertChannel.findFirst({
      where: { teamId, type: "slack" },
    });
    if (existing) {
      await prisma.alertChannel.update({
        where: { id: existing.id },
        data: { config: parsed.data, isActive: true },
      });
    } else {
      await prisma.alertChannel.create({
        data: {
          teamId,
          name: "Slack",
          type: "slack",
          config: parsed.data,
        },
      });
    }
    return { ok: true, _action };
  }

  if (_action === "remove-slack") {
    await prisma.alertChannel.updateMany({
      where: { teamId, type: "slack" },
      data: { isActive: false },
    });
    return { ok: true, _action };
  }

  if (_action === "save-discord") {
    const webhookUrl =
      (formData.get("webhookUrl") as string | null)?.trim() ?? "";
    const parsed = discordChannelConfigSchema.safeParse({ webhookUrl });
    if (!parsed.success) {
      return { ok: false, _action, error: "Enter a valid Discord webhook URL." };
    }
    const existing = await prisma.alertChannel.findFirst({
      where: { teamId, type: "discord" },
    });
    if (existing) {
      await prisma.alertChannel.update({
        where: { id: existing.id },
        data: { config: parsed.data, isActive: true },
      });
    } else {
      await prisma.alertChannel.create({
        data: { teamId, name: "Discord", type: "discord", config: parsed.data },
      });
    }
    return { ok: true, _action };
  }

  if (_action === "remove-discord") {
    await prisma.alertChannel.updateMany({
      where: { teamId, type: "discord" },
      data: { isActive: false },
    });
    return { ok: true, _action };
  }

  if (_action === "add-page") {
    const url = (formData.get("url") as string | null)?.trim() ?? "";
    const name = (formData.get("name") as string | null)?.trim() || url;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") throw new Error();
    } catch {
      return { ok: false, _action, error: "URL must be a valid https:// address." };
    }
    const existingCount = await prisma.monitor.count({
      where: {
        teamId,
        deletedAt: null,
        isActive: true,
        tags: { has: "shopify-page" },
      },
    });
    if (existingCount >= MAX_CUSTOM_PAGES) {
      return {
        ok: false,
        _action,
        error: `Up to ${MAX_CUSTOM_PAGES} additional pages allowed.`,
      };
    }
    await prisma.monitor.create({
      data: {
        teamId,
        name,
        url,
        type: "http",
        intervalSeconds: 300,
        nextCheckAt: new Date(),
        tags: ["shopify-page"],
      },
    });
    return { ok: true, _action };
  }

  if (_action === "remove-monitor") {
    const monitorId = (formData.get("monitorId") as string | null) ?? "";
    if (monitorId) {
      await prisma.monitor.updateMany({
        where: { id: monitorId, teamId },
        data: { isActive: false, deletedAt: new Date() },
      });
    }
    return { ok: true, _action };
  }

  if (_action === "add-oos") {
    const url = (formData.get("url") as string | null)?.trim() ?? "";
    const name = (formData.get("name") as string | null)?.trim() || url;
    // The out-of-stock label to watch for. Shopify themes render "Sold out"
    // on a product page once a variant is unavailable. Merchants can override
    // it for themes that use different wording.
    const oosText =
      (formData.get("oosText") as string | null)?.trim() || DEFAULT_OOS_TEXT;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") throw new Error();
    } catch {
      return { ok: false, _action, error: "URL must be a valid https:// address." };
    }
    const existingCount = await prisma.monitor.count({
      where: {
        teamId,
        deletedAt: null,
        isActive: true,
        tags: { has: "shopify-oos" },
      },
    });
    if (existingCount >= MAX_OOS_MONITORS) {
      return {
        ok: false,
        _action,
        error: `Up to ${MAX_OOS_MONITORS} product pages allowed.`,
      };
    }
    // Keyword monitor: the page is "up" while the out-of-stock label is absent.
    // When the product sells out the label appears, the keyword check fails,
    // and the existing two-failure rule plus alert pipeline notify the merchant.
    await prisma.monitor.create({
      data: {
        teamId,
        name,
        url,
        type: "keyword",
        keyword: oosText,
        keywordCondition: "absent",
        intervalSeconds: 300,
        nextCheckAt: new Date(),
        tags: ["shopify-oos"],
      },
    });
    return { ok: true, _action };
  }

  return { ok: false, error: "Unknown action." };
};

// Shared inline "save succeeded" badge to show next to a section header
function SavedBadge() {
  return <Badge tone="success">Saved</Badge>;
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <BlockStack gap="050">
      <Text as="h2" variant="headingMd">
        {title}
      </Text>
      <Text as="p" variant="bodyMd" tone="subdued">
        {description}
      </Text>
    </BlockStack>
  );
}

function MonitorRow({
  id,
  name,
  url,
  onRemove,
  removing,
}: {
  id: string;
  name: string;
  url: string;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  return (
    <InlineStack align="space-between" blockAlign="center">
      <BlockStack gap="050">
        <Text as="span" variant="bodyMd" fontWeight="semibold">
          {name}
        </Text>
        <Text as="span" variant="bodySm" tone="subdued">
          {url}
        </Text>
      </BlockStack>
      <Button
        variant="plain"
        tone="critical"
        onClick={() => onRemove(id)}
        loading={removing}
      >
        Remove
      </Button>
    </InlineStack>
  );
}

export default function Settings() {
  const data = useLoaderData<typeof loader>();
  const emailFetcher = useFetcher<typeof action>();
  const slackFetcher = useFetcher<typeof action>();
  const discordFetcher = useFetcher<typeof action>();
  const pagesFetcher = useFetcher<typeof action>();
  const oosFetcher = useFetcher<typeof action>();
  const revenueFetcher = useFetcher<typeof action>();

  const [newEmail, setNewEmail] = useState("");
  const [slackUrl, setSlackUrl] = useState(data.slackWebhookUrl);
  const [discordUrl, setDiscordUrl] = useState(data.discordWebhookUrl ?? "");
  const [pageUrl, setPageUrl] = useState("");
  const [pageName, setPageName] = useState("");
  const [oosUrl, setOosUrl] = useState("");
  const [oosName, setOosName] = useState("");
  const [oosText, setOosText] = useState("");
  const [avgHourlyRevenue, setAvgHourlyRevenue] = useState(
    data.avgHourlyRevenue > 0 ? String(data.avgHourlyRevenue) : "",
  );
  const [statusCopied, setStatusCopied] = useState(false);

  function removeMonitor(monitorId: string) {
    pagesFetcher.submit({ _action: "remove-monitor", monitorId }, { method: "post" });
  }

  if (!data.teamId) {
    return (
      <Page>
        <TitleBar title="Settings" />
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="p" variant="bodyMd" tone="subdued">
                Your account is still being set up. Check back in a moment.
              </Text>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar title="Settings" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* ── Notifications ── */}
            <Text as="h2" variant="headingLg">Notifications</Text>

            {/* Alert Email */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="start">
                  <SectionHeader
                    title="Alert emails"
                    description={`We will send downtime alerts to these addresses. Up to ${MAX_EMAIL_RECIPIENTS} recipients.`}
                  />
                  <Badge>{`${(data.emailRecipients as string[]).length}/${MAX_EMAIL_RECIPIENTS}`}</Badge>
                </InlineStack>

                {(data.emailRecipients as string[]).length > 0 && (
                  <>
                    <BlockStack gap="200">
                      {(data.emailRecipients as string[]).map((r, i) => (
                        <Box key={r}>
                          {i > 0 && <Divider />}
                          <Box paddingBlockStart={i > 0 ? "200" : "0"}>
                            <InlineStack align="space-between" blockAlign="center">
                              <Text as="span" variant="bodyMd">{r}</Text>
                              <Button
                                variant="plain"
                                tone="critical"
                                onClick={() =>
                                  emailFetcher.submit(
                                    { _action: "remove-email-recipient", email: r },
                                    { method: "post" }
                                  )
                                }
                                loading={emailFetcher.state !== "idle"}
                              >
                                Remove
                              </Button>
                            </InlineStack>
                          </Box>
                        </Box>
                      ))}
                    </BlockStack>
                    <Divider />
                  </>
                )}

                {(data.emailRecipients as string[]).length < MAX_EMAIL_RECIPIENTS && (
                  <InlineStack gap="300" blockAlign="end">
                    <Box minWidth="280px">
                      <TextField
                        label="Add email address"
                        type="email"
                        value={newEmail}
                        onChange={setNewEmail}
                        autoComplete="email"
                        error={
                          emailFetcher.data && !emailFetcher.data.ok
                            ? (emailFetcher.data as { error?: string }).error
                            : undefined
                        }
                      />
                    </Box>
                    <InlineStack gap="200" blockAlign="center">
                      <Button
                        onClick={() => {
                          emailFetcher.submit(
                            { _action: "add-email-recipient", email: newEmail },
                            { method: "post" }
                          );
                          setNewEmail("");
                        }}
                        loading={emailFetcher.state !== "idle"}
                        disabled={!newEmail.trim()}
                      >
                        Add
                      </Button>
                      {emailFetcher.data?.ok && <SavedBadge />}
                    </InlineStack>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>

            {/* Slack */}
            <Card>
              <BlockStack gap="400">
                <SectionHeader
                  title="Slack alerts"
                  description="Paste an incoming webhook URL to get alerts in Slack."
                />
                <InlineStack gap="300" blockAlign="end">
                  <Box minWidth="320px">
                    <TextField
                      label="Webhook URL"
                      value={slackUrl}
                      onChange={setSlackUrl}
                      placeholder="https://hooks.slack.com/services/..."
                      autoComplete="off"
                      error={slackFetcher.data && !slackFetcher.data.ok ? (slackFetcher.data as { error?: string }).error : undefined}
                    />
                  </Box>
                  <InlineStack gap="200" blockAlign="center">
                    <Tooltip
                      content="Enter a webhook URL to enable"
                      active={!slackUrl.trim() ? undefined : false}
                    >
                      <span>
                        <Button
                          onClick={() =>
                            slackFetcher.submit({ _action: "save-slack", webhookUrl: slackUrl }, { method: "post" })
                          }
                          loading={slackFetcher.state !== "idle"}
                          disabled={!slackUrl.trim()}
                        >
                          Save
                        </Button>
                      </span>
                    </Tooltip>
                    {data.slackChannelId && (
                      <Button
                        variant="plain"
                        tone="critical"
                        onClick={() => {
                          setSlackUrl("");
                          slackFetcher.submit({ _action: "remove-slack" }, { method: "post" });
                        }}
                        loading={slackFetcher.state !== "idle"}
                      >
                        Remove
                      </Button>
                    )}
                    {slackFetcher.data?.ok && <SavedBadge />}
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Discord */}
            <Card>
              <BlockStack gap="400">
                <SectionHeader
                  title="Discord alerts"
                  description="Paste an incoming webhook URL to get alerts in a Discord channel."
                />
                <InlineStack gap="300" blockAlign="end">
                  <Box minWidth="320px">
                    <TextField
                      label="Webhook URL"
                      value={discordUrl}
                      onChange={setDiscordUrl}
                      placeholder="https://discord.com/api/webhooks/..."
                      autoComplete="off"
                      error={discordFetcher.data && !discordFetcher.data.ok ? (discordFetcher.data as { error?: string }).error : undefined}
                    />
                  </Box>
                  <InlineStack gap="200" blockAlign="center">
                    <Tooltip
                      content="Enter a webhook URL to enable"
                      active={!discordUrl.trim() ? undefined : false}
                    >
                      <span>
                        <Button
                          onClick={() =>
                            discordFetcher.submit({ _action: "save-discord", webhookUrl: discordUrl }, { method: "post" })
                          }
                          loading={discordFetcher.state !== "idle"}
                          disabled={!discordUrl.trim()}
                        >
                          Save
                        </Button>
                      </span>
                    </Tooltip>
                    {data.discordChannelId && (
                      <Button
                        variant="plain"
                        tone="critical"
                        onClick={() => {
                          setDiscordUrl("");
                          discordFetcher.submit({ _action: "remove-discord" }, { method: "post" });
                        }}
                        loading={discordFetcher.state !== "idle"}
                      >
                        Remove
                      </Button>
                    )}
                    {discordFetcher.data?.ok && <SavedBadge />}
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* ── Monitoring ── */}
            <Text as="h2" variant="headingLg">Monitoring</Text>

            {/* Your store pages */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="start">
                  <SectionHeader
                    title="Your store pages"
                    description={`Monitor up to ${MAX_CUSTOM_PAGES} additional pages on your own store (e.g. a sale landing page or product page).`}
                  />
                  <Badge>{`${data.customPages.length}/${MAX_CUSTOM_PAGES}`}</Badge>
                </InlineStack>

                {data.customPages.length > 0 && (
                  <>
                    <BlockStack gap="200">
                      {(
                        data.customPages as { id: string; name: string; url: string }[]
                      ).map((p, i) => (
                        <Box key={p.id}>
                          {i > 0 && <Divider />}
                          <Box paddingBlockStart={i > 0 ? "200" : "0"}>
                            <MonitorRow
                              {...p}
                              onRemove={removeMonitor}
                              removing={pagesFetcher.state !== "idle"}
                            />
                          </Box>
                        </Box>
                      ))}
                    </BlockStack>
                    <Divider />
                  </>
                )}

                {data.customPages.length < MAX_CUSTOM_PAGES && (
                  <InlineStack gap="300" blockAlign="end">
                    <Box minWidth="160px">
                      <TextField
                        label="Name"
                        value={pageName}
                        onChange={setPageName}
                        placeholder="Sale landing page"
                        autoComplete="off"
                      />
                    </Box>
                    <Box minWidth="240px">
                      <TextField
                        label="URL"
                        value={pageUrl}
                        onChange={setPageUrl}
                        placeholder="https://yourstore.com/sale"
                        autoComplete="off"
                        error={pagesFetcher.data && !pagesFetcher.data.ok && (pagesFetcher.data as { _action?: string })._action === "add-page" ? (pagesFetcher.data as { error?: string }).error : undefined}
                      />
                    </Box>
                    <Button
                      onClick={() => {
                        pagesFetcher.submit(
                          { _action: "add-page", url: pageUrl, name: pageName },
                          { method: "post" },
                        );
                        setPageUrl("");
                        setPageName("");
                      }}
                      loading={pagesFetcher.state !== "idle"}
                      disabled={!pageUrl.trim()}
                    >
                      Add
                    </Button>
                  </InlineStack>
                )}
              </BlockStack>
            </Card>

            {/* Out-of-stock alerts */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="start">
                  <SectionHeader
                    title="Out-of-stock alerts"
                    description={`Watch up to ${MAX_OOS_MONITORS} competitor product pages. We check for the out-of-stock label ("${DEFAULT_OOS_TEXT}" by default) and alert you when it appears.`}
                  />
                  <Badge>{`${data.oosMonitors.length}/${MAX_OOS_MONITORS}`}</Badge>
                </InlineStack>

                {data.oosMonitors.length > 0 && (
                  <>
                    <BlockStack gap="200">
                      {(
                        data.oosMonitors as { id: string; name: string; url: string }[]
                      ).map((m, i) => (
                        <Box key={m.id}>
                          {i > 0 && <Divider />}
                          <Box paddingBlockStart={i > 0 ? "200" : "0"}>
                            <MonitorRow
                              {...m}
                              onRemove={removeMonitor}
                              removing={pagesFetcher.state !== "idle"}
                            />
                          </Box>
                        </Box>
                      ))}
                    </BlockStack>
                    <Divider />
                  </>
                )}

                {data.oosMonitors.length < MAX_OOS_MONITORS && (
                  <BlockStack gap="300">
                    <InlineStack gap="300" blockAlign="end">
                      <Box minWidth="180px">
                        <TextField
                          label="Product name"
                          value={oosName}
                          onChange={setOosName}
                          placeholder="Nike Air Max 90"
                          autoComplete="off"
                        />
                      </Box>
                      <Box minWidth="280px">
                        <TextField
                          label="Product page URL"
                          value={oosUrl}
                          onChange={setOosUrl}
                          placeholder="https://competitor.com/products/..."
                          autoComplete="off"
                          error={oosFetcher.data && !oosFetcher.data.ok && (oosFetcher.data as { _action?: string })._action === "add-oos" ? (oosFetcher.data as { error?: string }).error : undefined}
                        />
                      </Box>
                    </InlineStack>
                    <InlineStack gap="300" blockAlign="end">
                      <Box minWidth="220px">
                        <TextField
                          label="Out-of-stock text"
                          value={oosText}
                          onChange={setOosText}
                          placeholder={DEFAULT_OOS_TEXT}
                          helpText={`Leave blank to use "${DEFAULT_OOS_TEXT}".`}
                          autoComplete="off"
                        />
                      </Box>
                      <Button
                        onClick={() => {
                          oosFetcher.submit(
                            { _action: "add-oos", url: oosUrl, name: oosName, oosText },
                            { method: "post" },
                          );
                          setOosUrl("");
                          setOosName("");
                          setOosText("");
                        }}
                        loading={oosFetcher.state !== "idle"}
                        disabled={!oosUrl.trim()}
                      >
                        Add
                      </Button>
                    </InlineStack>
                  </BlockStack>
                )}
              </BlockStack>
            </Card>

            {/* ── Integrations ── */}
            <Text as="h2" variant="headingLg">Integrations</Text>

            {/* Revenue tracking */}
            <Card>
              <BlockStack gap="400">
                <SectionHeader
                  title="Revenue tracking"
                  description="Set your average hourly revenue so Beaconmon can estimate revenue impact during downtime. Shown on the home screen when your store is down."
                />
                <InlineStack gap="300" blockAlign="end">
                  <Box minWidth="200px">
                    <TextField
                      label="Average hourly revenue ($)"
                      type="number"
                      value={avgHourlyRevenue}
                      onChange={setAvgHourlyRevenue}
                      placeholder="e.g. 500"
                      min={0}
                      autoComplete="off"
                      error={
                        revenueFetcher.data && !revenueFetcher.data.ok
                          ? (revenueFetcher.data as { error?: string }).error
                          : undefined
                      }
                    />
                  </Box>
                  <InlineStack gap="200" blockAlign="center">
                    <Button
                      onClick={() =>
                        revenueFetcher.submit(
                          { _action: "save-revenue", avgHourlyRevenue },
                          { method: "post" },
                        )
                      }
                      loading={revenueFetcher.state !== "idle"}
                      disabled={!avgHourlyRevenue.trim()}
                    >
                      Save
                    </Button>
                    {revenueFetcher.data?.ok && <SavedBadge />}
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Status page */}
            {data.statusPageUrl && (
              <Card>
                <BlockStack gap="400">
                  <SectionHeader
                    title="Public status page"
                    description="Share this URL with your customers so they can check your store status directly."
                  />
                  <InlineStack gap="300" blockAlign="end">
                    <Box minWidth="320px">
                      <TextField
                        label="Status page URL"
                        value={data.statusPageUrl}
                        onChange={() => {}}
                        autoComplete="off"
                        readOnly
                      />
                    </Box>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(data.statusPageUrl!);
                        setStatusCopied(true);
                        setTimeout(() => setStatusCopied(false), 2000);
                      }}
                    >
                      {statusCopied ? "Copied" : "Copy"}
                    </Button>
                  </InlineStack>
                </BlockStack>
              </Card>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
