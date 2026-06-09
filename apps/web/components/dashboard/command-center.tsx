'use client';

import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  ArrowRight,
  Check,
} from 'lucide-react';
import { Sparkline } from '@/components/dashboard/sparkline';
import type { MonitorRow } from '@/lib/repositories/monitors';
import type { FeedItem } from '@/lib/repositories/notifications-feed';

interface CommandCenterProps {
  monitors: MonitorRow[];
  reliabilityRate: number | undefined;
  reliabilityDirection: 'up' | 'flat' | 'down';
  reliabilitySpark: number[];
  openIncident: FeedItem | undefined;
  recentOutage: FeedItem | undefined;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function CommandCenter({
  monitors,
  reliabilityRate,
  reliabilityDirection,
  reliabilitySpark,
  openIncident,
  recentOutage,
}: CommandCenterProps) {
  const total = monitors.length;
  const downCount = monitors.filter((m) => m.currentStatus === 'down').length;
  const upCount = monitors.filter((m) => m.currentStatus === 'up').length;
  const ok = downCount === 0 && !openIncident;

  const stateLine = ok
    ? total === 0
      ? 'No monitors yet'
      : `All ${total} monitor${total === 1 ? '' : 's'} operational`
    : downCount > 0
      ? `${downCount} monitor${downCount === 1 ? '' : 's'} currently down`
      : openIncident
        ? openIncident.title
        : 'Reliability issue detected';

  const stateSub = ok
    ? total === 0
      ? 'Add monitors to get started'
      : 'No open incidents'
    : openIncident?.subtitle || `${upCount} of ${total} reporting healthy`;

  const TrendIcon =
    reliabilityDirection === 'up'
      ? TrendingUp
      : reliabilityDirection === 'down'
        ? TrendingDown
        : Minus;
  const trendColor =
    reliabilityDirection === 'up'
      ? 'var(--brand-green-ink)'
      : reliabilityDirection === 'down'
        ? 'var(--brand-red)'
        : 'var(--brand-muted)';

  const trendLabel =
    reliabilityDirection === 'up'
      ? 'Reliability improving'
      : reliabilityDirection === 'down'
        ? 'Reliability degrading'
        : 'Reliability steady';

  const trendSub =
    reliabilityRate === undefined
      ? 'No data yet, 30d'
      : `${reliabilityRate.toFixed(2)}% over 30d`;

  return (
    <aside
      aria-label="Command center"
      className="overflow-hidden rounded-lg"
      style={{
        background: 'var(--brand-bg2)',
        boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
      }}
    >
      <div className="border-b border-brand-line px-4 py-2.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-muted">
          Command center
        </p>
      </div>

      <div className="flex items-start gap-3 border-b border-brand-line-soft px-4 py-4">
        <span
          aria-hidden
          className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${ok ? '' : 'animate-blip'}`}
          style={{
            background: ok ? 'var(--brand-green)' : 'var(--brand-red)',
            boxShadow: ok
              ? '0 0 0 3px rgba(0,229,122,0.12)'
              : '0 0 0 3px rgba(255,68,68,0.12)',
          }}
        />
        <div className="min-w-0">
          <p
            className="text-[15px] font-semibold leading-snug"
            style={{ color: ok ? 'var(--brand-text)' : 'var(--brand-red)' }}
          >
            {stateLine}
          </p>
          <p className="mt-0.5 text-xs text-brand-muted">{stateSub}</p>
        </div>
      </div>

      <div className="border-b border-brand-line-soft px-4 py-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold"
            style={{ color: trendColor }}
          >
            <TrendIcon className="h-3.5 w-3.5" /> {trendLabel}
          </span>
          {reliabilitySpark.length >= 2 && (
            <Sparkline
              data={reliabilitySpark}
              width={66}
              height={20}
              color={trendColor}
              fill
            />
          )}
        </div>
        <p className="font-mono text-[10.5px] text-brand-muted">{trendSub}</p>
      </div>

      {openIncident ? (
        <Link
          href={openIncident.href || '/incidents'}
          className="flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-brand-bg3/40"
          style={{ background: 'rgba(255,68,68,0.12)' }}
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-brand-red" />
          <span className="flex-1 text-[12.5px] font-medium text-brand-text">
            {openIncident.title}
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-green-ink">
            Open <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      ) : downCount > 0 ? (
        <Link
          href="/monitors"
          className="flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-brand-bg3/40"
          style={{ background: 'rgba(255,68,68,0.12)' }}
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-brand-red" />
          <span className="flex-1 text-[12.5px] font-medium text-brand-text">
            {downCount} monitor{downCount === 1 ? '' : 's'} need a look
          </span>
          <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-green-ink">
            Review <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-2 px-4 py-3">
          <Check className="h-3.5 w-3.5 text-brand-green-ink" />
          <span className="text-[12.5px] text-brand-dim">
            Nothing needs action right now.
          </span>
        </div>
      )}

      {recentOutage && !openIncident && (
        <div className="border-t border-brand-line-soft px-4 py-3">
          <div className="mb-0.5 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-muted">
              Recent
            </span>
            {recentOutage.kind === 'incident.resolved' && (
              <span
                className="rounded-full px-1.5 py-0 font-mono text-[8.5px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(0,229,122,0.12)',
                  color: 'var(--brand-green-ink)',
                }}
              >
                Resolved
              </span>
            )}
          </div>
          {recentOutage.href ? (
            <Link
              href={recentOutage.href}
              className="block text-[12.5px] font-medium text-brand-text hover:underline"
            >
              {recentOutage.title}
            </Link>
          ) : (
            <p className="text-[12.5px] font-medium text-brand-text">
              {recentOutage.title}
            </p>
          )}
          <p className="mt-0.5 font-mono text-[10.5px] text-brand-muted">
            {formatRelative(recentOutage.occurredAt)}
            {recentOutage.subtitle ? ` · ${recentOutage.subtitle}` : ''}
          </p>
        </div>
      )}
    </aside>
  );
}
