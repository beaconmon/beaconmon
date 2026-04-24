// Public status page — ISR with 30-second revalidation.
// Data is served from Redis cache, NOT directly from Postgres.
// See architecture rule #8 in CLAUDE.md.

import { notFound } from 'next/navigation';
import { getStatusPageData } from '@/lib/cache/status-pages';
import { Separator } from '@/components/ui/separator';

export const revalidate = 30;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function StatusPage({ params }: Props) {
  const { slug } = await params;
  const data = await getStatusPageData(slug);
  if (!data) notFound();

  const statusConfig = {
    operational: {
      label: 'All systems operational',
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-400',
      dot: 'bg-green-500',
    },
    degraded: {
      label: 'Partial outage',
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-400',
      dot: 'bg-yellow-500',
    },
    outage: {
      label: 'Major outage',
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
      dot: 'bg-red-500',
    },
  } as const;

  const monitorStatusConfig = {
    up: { label: 'Operational', dot: 'bg-green-500' },
    down: { label: 'Down', dot: 'bg-red-500' },
    paused: { label: 'Maintenance', dot: 'bg-gray-400' },
  } as const;

  const overall = statusConfig[data.overallStatus];
  const cachedAt = new Date(data.cachedAt);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">{data.name}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated {cachedAt.toLocaleTimeString()}
          </p>
        </div>

        {/* Overall status banner */}
        <div
          className={`rounded-lg border px-5 py-4 mb-8 flex items-center gap-3 ${overall.bg} ${overall.border}`}
        >
          <span className={`h-3 w-3 rounded-full flex-shrink-0 ${overall.dot}`} />
          <span className={`font-medium ${overall.text}`}>{overall.label}</span>
        </div>

        {/* Monitor list */}
        {data.monitors.length > 0 && (
          <div className="rounded-lg border divide-y mb-10">
            {data.monitors.map((monitor) => {
              const ms = monitorStatusConfig[monitor.currentStatus];
              return (
                <div key={monitor.id} className="flex items-center px-5 py-3.5 gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${ms.dot}`} />
                  <span className="flex-1 text-sm font-medium">{monitor.name}</span>
                  <span className="text-xs text-muted-foreground mr-4">
                    {monitor.uptimePercent90d.toFixed(2)}% uptime
                  </span>
                  <span className={`text-xs font-medium ${
                    monitor.currentStatus === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : monitor.currentStatus === 'down'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  }`}>
                    {ms.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent incidents */}
        {data.monitors.some((m) => m.recentIncidents.length > 0) && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Recent Incidents
            </h2>
            <div className="space-y-4">
              {data.monitors.flatMap((monitor) =>
                monitor.recentIncidents.map((inc) => {
                  const start = new Date(inc.startedAt);
                  const resolved = inc.resolvedAt ? new Date(inc.resolvedAt) : null;
                  const durationLabel = inc.durationMs
                    ? formatDuration(inc.durationMs)
                    : 'Ongoing';

                  return (
                    <div key={inc.id} className="rounded-lg border px-5 py-4">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <span className="text-sm font-medium">{monitor.name}</span>
                        <span className={`text-xs font-medium flex-shrink-0 ${resolved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {resolved ? 'Resolved' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {start.toLocaleString()} — {durationLabel}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {data.monitors.every((m) => m.recentIncidents.length === 0) && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Recent Incidents
            </h2>
            <p className="text-sm text-muted-foreground">No incidents in the last 90 days.</p>
          </div>
        )}

        <Separator className="mb-6" />

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          Powered by{' '}
          <a href="/" className="underline underline-offset-2 hover:text-foreground">
            Beaconmon
          </a>
        </p>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}
