'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/dashboard/query-state';
import { CompetitorManagementSheet } from '@/components/intelligence/competitor-management-sheet';
import { useCompetitors } from '@/lib/hooks/use-competitors';
import { useSession } from '@/lib/hooks/use-session';

const PLATFORM_LABEL: Record<string, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  other: 'Other',
};

export default function CompetitorsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: session } = useSession();
  const plan = session?.plan ?? 'free';
  const { data: competitors, isLoading, isError, refetch } = useCompetitors();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-text">Competitors</h1>
          <p className="mt-0.5 text-sm text-brand-muted">
            Track price, content, and product changes across your competitive landscape.
          </p>
        </div>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          Add competitor
        </Button>
      </div>

      <div
        className="overflow-hidden rounded-lg"
        style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
      >
        <div className="border-b border-brand-line px-4 py-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
            All competitors
          </p>
        </div>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          skeletonRows={4}
        >
          {!competitors || competitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Brain className="mb-3 h-10 w-10 text-brand-muted" />
              <h3 className="text-sm font-medium text-brand-text">No competitors yet</h3>
              <p className="mt-1 max-w-xs text-sm text-brand-muted">
                Add a competitor to start tracking their prices, products, and content changes.
              </p>
              <Button size="sm" className="mt-4" onClick={() => setSheetOpen(true)}>
                Add competitor
              </Button>
            </div>
          ) : (
            <div>
              {competitors.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/competitors/${c.id}`}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-bg3/40 ${i > 0 ? 'border-t border-brand-line/60' : ''}`}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
                    style={{ background: 'rgba(180,83,9,0.12)', color: 'var(--brand-amber)' }}
                  >
                    {(c.name[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-text">{c.name}</p>
                    <p className="truncate font-mono text-xs text-brand-muted">{c.domain}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider"
                      style={{ background: 'var(--brand-bg3)', color: 'var(--brand-muted)' }}
                    >
                      {PLATFORM_LABEL[c.platform] ?? 'Other'}
                    </span>
                    {!c.isActive && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                        Inactive
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-brand-muted" />
                </Link>
              ))}
            </div>
          )}
        </QueryState>
      </div>

      <CompetitorManagementSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        plan={plan}
        onChanged={() => {
          setSheetOpen(false);
          void refetch();
        }}
      />
    </div>
  );
}
