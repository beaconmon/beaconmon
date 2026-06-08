'use client';

import { format, differenceInMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { QueryState } from '@/components/dashboard/query-state';
import { AckButton } from '@/components/dashboard/ack-button';
import { useResolveIncident } from '@/lib/hooks/use-incidents';

export interface IncidentApiRow {
  id: string;
  monitorId: string;
  startedAt: string;
  resolvedAt: string | null;
  resolutionType: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

function durationStr(startedAt: string | Date, resolvedAt: string | Date | null) {
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  const mins = differenceInMinutes(end, new Date(startedAt));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function IncidentTabRow({
  incident,
  sessionUserId,
}: {
  incident: IncidentApiRow;
  sessionUserId?: string;
}) {
  const resolve = useResolveIncident(incident.id);
  const isOpen = !incident.resolvedAt;

  return (
    <div className="grid grid-cols-4 items-center border-b border-brand-line px-4 py-2.5 last:border-b-0 hover:bg-brand-bg3/30">
      <span className="font-mono text-xs text-brand-dim">
        {format(new Date(incident.startedAt), 'MMM d, HH:mm')}
      </span>
      <span className="font-mono text-xs text-brand-dim">
        {durationStr(incident.startedAt, incident.resolvedAt)}
      </span>
      <span>
        {isOpen ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-brand-red">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red" />
            Open
          </span>
        ) : (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
            Resolved
          </span>
        )}
      </span>
      <div className="flex items-center gap-2">
        {isOpen && (
          <>
            <AckButton
              incidentId={incident.id}
              resolvedAt={incident.resolvedAt}
              acknowledgedAt={incident.acknowledgedAt}
              acknowledgedBy={incident.acknowledgedBy}
              sessionUserId={sessionUserId}
            />
            <button
              onClick={() => resolve.mutate()}
              disabled={resolve.isPending}
              className="text-[10px] text-brand-dim underline transition-colors hover:text-brand-text disabled:opacity-50"
            >
              Resolve
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function IncidentsTab({
  incidents,
  isLoading,
  isError,
  onRetry,
  sessionUserId,
}: {
  incidents: IncidentApiRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  sessionUserId?: string;
}) {
  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="border-b border-brand-line px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Incidents</h2>
      </div>
      <QueryState isLoading={isLoading} isError={isError} error={null} onRetry={onRetry} skeletonRows={5}>
        {incidents.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-brand-muted">No incidents recorded.</p>
        ) : (
          <div>
            <div className="grid grid-cols-4 border-b border-brand-line px-4 py-2">
              {['Started', 'Duration', 'Status', 'Actions'].map((h) => (
                <span key={h} className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                  {h}
                </span>
              ))}
            </div>
            {incidents.map((inc) => (
              <IncidentTabRow key={inc.id} incident={inc} sessionUserId={sessionUserId} />
            ))}
          </div>
        )}
      </QueryState>
    </div>
  );
}
