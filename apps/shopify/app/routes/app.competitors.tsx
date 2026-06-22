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
  Banner,
  Box,
  Divider,
  Badge,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { prisma } from "@beaconmon/db";

// Hard-coded preview cards shown when the catalog has no products yet.
const MOCK_PREVIEW = [
  {
    title: "Classic Running Shoe",
    productType: "Footwear",
    currentPrice: "89.99",
    compareAtPrice: "120.00",
    vendor: "S***",
  },
  {
    title: "Yoga Mat Bundle",
    productType: "Fitness",
    currentPrice: "45.00",
    compareAtPrice: null,
    vendor: "A***",
  },
  {
    title: "Stainless Water Bottle",
    productType: "Drinkware",
    currentPrice: null,
    compareAtPrice: null,
    vendor: "H***",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  const teamId = install?.teamId ?? null;
  const competitorIntent = (install?.competitorIntent as string[]) ?? [];

  const rawProducts = await prisma.competitorProduct.findMany({
    take: 3,
    where: { isAvailable: true },
    orderBy: { updatedAt: "desc" },
    select: {
      title: true,
      productType: true,
      currentPrice: true,
      compareAtPrice: true,
      vendor: true,
    },
  });

  // Redact vendor: show first letter + "***"
  const previewProducts =
    rawProducts.length > 0
      ? rawProducts.map((p) => ({
          title: p.title,
          productType: p.productType ?? "Product",
          currentPrice: p.currentPrice?.toString() ?? null,
          compareAtPrice: p.compareAtPrice?.toString() ?? null,
          vendor: p.vendor ? `${p.vendor[0]}***` : "?***",
        }))
      : MOCK_PREVIEW;

  return { shop, teamId, competitorIntent, previewProducts };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const formData = await request.formData();
  const domain = (formData.get("domain") as string | null)?.trim() ?? "";

  if (!domain) return { ok: false, error: "Enter a competitor domain." };

  const install = await prisma.shopifyInstall.findUnique({ where: { shop } });
  if (!install) return { ok: false, error: "Install not found." };

  const existing = (install.competitorIntent as string[]) ?? [];
  if (existing.length >= 10) {
    return { ok: false, error: "You can track up to 10 competitors." };
  }
  if (existing.includes(domain)) {
    return { ok: true }; // already saved, no-op
  }

  await prisma.shopifyInstall.update({
    where: { shop },
    data: { competitorIntent: [...existing, domain] },
  });

  return { ok: true };
};

type PreviewProduct = {
  title: string;
  productType: string;
  currentPrice: string | null;
  compareAtPrice: string | null;
  vendor: string;
};

function PreviewCard({ product }: { product: PreviewProduct }) {
  const hasDiscount =
    product.compareAtPrice &&
    product.currentPrice &&
    parseFloat(product.compareAtPrice) > parseFloat(product.currentPrice);

  return (
    <Box
      padding="300"
      background="bg-surface-secondary"
      borderRadius="200"
    >
      <BlockStack gap="100">
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap="050">
            <Text as="span" variant="bodySm" tone="subdued">
              {product.vendor} · {product.productType}
            </Text>
            <Text as="span" variant="bodyMd" fontWeight="semibold">
              {product.title}
            </Text>
          </BlockStack>
          {product.currentPrice ? (
            <BlockStack gap="050" inlineAlign="end">
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                ${product.currentPrice}
              </Text>
              {hasDiscount && (
                <Badge tone="success">
                  {`was $${product.compareAtPrice ?? ""}`}
                </Badge>
              )}
            </BlockStack>
          ) : (
            <Badge tone="attention">OOS</Badge>
          )}
        </InlineStack>
      </BlockStack>
    </Box>
  );
}

export default function Competitors() {
  const { competitorIntent, previewProducts } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [domain, setDomain] = useState("");

  const actionData = fetcher.data;
  const submitting = fetcher.state !== "idle";

  function handleSubmit() {
    if (!domain.trim()) return;
    fetcher.submit({ domain }, { method: "post" });
    setDomain("");
  }

  const savedList = competitorIntent as string[];

  return (
    <Page>
      <TitleBar title="Competitor Tracking" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Banner tone="info" title="Be first to know when a competitor moves">
              <Text as="p" variant="bodyMd">
                Price drops, promos, and stock-outs — tracked automatically.
                Tell us who to watch and you will get an alert the moment
                something changes.
              </Text>
            </Banner>

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">
                    Live price activity (preview)
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Sample events from the Beaconmon catalog. Your competitors
                    will appear here once tracking is enabled.
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  {(previewProducts as PreviewProduct[]).map((p) => (
                    <PreviewCard key={p.title} product={p} />
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">
                    Notify me when we launch
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Enter a competitor domain and we will set up tracking for
                    you when the feature goes live.
                  </Text>
                </BlockStack>

                <InlineStack gap="300" blockAlign="end">
                  <Box minWidth="280px">
                    <TextField
                      label="Competitor domain"
                      value={domain}
                      onChange={setDomain}
                      placeholder="example.com"
                      autoComplete="off"
                      error={actionData && !actionData.ok ? actionData.error : undefined}
                    />
                  </Box>
                  <InlineStack gap="200" blockAlign="center">
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      loading={submitting}
                      disabled={!domain.trim()}
                    >
                      Notify me
                    </Button>
                    {actionData?.ok && <Badge tone="success">Got it, you are on the list</Badge>}
                  </InlineStack>
                </InlineStack>

                {savedList.length > 0 && (
                  <BlockStack gap="200">
                    <Divider />
                    <Text as="p" variant="bodySm" tone="subdued">
                      Tracking requested for:
                    </Text>
                    <BlockStack gap="100">
                      {savedList.map((d) => (
                        <Text key={d} as="p" variant="bodyMd">
                          {d}
                        </Text>
                      ))}
                    </BlockStack>
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
