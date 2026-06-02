'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Sparkline } from '@/components/dashboard/sparkline';
import { CompetitorManagementSheet } from './competitor-management-sheet';
import { binBy7Days } from '@/lib/utils/intelligence';
import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';
import type { CompetitorItem } from '@/lib/hooks/use-competitors';
import type { PlanTier } from '@beaconmon/types';

interface CompetitorWatchlistPanelProps {
  competitors: CompetitorItem[];
  events: IntelligenceEvent[];
  plan: PlanTier;
  onChanged: () => void;
}

export function CompetitorWatchlistPanel({
  competitors,
  events,
  plan,
  onChanged,
}: CompetitorWatchlistPanelProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const withCounts = competitors
    .map((c) => ({
      ...c,
      count: events.filter((e) => e.monitorId === c.id).length,
      sparkData: binBy7Days(events.filter((e) => e.monitorId === c.id)),
    }))
    .sort((a, b) => b.count - a.count);

  const top2Ids = new Set(withCounts.slice(0, 2).filter((c) => c.count > 0).map((c) => c.id));

  return (
    <>
      <div
        className="overflow-hidden rounded-lg"
        style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
      >
        <div className="flex items-center justify-between border-b border-brand-line px-4 py-2.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
            Watchlist
          </p>
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-brand-muted transition-colors hover:bg-brand-bg3 hover:text-brand-text"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        {withCounts.length === 0 ? (
          <div className="px-4 py-5 text-center">
            <p className="text-sm text-brand-muted">No competitor monitors yet.</p>
            <button
              onClick={() => setSheetOpen(true)}
              className="mt-2 text-xs text-brand-green-ink hover:underline"
            >
              Add competitors →
            </button>
          </div>
        ) : (
          <div>
            {withCounts.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 px-4 py-2.5 ${i > 0 ? 'border-t border-brand-line/60' : ''}`}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                  style={{ background: 'rgba(180,83,9,0.12)', color: 'var(--brand-amber)' }}
                >
                  {(c.name[0] ?? '?').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-brand-text">{c.name}</p>
                </div>
                {top2Ids.has(c.id) && (
                  <span
                    className="shrink-0 rounded px-1 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'rgba(180,83,9,0.12)',
                      color: 'var(--brand-amber)',
                      boxShadow: 'inset 0 0 0 1px rgba(180,83,9,0.25)',
                    }}
                  >
                    HOT
                  </span>
                )}
                <div className="shrink-0">
                  <Sparkline
                    data={c.sparkData}
                    width={36}
                    height={14}
                    color="rgba(180,83,9,0.7)"
                  />
                </div>
                <span className="w-6 shrink-0 text-right font-mono text-[11px] text-brand-muted">
                  {c.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <CompetitorManagementSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        plan={plan}
        onChanged={() => {
          setSheetOpen(false);
          onChanged();
        }}
      />
    </>
  );
}
