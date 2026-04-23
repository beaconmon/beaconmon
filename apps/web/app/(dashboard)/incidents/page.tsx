'use client';

import Link from 'next/link';
import { formatDistanceToNow, format, differenceInMinutes } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/dashboard/query-state';
import { EmptyState } from '@/components/dashboard/empty-state';
import { useIncidents, useResolveIncident } from '@/lib/hooks/use-incidents';
import type { IncidentWithMonitor } from '@/lib/repositories/incidents';

function duration(startedAt: Date | string, resolvedAt: Date | string | null): string {
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  const mins = differenceInMinutes(end, new Date(startedAt));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function IncidentTableRow({ incident }: { incident: IncidentWithMonitor }) {
  const resolve = useResolveIncident(incident.id);
  const isOpen = !incident.resolvedAt;

  return (
    <TableRow>
      <TableCell>
        <Link
          href={`/monitors/${incident.monitorId}`}
          className="font-medium text-sm hover:underline"
        >
          {incident.monitor.name}
        </Link>
        <p className="text-xs text-muted-foreground truncate max-w-[180px]">{incident.monitor.url}</p>
      </TableCell>
      <TableCell className="text-sm">
        {format(new Date(incident.startedAt), 'MMM d, HH:mm')}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {duration(incident.startedAt as Date | string, incident.resolvedAt as Date | string | null)}
      </TableCell>
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

export default function IncidentsPage() {
  const { data: incidents, isLoading, isError, error, refetch } = useIncidents();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Incidents</h1>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        skeletonRows={4}
      >
        {incidents && incidents.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No incidents recorded"
            description="That's a good thing. Incidents appear here when monitors go down."
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Monitor</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents?.map((incident) => (
                  <IncidentTableRow key={incident.id} incident={incident} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </QueryState>
    </div>
  );
}
