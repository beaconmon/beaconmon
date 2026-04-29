'use client';

import { format } from 'date-fns';
import { useAcknowledgeIncident } from '@/lib/hooks/use-incidents';

interface AckButtonProps {
  incidentId: string;
  resolvedAt: string | Date | null;
  acknowledgedAt: string | Date | null;
  acknowledgedBy: string | null;
  sessionUserId?: string;
}

export function AckButton({
  incidentId,
  resolvedAt,
  acknowledgedAt,
  acknowledgedBy,
  sessionUserId,
}: AckButtonProps) {
  const ack = useAcknowledgeIncident(incidentId);

  if (resolvedAt) return null;

  if (acknowledgedAt) {
    const who =
      sessionUserId && acknowledgedBy === sessionUserId ? 'you' : 'a teammate';
    return (
      <span className="text-xs text-brand-muted">
        Ack&apos;d by {who} at {format(new Date(acknowledgedAt), 'MMM d, HH:mm')}
      </span>
    );
  }

  return (
    <button
      onClick={() => ack.mutate()}
      disabled={ack.isPending}
      className="rounded-md border border-brand-line px-3 py-1 text-xs text-brand-dim transition-colors hover:border-brand-outline hover:text-brand-text disabled:opacity-50"
    >
      {ack.isPending ? 'Acknowledging…' : 'Acknowledge'}
    </button>
  );
}
