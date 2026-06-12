'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  DollarSign,
  Flame,
  Package,
  PackageMinus,
  PackageX,
  RefreshCcw,
  Tag,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sparkline } from '@/components/dashboard/sparkline';
import { CoverageBadge } from '@/components/competitors/coverage-badge';
import { CompetitorAvatar } from './competitor-avatar';
import { TrendTag } from './trend-tag';
import { formatRelative, type CompetitorRollup } from '@/lib/wire/rollup';
import type { IntelligenceEvent } from '@/lib/repositories/intelligence';

interface CompetitorGroupCardProps {
  rollup: CompetitorRollup;
  rank: number;
}

const PLATFORM_LABEL: Record<string, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  other: 'Other',
};

interface IconStyle {
  icon: LucideIcon;
  tone: 'amber' | 'red' | 'green' | 'muted';
}

function iconFor(type: string | undefined): IconStyle {
  switch (type) {
    case 'price_changed':
      return { icon: DollarSign, tone: 'amber' };
    case 'sale_started':
    case 'sale_ended':
      return { icon: Tag, tone: 'amber' };
    case 'out_of_stock':
      return { icon: PackageX, tone: 'red' };
    case 'back_in_stock':
      return { icon: Package, tone: 'green' };
    case 'stock_changed':
      return { icon: RefreshCcw, tone: 'muted' };
    case 'product_added':
      return { icon: Package, tone: 'muted' };
    case 'product_removed':
      return { icon: PackageMinus, tone: 'muted' };
    default:
      return { icon: RefreshCcw, tone: 'muted' };
  }
}

function toneToColors(tone: IconStyle['tone']): { bg: string; ink: string } {
  switch (tone) {
    case 'amber':
      return { bg: 'rgba(180,83,9,0.12)', ink: 'var(--brand-amber)' };
    case 'red':
      return { bg: 'rgba(255,68,68,0.12)', ink: 'var(--brand-red)' };
    case 'green':
      return { bg: 'rgba(0,229,122,0.12)', ink: 'var(--brand-green-ink)' };
    default:
      return { bg: 'var(--brand-bg3)', ink: 'var(--brand-muted)' };
  }
}

function readNumber(payload: Record<string, unknown> | undefined, key: string): number | undefined {
  if (!payload) return undefined;
  const v = payload[key];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
}

