import 'server-only';
import { prisma } from '@beaconmon/db';
import { buildSnapshot, type Snapshot } from '@/lib/tools/snapshot';

export type ChangeType = 'price_drop' | 'promo_launched' | 'product_added' | 'product_removed' | 'content_change';

export interface RecentChange {
  detectedAt: string;
  type: ChangeType;
  summary: string;
  detail: string;
}

export interface CompetitorChangesOk {
  ok: true;
  domain: string;
  hasHistory: boolean;
  snapshot: Snapshot;
  recentChanges: RecentChange[];
}

export type CompetitorChangesResult =
  | CompetitorChangesOk
  | { ok: false; reason: 'not_shopify' | 'unreachable' };

const INTERESTING_TYPES = [
  'price_changed',
  'sale_started',
  'promo_detected',
  'product_added',
  'product_removed',
  'site_changed',
];

async function fetchRecentEvents(domain: string): Promise<RecentChange[]> {
  const competitors = await prisma.competitor.findMany({
    where: { domain, deletedAt: null },
    select: { id: true },
  });

  if (competitors.length === 0) return [];

  const ids = competitors.map((c) => c.id);
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const rows = await prisma.competitorEvent.findMany({
    where: {
      competitorId: { in: ids },
      detectedAt: { gte: since },
      type: { in: INTERESTING_TYPES },
    },
    orderBy: { detectedAt: 'desc' },
    take: 5,
    select: { type: true, payload: true, detectedAt: true },
  });

  return rows.map(mapEvent);
}

function mapEvent(row: { type: string; payload: unknown; detectedAt: Date }): RecentChange {
  const p = (row.payload ?? {}) as Record<string, unknown>;
  const detectedAt = row.detectedAt.toISOString();

  switch (row.type) {
    case 'price_changed': {
      const title = String(p['title'] ?? 'Product');
      const oldP = String(p['oldPrice'] ?? '');
      const newP = String(p['newPrice'] ?? '');
      const old = parseFloat(oldP);
      const next = parseFloat(newP);
      const isPriceDrop = Number.isFinite(old) && Number.isFinite(next) && next < old;
      const pct = isPriceDrop ? Math.round((1 - next / old) * 100) : null;
      return {
        detectedAt,
        type: isPriceDrop ? 'price_drop' : 'content_change',
        summary: isPriceDrop ? 'Price dropped' : 'Price changed',
        detail: pct
          ? `${title}: $${oldP} -> $${newP} (${pct}% off)`
          : `${title}: $${oldP} -> $${newP}`,
      };
    }
    case 'sale_started': {
      const title = String(p['title'] ?? 'Product');
      const cur = String(p['currentPrice'] ?? '');
      const was = String(p['compareAtPrice'] ?? '');
      return {
        detectedAt,
        type: 'promo_launched',
        summary: 'Sale price detected',
        detail: `${title}: $${cur} (was $${was})`,
      };
    }
    case 'promo_detected': {
      const diff = String(p['diffSummary'] ?? 'Promotion detected on the site');
      return {
        detectedAt,
        type: 'promo_launched',
        summary: 'Promotion detected',
        detail: diff,
      };
    }
    case 'product_added': {
      const title = String(p['title'] ?? 'New product');
      return { detectedAt, type: 'product_added', summary: 'New product added', detail: title };
    }
    case 'product_removed': {
      const title = String(p['title'] ?? 'Product');
      return { detectedAt, type: 'product_removed', summary: 'Product removed', detail: title };
    }
    default: {
      const diff = String(p['diffSummary'] ?? 'Content changed on the site');
      return { detectedAt, type: 'content_change', summary: 'Content changed', detail: diff };
    }
  }
}

export async function buildCompetitorChanges(domain: string): Promise<CompetitorChangesResult> {
  const snapshotResult = await buildSnapshot(domain);
  if (!snapshotResult.ok) return snapshotResult;

  let recentChanges: RecentChange[] = [];
  try {
    recentChanges = await fetchRecentEvents(domain);
  } catch {
    // DB unavailable — return the snapshot without history rather than failing.
  }

  return {
    ok: true,
    domain,
    hasHistory: recentChanges.length > 0,
    snapshot: snapshotResult.snapshot,
    recentChanges,
  };
}
