'use client';

import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/dashboard/query-state';
import type { CheckResultRow, TimeRange } from '@/lib/hooks/use-check-results';
import type { PerformanceAlertRow } from '@/lib/hooks/use-anomalies';

const RANGES: TimeRange[] = ['24h', '7d', '30d', '90d'];

interface ChartPayload {
  value?: unknown;
}

function ChartTooltip(props: TooltipProps) {
  const { active, payload, label } = props as { active?: boolean; payload?: ChartPayload[]; label?: string };
  if (!active || !Array.isArray(payload) || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-brand-line bg-brand-bg3 px-3 py-2 text-xs shadow-lg">
      <p className="text-brand-muted">{label}</p>
      <p className="font-mono font-semibold text-brand-green-ink">{String(payload[0]?.value ?? 0)}ms</p>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">{label}</span>
      <span className="font-mono text-sm font-semibold text-brand-text">{value}</span>
    </div>
  );
}

function statusCodeColor(code: number | null) {
  if (code == null) return 'text-brand-muted';
  if (code < 300) return 'text-brand-green-ink';
  if (code < 400) return 'text-brand-amber';
  return 'text-brand-red';
}

function computeStats(results: CheckResultRow[]) {
  const times = results.map((r) => r.responseTimeMs).filter((v): v is number => v != null);
  if (times.length === 0) return { min: null, avg: null, max: null, p95: null };
  const sorted = [...times].sort((a, b) => a - b);
  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
  return { min: sorted[0], avg, max: sorted[sorted.length - 1], p95 };
}

export interface PerformanceTabProps {
  results: CheckResultRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  range: TimeRange;
  onRangeChange: (r: TimeRange) => void;
  recentLimit: number;
  onLoadMore: () => void;
  isAnomalyMonitor: boolean;
  hasRegionData: boolean;
  chartAnomalies: PerformanceAlertRow[];
  bucketFmt: string;
}

export function PerformanceTab({
  results,
  isLoading,
  isError,
  onRetry,
  range,
  onRangeChange,
  recentLimit,
  onLoadMore,
  isAnomalyMonitor,
  hasRegionData,
  chartAnomalies,
  bucketFmt,
}: PerformanceTabProps) {
  const byBucket = new Map<string, number[]>();
  [...results].reverse().forEach((r) => {
    if (r.responseTimeMs == null) return;
    const key = format(new Date(r.checkedAt), bucketFmt);
    const bucket = byBucket.get(key) ?? [];
    bucket.push(r.responseTimeMs);
    byBucket.set(key, bucket);
  });
  const chartData = [...byBucket.entries()].map(([time, msList]) => ({
    time,
    ms: Math.round(msList.reduce((a, b) => a + b, 0) / msList.length),
  }));

  const stats = computeStats(results);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-brand-line bg-brand-surface">
        <div className="flex items-center justify-between border-b border-brand-line px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Response time
          </h2>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => onRangeChange(r)}
                className={cn(
                  'rounded px-2 py-1 text-xs font-medium transition-colors',
                  range === r
                    ? 'bg-brand-bg3 text-brand-text'
                    : 'text-brand-muted hover:text-brand-dim'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4 pt-4">
          <QueryState isLoading={isLoading} isError={isError} error={null} onRetry={onRetry}>
            {chartData.length === 0 ? (
              <p className="py-12 text-center text-sm text-brand-muted">No data for this period</p>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00E57A" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#00E57A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222230" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: '#63636F' }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#63636F' }}
                        tickLine={false}
                        axisLine={false}
                        unit="ms"
                        width={48}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="ms"
                        stroke="#00E57A"
                        strokeWidth={1.5}
                        fill="url(#rtGrad)"
                        dot={false}
                      />
                      {chartAnomalies.map((a) => (
                        <ReferenceDot
                          key={a.id}
                          x={format(new Date(a.checkedAt), bucketFmt)}
                          y={a.responseTimeMs}
                          r={4}
                          fill="#ef4444"
                          stroke="#7f1d1d"
                          strokeWidth={1}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 flex items-center gap-6 border-t border-brand-line pt-4">
                  <StatPill label="Min" value={stats.min != null ? `${stats.min}ms` : '—'} />
                  <StatPill label="Avg" value={stats.avg != null ? `${stats.avg}ms` : '—'} />
                  <StatPill label="Max" value={stats.max != null ? `${stats.max}ms` : '—'} />
                  <StatPill label="p95" value={stats.p95 != null ? `${stats.p95}ms` : '—'} />
                  {isAnomalyMonitor && chartAnomalies.length > 0 && (
                    <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-brand-red">
                      <span className="h-2 w-2 rounded-full bg-brand-red" />
                      Smart Alert (z &gt; 3.0)
                    </span>
                  )}
                </div>
              </>
            )}
          </QueryState>
        </div>
      </div>

      <div className="rounded-lg border border-brand-line bg-brand-surface">
        <div className="border-b border-brand-line px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Recent checks
          </h2>
        </div>
        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={null}
          onRetry={onRetry}
          skeletonRows={5}
        >
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-brand-muted">No check results yet.</p>
          ) : (
            <div>
              <div className={cn('border-b border-brand-line px-4 py-2', hasRegionData ? 'grid grid-cols-5' : 'grid grid-cols-4')}>
                {['Time', ...(hasRegionData ? ['Region'] : []), 'Code', 'Response', 'Result'].map((h) => (
                  <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                    {h}
                  </span>
                ))}
              </div>
              {results.slice(0, recentLimit).map((r) => (
                <div
                  key={r.id}
                  className={cn('border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30', hasRegionData ? 'grid grid-cols-5' : 'grid grid-cols-4')}
                >
                  <span className="font-mono text-xs text-brand-dim">
                    {format(new Date(r.checkedAt), 'MMM d, HH:mm:ss')}
                  </span>
                  {hasRegionData && (
                    <span className="font-mono text-xs text-brand-muted">
                      {r.region ?? '—'}
                    </span>
                  )}
                  <span className={cn('font-mono text-sm font-semibold', statusCodeColor(r.statusCode))}>
                    {r.statusCode ?? '—'}
                  </span>
                  <span className="font-mono text-sm text-brand-dim">
                    {r.responseTimeMs != null ? `${r.responseTimeMs}ms` : '—'}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider',
                      r.success ? 'text-brand-green-ink' : 'text-brand-red'
                    )}
                  >
                    {r.success ? 'OK' : 'Fail'}
                  </span>
                </div>
              ))}
              {results.length > recentLimit && (
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="text-[10px] uppercase tracking-wider text-brand-muted">
                    Showing {recentLimit} of {results.length}
                  </span>
                  <Button size="sm" variant="outline" onClick={onLoadMore}>
                    Load more
                  </Button>
                </div>
              )}
            </div>
          )}
        </QueryState>
      </div>
    </div>
  );
}