function readString(payload: Record<string, unknown> | undefined, key: string): string | undefined {
  if (!payload) return undefined;
  const v = payload[key];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function eventSentence(event: IntelligenceEvent): { object: string; magnitude?: string; magnitudeTone?: 'red' | 'amber' | 'muted' } {
  const payload = event.payload;
  switch (event.competitorEventType) {
    case 'price_changed': {
      const oldP = readNumber(payload, 'oldPrice');
      const newP = readNumber(payload, 'newPrice');
      const title = readString(payload, 'productTitle') ?? readString(payload, 'title') ?? 'a tracked product';
      if (oldP && newP && oldP > 0) {
        const pct = Math.round(((newP - oldP) / oldP) * 100);
        return {
          object: `prices on ${title}`,
          magnitude: `${pct >= 0 ? '+' : ''}${pct}%`,
          magnitudeTone: Math.abs(pct) >= 10 ? 'red' : 'amber',
        };
      }
      return { object: `prices on ${title}` };
    }
    case 'sale_started':
      return { object: readString(payload, 'productTitle') ?? readString(payload, 'title') ?? 'a tracked product', magnitude: 'Sale', magnitudeTone: 'amber' };
    case 'sale_ended':
      return { object: readString(payload, 'productTitle') ?? readString(payload, 'title') ?? 'a tracked product', magnitude: 'Sale ended', magnitudeTone: 'muted' };
    case 'product_added':
      return { object: `${readString(payload, 'title') ?? 'a new product'}` };
    case 'product_removed':
      return { object: `${readString(payload, 'title') ?? 'a product'}` };
    case 'out_of_stock':
      return { object: `${readString(payload, 'productHandle') ?? readString(payload, 'title') ?? 'a tracked product'}` };
    case 'back_in_stock':
      return { object: `${readString(payload, 'productHandle') ?? readString(payload, 'title') ?? 'a tracked product'}` };
    case 'stock_changed':
      return { object: 'tracked inventory' };
    case 'site_changed':
    case 'promo_detected':
      return { object: readString(payload, 'diffSummary') ?? 'their site' };
    default:
      return { object: 'their store' };
  }
}

function InlineEvent({ event }: { event: IntelligenceEvent }) {
  const { icon: Icon, tone } = iconFor(event.competitorEventType);
  const { bg, ink } = toneToColors(tone);
  const sentence = eventSentence(event);
  const verb = ((): string => {
    switch (event.competitorEventType) {
      case 'price_changed':
        return 'Updated';
      case 'product_added':
        return 'Listed';
      case 'product_removed':
        return 'Pulled';
      case 'sale_started':
        return 'Started a sale on';
      case 'sale_ended':
        return 'Ended a sale on';
      case 'out_of_stock':
        return 'Out of stock:';
      case 'back_in_stock':
        return 'Back in stock:';
      case 'stock_changed':
        return 'Stock shift on';
      case 'site_changed':
        return 'Site change:';
      case 'promo_detected':
        return 'Promo:';
      default:
        return 'Changed';
    }
  })();
  const magColor =
    sentence.magnitudeTone === 'red'
      ? 'var(--brand-red)'
      : sentence.magnitudeTone === 'amber'
        ? 'var(--brand-amber)'
        : 'var(--brand-muted)';
  return (
    <div className="flex items-center gap-2.5 border-t border-brand-line-soft py-2">
      <div
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
        style={{ background: bg }}
      >
        <Icon className="h-3 w-3" style={{ color: ink }} />
      </div>
      <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-brand-dim">
        {verb} {sentence.object}
        {sentence.magnitude && (
          <span className="ml-1 font-semibold" style={{ color: magColor }}>
            ({sentence.magnitude})
          </span>
        )}
      </p>
      <time
        className="shrink-0 font-mono text-[10px] text-brand-muted"
        dateTime={new Date(event.timestamp).toISOString()}
      >
        {formatRelative(event.timestamp)}
      </time>
    </div>
  );
}

export function CompetitorGroupCard({ rollup, rank }: CompetitorGroupCardProps) {
  const { competitor, week, month, spark, trend, events } = rollup;
  const isHot = rank === 1;
  const shown = events.slice(0, 3);
  const more = month - shown.length;

  return (
    <article
      className="overflow-hidden rounded-lg"
      style={{
        background: 'var(--brand-bg2)',
        boxShadow: isHot
          ? 'inset 0 0 0 1px rgba(180,83,9,0.35)'
          : 'inset 0 0 0 1px var(--brand-line-soft)',
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <CompetitorAvatar name={competitor.name} size={36} tone={isHot ? 'amber' : 'muted'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14.5px] font-semibold text-brand-text">{competitor.name}</p>
            {isHot ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: 'rgba(180,83,9,0.12)', color: 'var(--brand-amber)' }}
              >
                <Flame className="h-3 w-3" /> Most active
              </span>
            ) : (
              <TrendTag trend={trend} />
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="truncate font-mono text-[10.5px] text-brand-muted">{competitor.domain}</span>
            {competitor.platform && (
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                style={{ background: 'var(--brand-bg3)', color: 'var(--brand-muted)' }}
              >
                {PLATFORM_LABEL[competitor.platform] ?? 'Other'}
              </span>
            )}
            <CoverageBadge dataTier={competitor.dataTier} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Sparkline
            data={spark}
            width={56}
            height={18}
            color={isHot ? 'var(--brand-amber)' : 'var(--brand-muted)'}
            fill={isHot}
          />
          <div className="text-right">
            <p className="text-[15px] font-bold leading-none text-brand-text">{week}</p>
            <p className="mt-0.5 font-mono text-[8.5px] uppercase tracking-wider text-brand-muted">
              events 7d
            </p>
          </div>
        </div>
      </div>

      {shown.length > 0 && (
        <div className="px-4">
          {shown.map((e) => (
            <InlineEvent key={e.id} event={e} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="font-mono text-[10.5px] text-brand-muted">
          {more > 0 ? `${more} more this month` : month === 0 ? 'No moves this month' : 'all events shown'}
        </span>
        <Link
          href={`/wire/competitors/${competitor.id}?tab=events`}
          className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-green-ink hover:underline"
        >
          Open {competitor.name} <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
