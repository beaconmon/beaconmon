'use client';

import { Sparkline } from '@/components/dashboard/sparkline';
import { binBy7Days } from '@/lib/utils/intelligence';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

interface IntelStatStripProps {
  events: IntelligenceEvent[];
}

interface StatCellProps {
  label: string;
  count: number;
  sparkData: number[];
  accent?: 'amber' | 'green' | 'red' | 'dim';
}

function StatCell({ label, count, sparkData, accent = 'dim' }: StatCellProps) {
  const countColor =
    accent === 'amber'
      ? 'text-amber-500 dark:text-amber-400'
      : accent === 'green'
        ? 'text-brand-green-ink'
        : accent === 'red'
          ? 'text-brand-red'
          : 'text-brand-text';

  const sparkColor =
    accent === 'amber'
      ? 'rgba(180,83,9,0.7)'
      : accent === 'green'
        ? 'var(--brand-green)'
        : accent === 'red'
          ? 'var(--brand-red)'
          : 'var(--brand-muted)';

  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-4"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span className={`text-2xl font-bold ${countColor}`}>{count}</span>
        <Sparkline data={sparkData} width={48} height={18} color={sparkColor} />
      </div>
    </div>
  );
}

export function IntelStatStrip({ events }: IntelStatStripProps) {
  const competitorEvents = events.filter((e) => e.type !== 'expiry_alert');
  const pricingEvents = events.filter((e) => e.type === 'pricing_change');
  const contentEvents = events.filter((e) => e.type === 'content_change');
  const expiryEvents = events.filter((e) => e.type === 'expiry_alert');

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCell
        label="Competitor moves"
        count={competitorEvents.length}
        sparkData={binBy7Days(competitorEvents)}
        accent="amber"
      />
      <StatCell
        label="Pricing changes"
        count={pricingEvents.length}
        sparkData={binBy7Days(pricingEvents)}
        accent="amber"
      />
      <StatCell
        label="Content edits"
        count={contentEvents.length}
        sparkData={binBy7Days(contentEvents)}
        accent="dim"
      />
      <StatCell
        label="Expiry alerts"
        count={expiryEvents.length}
        sparkData={binBy7Days(expiryEvents)}
        accent={expiryEvents.length > 0 ? 'red' : 'dim'}
      />
    </div>
  );
}
