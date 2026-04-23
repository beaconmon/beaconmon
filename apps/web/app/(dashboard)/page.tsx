'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryState } from '@/components/dashboard/query-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EmptyState } from '@/components/dashboard/empty-state';
import { useMonitors } from '@/lib/hooks/use-monitors';
import { useCheckResults } from '@/lib/hooks/use-check-results';
import type { MonitorRow } from '@/lib/repositories/monitors';

function computeSummary(monitors: MonitorRow[]) {
  const total = monitors.length;
  const up = monitors.filter((m) => m.currentStatus === 'up').length;
  const down = monitors.filter((m) => m.currentStatus === 'down').length;
  return { total, up, down };
}

function Sparkline({ monitorId }: { monitorId: string }) {
  const { data, isLoading } = useCheckResults(monitorId, '24h', 50);

  if (isLoading) return <Skeleton className="h-8 w-24" />;
  if (!data || data.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  const chartData = [...data]
    .reverse()
    .map((r) => ({ rt: r.responseTimeMs ?? 0 }));

  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="rt"
            stroke="#6366f1"
            dot={false}
            strokeWidth={1.5}
          />
          <Tooltip
            contentStyle={{ fontSize: '11px', padding: '4px 8px' }}
            formatter={(v) => [`${v ?? 0}ms`, 'Response']}
            labelFormatter={() => ''}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MonitorTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="secondary" className="text-xs uppercase tracking-wide">
      {type}
    </Badge>
  );
}

export default function OverviewPage() {
  const { data: monitors, isLoading, isError, error, refetch } = useMonitors();
  const router = useRouter();

  const summary = monitors ? computeSummary(monitors) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Monitors</h1>
        <Button asChild size="sm">
          <Link href="/monitors/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Add monitor
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : summary && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total monitors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{summary.up}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Down
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{summary.down}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monitor table */}
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        skeletonRows={4}
      >
        {monitors && monitors.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No monitors yet"
            description="Add your first monitor to start tracking uptime and response times."
            action={{ label: 'Add monitor', href: '/monitors/new' }}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last checked</TableHead>
                  <TableHead className="hidden lg:table-cell">24h response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monitors?.map((monitor) => (
                  <TableRow
                    key={monitor.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/monitors/${monitor.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{monitor.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {monitor.url}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <MonitorTypeBadge type={monitor.type} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={monitor.currentStatus} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {monitor.lastCheckedAt
                        ? formatDistanceToNow(new Date(monitor.lastCheckedAt), { addSuffix: true })
                        : '—'}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Sparkline monitorId={monitor.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </QueryState>
    </div>
  );
}
