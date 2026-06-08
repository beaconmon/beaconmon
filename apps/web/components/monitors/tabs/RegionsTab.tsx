'use client';

import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CheckResultRow } from '@/lib/hooks/use-check-results';

function computeUptime(results: CheckResultRow[]) {
  if (results.length === 0) return null;
  const up = results.filter((r) => r.success).length;
  return Math.round((up / results.length) * 10000) / 100;
}

export function RegionsTab({ results }: { results: CheckResultRow[] }) {
  const regionMap = new Map<string, CheckResultRow[]>();
  for (const r of results) {
    const key = r.region ?? 'unknown';
    const existing = regionMap.get(key) ?? [];
    existing.push(r);
    regionMap.set(key, existing);
  }

  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
          Region status
        </h2>
      </div>
      {regionMap.size === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-brand-muted">No region data available.</p>
      ) : (
        <div>
          <div className="grid grid-cols-4 border-b border-brand-line px-4 py-2">
            {['Region', 'Status', 'Last response', 'Uptime'].map((h) => (
              <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                {h}
              </span>
            ))}
          </div>
          {Array.from(regionMap.entries()).map(([region, regionResults]) => {
            const latest = regionResults[0];
            const uptime = computeUptime(regionResults);
            const uptimeColor =
              uptime == null
                ? 'text-brand-muted'
                : uptime >= 99
                ? 'text-brand-green-ink'
                : uptime >= 90
                ? 'text-brand-amber'
                : 'text-brand-red';

            return (
              <div
                key={region}
                className="grid grid-cols-4 border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30"
              >
                <span className="flex items-center gap-1.5 font-mono text-xs text-brand-dim">
                  <Globe className="h-3 w-3 text-brand-muted" />
                  {region}
                </span>
                <span>
                  <span
                    className={cn(
                      'inline-block h-2 w-2 rounded-full',
                      latest?.success ? 'bg-brand-green' : 'bg-brand-red'
                    )}
                  />
                </span>
                <span className="font-mono text-sm text-brand-dim">
                  {latest?.responseTimeMs != null ? `${latest.responseTimeMs}ms` : '—'}
                </span>
                <span className={cn('font-mono text-sm font-semibold', uptimeColor)}>
                  {uptime != null ? `${uptime}%` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
