'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { formatDistanceToNow, formatDistance, format } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { QueryState } from '@/components/dashboard/query-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { useMonitor, useDeleteMonitor } from '@/lib/hooks/use-monitors';
import { useCheckResults, type TimeRange } from '@/lib/hooks/use-check-results';
import { useMonitorIncidents, useResolveIncident } from '@/lib/hooks/use-incidents';
import type { CheckResultRow } from '@/lib/hooks/use-check-results';

const RANGES: TimeRange[] = ['24h', '7d', '30d', '90d'];

function computeUptime(results: CheckResultRow[]): number {
  if (results.length === 0) return 0;
  const up = results.filter((r) => r.success).length;
  return Math.round((up / results.length) * 10000) / 100;
}

function buildChartData(results: CheckResultRow[]) {
  return [...results]
    .reverse()
    .map((r) => ({
      time: format(new Date(r.checkedAt), 'MMM d HH:mm'),
      p50: r.responseTimeMs ?? 0,
    }));
}

function UptimeCard({ label, results }: { label: string; results: CheckResultRow[] }) {
  const pct = computeUptime(results);
  const color = pct >= 99 ? 'text-green-600' : pct >= 90 ? 'text-yellow-600' : 'text-red-600';
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${color}`}>{pct}%</p>
      </CardContent>
    </Card>
  );
}

interface IncidentApiRow {
  id: string;
  startedAt: string;
  resolvedAt: string | null;
  resolutionType: string | null;
}

function IncidentRow({ incident }: { incident: IncidentApiRow }) {
  const resolve = useResolveIncident(incident.id);
  const isOpen = !incident.resolvedAt;
  const duration = incident.resolvedAt
    ? formatDistance(new Date(incident.startedAt), new Date(incident.resolvedAt))
    : 'Ongoing';

  return (
    <TableRow>
      <TableCell className="text-sm">
        {format(new Date(incident.startedAt), 'MMM d, HH:mm')}
      </TableCell>
      <TableCell className="text-sm">{duration}</TableCell>
      <TableCell>
        {isOpen ? (
          <Badge variant="destructive" className="text-xs">Ongoing</Badge>
        ) : (
          <Badge variant="outline" className="text-xs capitalize">
            {incident.resolutionType ?? 'Resolved'}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {isOpen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => resolve.mutate()}
            disabled={resolve.isPending}
          >
            Resolve
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function MonitorDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [range, setRange] = useState<TimeRange>('24h');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const monitorQ = useMonitor(id);
  const resultsQ = useCheckResults(id, range, 500);
  const incidentsQ = useMonitorIncidents(id);
  const deleteMonitor = useDeleteMonitor(id);

  const monitor = monitorQ.data;
  const results = resultsQ.data ?? [];
  const incidents = (incidentsQ.data ?? []) as unknown as IncidentApiRow[];

  const chartData = buildChartData(results);

  function handleDelete() {
    deleteMonitor.mutate(undefined, {
      onSuccess: () => router.push('/'),
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <QueryState isLoading={monitorQ.isLoading} isError={monitorQ.isError} error={monitorQ.error} onRetry={() => monitorQ.refetch()} skeletonRows={1}>
        {monitor && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-semibold">{monitor.name}</h1>
                <StatusBadge status={monitor.currentStatus} />
              </div>
              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {monitor.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/monitors/${id}/edit`}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </QueryState>

      {/* Uptime cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {(['24h', '7d', '30d', '90d'] as TimeRange[]).map((r) => (
          <UptimeRangeCard key={r} label={r} monitorId={id} />
        ))}
      </div>

      {/* Response time chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Response time</CardTitle>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <Button
                key={r}
                variant={range === r ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <QueryState isLoading={resultsQ.isLoading} isError={resultsQ.isError} error={resultsQ.error} onRetry={() => resultsQ.refetch()}>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No data for this period</p>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} unit="ms" />
                    <Tooltip formatter={(v) => [`${v ?? 0}ms`]} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="p50" name="Response time" stroke="#6366f1" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </QueryState>
        </CardContent>
      </Card>

      {/* Incidents */}
      <div>
        <h2 className="text-base font-medium mb-3">Incidents</h2>
        <QueryState isLoading={incidentsQ.isLoading} isError={incidentsQ.isError} error={incidentsQ.error} onRetry={() => incidentsQ.refetch()}>
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No incidents recorded.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <IncidentRow key={incident.id} incident={incident} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </QueryState>
      </div>

      {/* Check results */}
      <div>
        <h2 className="text-base font-medium mb-3">Recent checks</h2>
        <QueryState isLoading={resultsQ.isLoading} isError={resultsQ.isError} error={resultsQ.error} onRetry={() => resultsQ.refetch()} skeletonRows={5}>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No check results yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Response time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.slice(0, 50).map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(r.checkedAt), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        {r.success ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs" variant="outline">OK</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Fail</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.statusCode ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.responseTimeMs != null ? `${r.responseTimeMs}ms` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </QueryState>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete monitor</DialogTitle>
            <DialogDescription>
              This will permanently delete this monitor and stop all checks. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMonitor.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Separate component to avoid per-range query re-renders contaminating parent
function UptimeRangeCard({ label, monitorId }: { label: TimeRange; monitorId: string }) {
  const { data, isLoading } = useCheckResults(monitorId, label, 500);
  if (isLoading) return <Card><CardContent className="pt-6"><div className="h-8 animate-pulse bg-muted rounded" /></CardContent></Card>;
  return <UptimeCard label={label} results={data ?? []} />;
}
