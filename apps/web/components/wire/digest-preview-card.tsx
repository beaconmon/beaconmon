'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useIntelligenceSettings } from '@/lib/hooks/use-intelligence-settings';
import type { CompetitorRollup } from '@/lib/wire/rollup';

interface DigestPreviewCardProps {
  rollups: CompetitorRollup[];
}

export function DigestPreviewCard({ rollups }: DigestPreviewCardProps) {
  const { data } = useIntelligenceSettings();
  const prefs = data?.prefs;

  const top = rollups.find((r) => r.month > 0);
  const totalMoves = rollups.reduce((sum, r) => sum + r.month, 0);
  const otherMoves = top ? totalMoves - top.month : totalMoves;

  const cadence =
    prefs?.frequency === 'daily'
      ? 'Daily, 08:00'
      : prefs?.frequency === 'weekly'
        ? 'Weekly, Monday 08:00'
        : prefs?.frequency === 'both'
          ? 'Daily + weekly'
          : 'Not configured';

  const lead = top
    ? `Lead story: ${top.competitor.name}'s recent moves.${otherMoves > 0 ? ` ${otherMoves} more rolled up by competitor.` : ''}`
    : 'No qualifying moves yet. Your digest will lead with the next major change.';

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{
        background: 'linear-gradient(180deg, rgba(0,229,122,0.06) 0%, var(--brand-bg2) 60%)',
        boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)',
      }}
    >
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5 text-brand-green-ink" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted">
            Tomorrow&apos;s digest
          </p>
        </div>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        <p className="text-[13px] font-semibold text-brand-text">{cadence}</p>
        <p className="text-[12px] leading-relaxed text-brand-dim">{lead}</p>
        <Link
          href="/wire/settings"
          className="inline-flex items-center gap-1.5 pt-1 text-[11.5px] font-semibold text-brand-green-ink hover:underline"
        >
          Edit digest <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
