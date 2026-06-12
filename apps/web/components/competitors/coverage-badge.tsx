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

export function CoverageBadge({ dataTier }: { dataTier: string }) {
  const tier: CompetitorDataTier =
    dataTier === 'full_catalog' || dataTier === 'selected_products' ? dataTier : 'limited';
  return (
    <span
      className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
      style={TIER_STYLE[tier]}
      title={TIER_TITLE[tier]}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
