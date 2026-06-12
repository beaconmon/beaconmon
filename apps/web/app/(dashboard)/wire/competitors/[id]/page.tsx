'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, ExternalLink, Bell, Trash2, BarChart2, X, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QueryState } from '@/components/dashboard/query-state';
import {
  useCompetitor,
  useCompetitorProducts,
  useCompetitorPages,
  useCompetitorChannels,
  useCompetitorEvents,
  useAddCompetitorChannel,
  useRemoveCompetitorChannel,
  usePriceHistory,
  useDismissBulk,
  useUpdateTrackedProductUrls,
  type PriceHistoryPoint,
  type CompetitorDetail,
} from '@/lib/hooks/use-competitors';
import { useCompetitorDiscovery } from '@/lib/hooks/use-competitor-discovery';
import { CoverageBadge } from '@/components/competitors/coverage-badge';
import { DecisionActionBar } from '@/components/competitors/decision-action-bar';
import { useAlertChannels } from '@/lib/hooks/use-alert-channels';
import type { CompetitorEventRow, CompetitorDecisionData } from '@/lib/hooks/use-competitors';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(value: unknown, currency: string): string {
  if (value == null) return '—';
  const num = parseFloat(String(value));
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(num);
}

function formatPayloadSummary(
  type: string | undefined,
  payload: Record<string, unknown> | undefined
): string {
  if (!type || !payload) return '';
  switch (type) {
    case 'price_changed':
      return `$${payload.oldPrice} → $${payload.newPrice}`;
    case 'product_added':
      return `New: ${payload.title}`;
    case 'product_removed':
      return `Removed: ${payload.title}`;
    case 'stock_changed':
      return payload.newAvailable ? 'Back in stock' : 'Out of stock';
    case 'out_of_stock':
      return `Out of stock: ${payload.productHandle ?? ''}`;
    case 'back_in_stock':
      return `Back in stock: ${payload.productHandle ?? ''}`;
    case 'sale_started':
      return `Sale: $${payload.currentPrice} (was $${payload.compareAtPrice})`;
    case 'sale_ended':
      return `Sale ended (was $${payload.wasCompareAtPrice})`;
    case 'site_changed':
    case 'promo_detected':
      return (payload.diffSummary as string | undefined) ?? 'Content changed';
    default:
      return '';
  }
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  price_changed: 'Price change',
  product_added: 'New product',
  product_removed: 'Product removed',
  stock_changed: 'Stock change',
  out_of_stock: 'Out of stock',
  back_in_stock: 'Back in stock',
  sale_started: 'Sale started',
  sale_ended: 'Sale ended',
  site_changed: 'Site change',
  promo_detected: 'Promo detected',
};

// ─── Price sparkline ──────────────────────────────────────────────────────────

