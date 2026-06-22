// Process-cached read of Shopify's public status feed so the home screen can
// proactively warn merchants during a platform incident. This mirrors the
// isShopifyOutage() check in the alert worker but also returns the human
// readable description for display. Best-effort: any failure resolves to null,
// which renders no banner. Cached for 60s so a burst of opens during an
// incident does not hammer status.shopify.com.

export type ShopifyStatus = {
  // "minor" | "major" | "critical" per the Statuspage API. "none" means all
  // clear and is never surfaced (we return null instead).
  indicator: string;
  description: string;
};

const CACHE_TTL_MS = 60_000;
let cache: { at: number; value: ShopifyStatus | null } = { at: 0, value: null };

export async function getShopifyStatus(): Promise<ShopifyStatus | null> {
  const now = Date.now();
  if (now - cache.at < CACHE_TTL_MS) return cache.value;

  let value: ShopifyStatus | null = null;
  try {
    const res = await fetch("https://status.shopify.com/api/v2/status.json", {
      signal: AbortSignal.timeout(3000),
    });
    const data = (await res.json()) as {
      status?: { indicator?: string; description?: string };
    };
    const indicator = data.status?.indicator ?? "none";
    if (indicator !== "none") {
      value = {
        indicator,
        description:
          data.status?.description ?? "Shopify is reporting an incident.",
      };
    }
  } catch {
    value = null;
  }

  cache = { at: now, value };
  return value;
}
