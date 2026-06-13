import type { CompetitorDataTier } from '@/lib/hooks/use-competitors';

const TIER_LABEL: Record<CompetitorDataTier, string> = {
  full_catalog: 'Full catalog',
  selected_products: 'Selected products',
  limited: 'Limited access',
};

const TIER_TITLE: Record<CompetitorDataTier, string> = {
  full_catalog: 'Full product catalog synced hourly from the store feed',
  selected_products: 'Tracking selected product pages daily, with a weekly sitemap scan for new launches',
  limited: 'This site blocks automated catalog access. Key pages are still monitored and access is re-checked weekly.',
};

const TIER_STYLE: Record<CompetitorDataTier, { background: string; color: string }> = {
  full_catalog: { background: 'rgba(22,163,74,0.1)', color: 'var(--brand-green-ink)' },
  selected_products: { background: 'rgba(180,83,9,0.1)', color: 'var(--brand-amber)' },
  limited: { background: 'var(--brand-bg3)', color: 'var(--brand-muted)' },
};

export function CoverageBadge({ dataTier }: { dataTier: CompetitorDataTier }) {
  return (
    <span
      className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap"
      style={TIER_STYLE[dataTier]}
      title={TIER_TITLE[dataTier]}
    >
      {TIER_LABEL[dataTier]}
    </span>
  );
}