function PriceSparkline({ points }: { points: PriceHistoryPoint[] }) {
  if (points.length < 2) return <span className="font-mono text-[10px] text-brand-muted">no history</span>;

  const values = points.map((p) => parseFloat(p.price));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 80;
  const H = 28;
  const pad = 3;

  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * W;
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const last = values[values.length - 1]!;
  const prev = values[values.length - 2]!;
  const strokeClass = last > prev ? 'text-brand-red' : last < prev ? 'text-brand-green-ink' : 'text-brand-muted';

  return (
    <svg width={W} height={H} className={`overflow-visible ${strokeClass}`}>
      <polyline points={coords.join(' ')} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProductRow({ p, competitorId }: { p: { id: string; title: string; handle: string; currentPrice: unknown; compareAtPrice: unknown; isAvailable: boolean; currency: string; lastSeenAt: string }; competitorId: string }) {
  const [showHistory, setShowHistory] = useState(false);
  const { data: history, isLoading: historyLoading } = usePriceHistory(competitorId, p.id, showHistory);

  return (
    <>
      <div className="grid grid-cols-[1fr_100px_100px_80px_90px_44px] items-center border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-brand-text">{p.title}</p>
          <p className="truncate font-mono text-[10px] text-brand-muted">{p.handle}</p>
        </div>
        <span className="font-mono text-sm text-brand-dim">{formatPrice(p.currentPrice, p.currency)}</span>
        <span className="font-mono text-sm text-brand-muted">{formatPrice(p.compareAtPrice, p.currency)}</span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${p.isAvailable ? 'text-brand-green-ink' : 'text-brand-muted'}`}>
          {p.isAvailable ? 'Yes' : 'No'}
        </span>
        <span className="font-mono text-xs text-brand-muted">
          {formatDistanceToNow(new Date(p.lastSeenAt), { addSuffix: true })}
        </span>
        <button
          onClick={() => setShowHistory((s) => !s)}
          className="flex items-center justify-center rounded p-1 text-brand-muted transition-colors hover:bg-brand-bg3 hover:text-brand-dim"
          title={showHistory ? 'Hide price history' : 'Show price history'}
        >
          {showHistory ? <X className="h-3.5 w-3.5" /> : <BarChart2 className="h-3.5 w-3.5" />}
        </button>
      </div>
      {showHistory && (
        <div className="flex items-center gap-4 border-b border-brand-line/60 bg-brand-bg3/20 px-4 py-3">
          <p className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-brand-muted">Price history</p>
          {historyLoading ? (
            <div className="h-7 w-20 animate-pulse rounded bg-brand-bg3" />
          ) : (
            <PriceSparkline points={history ?? []} />
          )}
          {history && history.length >= 2 && (
            <span className="font-mono text-[10px] text-brand-muted">{history.length} changes tracked</span>
          )}
        </div>
      )}
    </>
  );
}

// ─── Discovery banner ─────────────────────────────────────────────────────────

function DiscoveryBanner({
  competitorId,
  dataTier,
  trackedCount,
}: {
  competitorId: string;
  dataTier: string;
  trackedCount: number;
}) {
  const { data: discovery } = useCompetitorDiscovery(competitorId);
  const state = discovery?.state;

  if (state === 'pending' || state === 'syncing') {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-brand-line bg-brand-bg3/40 px-4 py-3">
        <div className="h-2 w-2 animate-pulse rounded-full bg-brand-amber" />
        <p className="text-sm text-brand-dim">Syncing catalog. Products will appear shortly.</p>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="mb-4 rounded-lg border border-brand-red/30 bg-brand-red/5 px-4 py-3">
        <p className="text-sm text-brand-red">Catalog sync failed. The scheduler will retry automatically.</p>
        {discovery?.error && (
          <p className="mt-1 font-mono text-[11px] text-brand-muted">{discovery.error}</p>
        )}
      </div>
    );
  }

  if (dataTier === 'selected_products') {
    return (
      <div className="mb-4 rounded-lg border border-brand-line bg-brand-bg3/40 px-4 py-3 text-sm text-brand-muted">
        This store does not expose a full catalog feed, so we track{' '}
        {trackedCount > 0 ? `${trackedCount} selected product page${trackedCount !== 1 ? 's' : ''}` : 'selected product pages'}{' '}
        directly. Prices sync daily, and a weekly sitemap scan catches new launches. You can choose which
        products to track in Settings.
      </div>
    );
  }

  if (dataTier === 'limited') {
    return (
      <div className="mb-4 rounded-lg border border-brand-line bg-brand-bg3/40 px-4 py-3 text-sm text-brand-muted">
        Limited access. This site blocks automated catalog access, so product level tracking is unavailable
        for now. We still monitor its key pages for changes and re-check access weekly.
      </div>
    );
  }

  return null;
}

// ─── Products tab ─────────────────────────────────────────────────────────────

function ProductsTab({
  competitorId,
  dataTier,
  trackedCount,
}: {
  competitorId: string;
  dataTier: string;
  trackedCount: number;
}) {
  const { data: products, isLoading, isError, refetch } = useCompetitorProducts(competitorId);

  return (
    <div className="space-y-0">
      <DiscoveryBanner competitorId={competitorId} dataTier={dataTier} trackedCount={trackedCount} />
      <div className="rounded-lg border border-brand-line bg-brand-surface">
        <div className="flex items-center justify-between border-b border-brand-line px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Product catalog
          </h2>
          <a
            href={`/api/competitors/${competitorId}/products.csv`}
            className="inline-flex items-center gap-1 text-xs text-brand-muted transition-colors hover:text-brand-dim"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </a>
        </div>
        <QueryState isLoading={isLoading} isError={isError} onRetry={() => refetch()} skeletonRows={5}>
          {!products || products.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-brand-muted">
              {dataTier === 'limited'
                ? 'No products tracked. This site blocks automated catalog access.'
                : 'No products tracked yet. Products appear after the first catalog sync.'}
            </p>
          ) : (
            <div>
              <div className="grid grid-cols-[1fr_100px_100px_80px_90px_44px] border-b border-brand-line px-4 py-2">
                {['Title', 'Price', 'Compare-at', 'Available', 'Last seen', ''].map((h) => (
                  <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                    {h}
                  </span>
                ))}
              </div>
              {products.map((p) => (
                <ProductRow key={p.id} p={p} competitorId={competitorId} />
              ))}
            </div>
          )}
        </QueryState>
      </div>
    </div>
  );
}

// ─── Significance badge ───────────────────────────────────────────────────────

function SignificanceBadge({ significance }: { significance?: string | null }) {
  if (significance !== 'high') return null;
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
      style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--brand-red)' }}
    >
      high
    </span>
  );
}

// ─── Event grouping ───────────────────────────────────────────────────────────

type EventGroup =
  | { kind: 'event'; event: CompetitorEventRow }
  | { kind: 'low-group'; events: CompetitorEventRow[] };

function groupBySignificance(events: CompetitorEventRow[]): EventGroup[] {
  const groups: EventGroup[] = [];
  let lowBuffer: CompetitorEventRow[] = [];

  for (const event of events) {
    if ((event.significance ?? 'medium') === 'low') {
      lowBuffer.push(event);
    } else {
      if (lowBuffer.length > 0) {
        groups.push({ kind: 'low-group', events: lowBuffer });
        lowBuffer = [];
      }
      groups.push({ kind: 'event', event });
    }
  }

  if (lowBuffer.length > 0) {
    groups.push({ kind: 'low-group', events: lowBuffer });
  }

  return groups;
}

function LowEventGroup({
  events,
  competitorId,
  updateEventDecision,
}: {
  events: CompetitorEventRow[];
  competitorId: string;
  updateEventDecision: (id: string, d: CompetitorDecisionData | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div
        className="flex cursor-pointer items-center justify-between border-t border-brand-line/60 px-4 py-2 hover:bg-brand-bg3/30"
        onClick={() => setExpanded((s) => !s)}
      >
        <span className="font-mono text-[11px] text-brand-muted">
          {events.length} low-signal event{events.length !== 1 ? 's' : ''} hidden
        </span>
        <span className="font-mono text-[10px] text-brand-muted">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded &&
        events.map((e) => {
          const summary = formatPayloadSummary(e.type, e.payload);
          const label = EVENT_TYPE_LABEL[e.type] ?? 'Event';
          return (
            <div key={e.id} className="border-t border-brand-line/60 px-4 py-3 opacity-60 hover:bg-brand-bg3/30">
              <div className="grid grid-cols-[1fr_120px] gap-3">
                <div className="min-w-0 space-y-0.5">
                  <span
                    className="inline-block rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                    style={{ background: 'rgba(180,83,9,0.1)', color: 'var(--brand-amber)' }}
                  >
                    {label}
                  </span>
                  {summary && <p className="text-sm text-brand-dim">{summary}</p>}
                </div>
                <div className="flex flex-col items-end">
                  <time className="font-mono text-[11px] text-brand-muted">
                    {formatDistanceToNow(new Date(e.detectedAt), { addSuffix: true })}
                  </time>
                </div>
              </div>
              <DecisionActionBar
                eventId={e.id}
                competitorId={competitorId}
                currentDecision={e.decision}
                onDecisionChange={(d) => updateEventDecision(e.id, d)}
              />
            </div>
          );
        })}
    </>
  );
}

// ─── Events tab ───────────────────────────────────────────────────────────────

function EventsTab({ competitorId }: { competitorId: string }) {
  const { events, hasMore, isLoading, isError, loadMore, refresh, updateEventDecision } = useCompetitorEvents(competitorId);
  const dismissBulk = useDismissBulk(competitorId);

  if (isError && events.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-brand-red">
        Failed to load events. Please try again.
      </p>
    );
  }

  if (isLoading && events.length === 0) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-brand-bg3" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="rounded-lg border border-brand-line bg-brand-surface">
        <div className="flex items-center justify-between border-b border-brand-line px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Event timeline</h2>
          {events.some((e) => !e.decision) && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-brand-muted hover:text-brand-dim"
              disabled={dismissBulk.isPending}
              onClick={() => dismissBulk.mutate(undefined, { onSuccess: refresh })}
            >
              {dismissBulk.isPending ? 'Dismissing...' : 'Dismiss all undecided'}
            </Button>
          )}
        </div>
        {events.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-brand-muted">No events recorded yet.</p>
        ) : (
          <div>
            {groupBySignificance(events).map((group, i) => {
              if (group.kind === 'low-group') {
                return (
                  <LowEventGroup
                    key={`low-group-${i}`}
                    events={group.events}
                    competitorId={competitorId}
                    updateEventDecision={updateEventDecision}
                  />
                );
              }
              const e = group.event;
              const summary = formatPayloadSummary(e.type, e.payload);
              const label = EVENT_TYPE_LABEL[e.type] ?? 'Event';
              return (
                <div
                  key={e.id}
                  className={`px-4 py-3 hover:bg-brand-bg3/30 ${i > 0 ? 'border-t border-brand-line/60' : ''}`}
                >
                  <div className="grid grid-cols-[1fr_120px] gap-3">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="inline-block rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                          style={{ background: 'rgba(180,83,9,0.1)', color: 'var(--brand-amber)' }}
                        >
                          {label}
                        </span>
                        <SignificanceBadge significance={e.significance} />
                      </div>
                      {summary && (
                        <p className="text-sm text-brand-dim">{summary}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <time className="font-mono text-[11px] text-brand-muted">
                        {formatDistanceToNow(new Date(e.detectedAt), { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                  <DecisionActionBar
                    eventId={e.id}
                    competitorId={competitorId}
                    currentDecision={e.decision}
                    onDecisionChange={(d) => updateEventDecision(e.id, d)}
                  />
                </div>
              );
            })}
            {hasMore && (
              <div className="border-t border-brand-line px-4 py-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pages tab ────────────────────────────────────────────────────────────────

function PagesTab({ competitorId }: { competitorId: string }) {
  const { data: pages, isLoading, isError, refetch } = useCompetitorPages(competitorId);

  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Monitored pages
        </h2>
      </div>
      <QueryState isLoading={isLoading} isError={isError} onRetry={() => refetch()} skeletonRows={3}>
        {!pages || pages.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-brand-muted">No pages configured.</p>
        ) : (
          <div>
            {pages.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-4 py-3 hover:bg-brand-bg3/30 ${i > 0 ? 'border-t border-brand-line/60' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-brand-text">{p.label}</p>
                    {p.consecutiveFailures >= 3 && (
                      <span
                        className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-500"
                        title={`${p.consecutiveFailures} checks in a row have failed. The page may have moved or be blocking us.`}
                      >
                        Needs attention
                      </span>
                    )}
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-xs text-brand-muted hover:text-brand-dim"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="truncate max-w-xs">{p.url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="font-mono text-xs text-brand-muted">
                    {p.lastCheckedAt
                      ? formatDistanceToNow(new Date(p.lastCheckedAt), { addSuffix: true })
                      : 'Never'}
                  </span>
                  {p.lastSnapshotHash && (
                    <span className="font-mono text-[10px] text-brand-muted">
                      {p.lastSnapshotHash.slice(0, 8)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}

// ─── Tracked products card ────────────────────────────────────────────────────

const MAX_TRACKED_URLS = 50;

function TrackedProductsCard({
  competitorId,
  domain,
  trackedUrls,
}: {
  competitorId: string;
  domain: string;
  trackedUrls: string[];
}) {
  const [newUrl, setNewUrl] = useState('');
  const updateUrls = useUpdateTrackedProductUrls(competitorId);

  function handleAdd() {
    const url = newUrl.trim();
    if (!url) return;
    if (trackedUrls.includes(url)) {
      setNewUrl('');
      return;
    }
    updateUrls.mutate(
      { trackedProductUrls: [...trackedUrls, url] },
      { onSuccess: () => setNewUrl('') }
    );
  }

  function handleRemove(url: string) {
    updateUrls.mutate({ trackedProductUrls: trackedUrls.filter((u) => u !== url) });
  }

  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Tracked product pages
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Product pages on {domain} we fetch daily for price and stock changes. Up to {MAX_TRACKED_URLS} URLs.
        </p>
      </div>
      {trackedUrls.length === 0 ? (
        <p className="px-4 py-6 text-sm text-brand-muted">
          No product pages tracked yet. Paste a product page URL below, for example a bestseller you want to watch.
        </p>
      ) : (
        <div>
          {trackedUrls.map((url, i) => (
            <div
              key={url}
              className={`flex items-center gap-3 px-4 py-2.5 hover:bg-brand-bg3/30 ${i > 0 ? 'border-t border-brand-line/60' : ''}`}
            >
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center gap-1 font-mono text-xs text-brand-dim hover:text-brand-text"
              >
                <span className="truncate">{url}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-brand-muted hover:text-brand-red"
                disabled={updateUrls.isPending}
                onClick={() => handleRemove(url)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
      <div className="border-t border-brand-line p-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder={`https://${domain}/products/...`}
            className="h-8 flex-1 rounded-md border border-brand-line bg-brand-bg3/40 px-2 font-mono text-xs text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-line"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newUrl.trim() || updateUrls.isPending || trackedUrls.length >= MAX_TRACKED_URLS}
          >
            {updateUrls.isPending ? 'Saving...' : 'Add'}
          </Button>
        </div>
        {trackedUrls.length >= MAX_TRACKED_URLS && (
          <p className="text-xs text-brand-muted">Tracked URL limit reached. Remove one to add another.</p>
        )}
        {updateUrls.isError && <p className="text-xs text-brand-red">{updateUrls.error.message}</p>}
      </div>
    </div>
  );
}

// ─── Settings tab ─────────────────────────────────────────────────────────────

function SettingsTab({ competitorId, competitor }: { competitorId: string; competitor?: CompetitorDetail }) {
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const { data: linkedChannels, isLoading: loadingLinked } = useCompetitorChannels(competitorId);
  const { data: allChannels, isLoading: loadingChannels } = useAlertChannels();
  const addChannel = useAddCompetitorChannel(competitorId);
  const removeChannel = useRemoveCompetitorChannel(competitorId);

  const linkedIds = new Set((linkedChannels ?? []).map((c) => c.id));
  const availableChannels = (allChannels ?? []).filter((c) => !linkedIds.has(c.id));

  function handleAdd() {
    if (!selectedChannelId) return;
    addChannel.mutate(
      { channelId: selectedChannelId },
      { onSuccess: () => setSelectedChannelId('') }
    );
  }

  const trackedUrls = Array.isArray(competitor?.trackedProductUrls)
    ? competitor.trackedProductUrls.filter((u): u is string => typeof u === 'string')
    : [];

  return (
    <div className="space-y-5">
      {/* Tracked product pages: only relevant when the full catalog feed is unavailable */}
      {competitor && competitor.dataTier !== 'full_catalog' && (
        <TrackedProductsCard
          competitorId={competitorId}
          domain={competitor.domain}
          trackedUrls={trackedUrls}
        />
      )}

      {/* Linked channels */}
      <div className="rounded-lg border border-brand-line bg-brand-surface">
        <div className="border-b border-brand-line px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Linked alert channels
          </h2>
        </div>
        {loadingLinked ? (
          <div className="space-y-2 p-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-brand-bg3" />
            ))}
          </div>
        ) : !linkedChannels || linkedChannels.length === 0 ? (
          <p className="px-4 py-6 text-sm text-brand-muted">
            No channels linked. Add one below to receive alerts for this competitor.
          </p>
        ) : (
          <div>
            {linkedChannels.map((ch, i) => (
              <div
                key={ch.id}
                className={`flex items-center gap-3 px-4 py-2.5 hover:bg-brand-bg3/30 ${i > 0 ? 'border-t border-brand-line/60' : ''}`}
              >
                <Bell className="h-3.5 w-3.5 shrink-0 text-brand-muted" />
                <span className="flex-1 truncate text-sm text-brand-dim">{ch.name}</span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--brand-bg3)', color: 'var(--brand-muted)' }}
                >
                  {ch.type}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-brand-muted hover:text-brand-red"
                  disabled={removeChannel.isPending}
                  onClick={() => removeChannel.mutate({ channelId: ch.id })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add channel */}
      <div className="rounded-lg border border-brand-line bg-brand-surface p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Add channel
        </h3>
        {loadingChannels ? (
          <div className="h-8 animate-pulse rounded bg-brand-bg3" />
        ) : availableChannels.length === 0 ? (
          <p className="text-sm text-brand-muted">
            All configured channels are already linked.{' '}
            <Link href="/alert-channels" className="text-brand-green-ink hover:underline">
              Manage channels →
            </Link>
          </p>
        ) : (
          <div className="flex gap-2">
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger className="h-8 flex-1 text-sm">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                {availableChannels.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.name}
                    <span className="ml-1.5 font-mono text-[10px] text-brand-muted">
                      ({ch.type})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!selectedChannelId || addChannel.isPending}
            >
              Add
            </Button>
          </div>
        )}
        {addChannel.isError && (
          <p className="text-xs text-brand-red">{addChannel.error.message}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CompetitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const VALID_TABS = ['products', 'events', 'pages', 'settings'] as const;
  type TabValue = (typeof VALID_TABS)[number];
  const rawTab = searchParams.get('tab');
  const initialTab: TabValue = VALID_TABS.includes(rawTab as TabValue) ? (rawTab as TabValue) : 'products';

  const { data: competitor, isLoading, isError, refetch } = useCompetitor(id);

  return (
    <div className="space-y-5">
      <Link
        href="/wire?tab=competitors"
        className="inline-flex items-center gap-1.5 text-xs text-brand-muted transition-colors hover:text-brand-dim"
      >
        <ArrowLeft className="h-3 w-3" />
        Competitors
      </Link>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={null}
        onRetry={() => refetch()}
        skeletonRows={1}
      >
        {competitor && (
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-brand-text">{competitor.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--brand-bg3)', color: 'var(--brand-muted)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
                >
                  {competitor.domain}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                  style={{ background: 'var(--brand-bg3)', color: 'var(--brand-muted)' }}
                >
                  {competitor.platform}
                </span>
                <CoverageBadge dataTier={competitor.dataTier} />
              </div>
            </div>
          </div>
        )}
      </QueryState>

      <Tabs defaultValue={initialTab}>
        <TabsList className="mb-4 flex-wrap h-auto gap-0.5 border border-brand-line bg-brand-bg3 p-1">
          {[
            { value: 'products', label: 'Products' },
            { value: 'events', label: 'Events' },
            { value: 'pages', label: 'Pages' },
            { value: 'settings', label: 'Settings' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs data-[state=active]:bg-brand-surface data-[state=active]:text-brand-text text-brand-muted"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="products" className="mt-0">
          <ProductsTab
            competitorId={id}
            dataTier={competitor?.dataTier ?? 'limited'}
            trackedCount={
              Array.isArray(competitor?.trackedProductUrls) ? competitor.trackedProductUrls.length : 0
            }
          />
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <EventsTab competitorId={id} />
        </TabsContent>

        <TabsContent value="pages" className="mt-0">
          <PagesTab competitorId={id} />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <SettingsTab competitorId={id} competitor={competitor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
