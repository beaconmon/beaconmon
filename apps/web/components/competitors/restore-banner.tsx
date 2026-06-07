'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMonitors } from '@/lib/hooks/use-monitors';
import { useSession } from '@/lib/hooks/use-session';
import { apiFetch } from '@/lib/api-fetch';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { MonitorRow } from '@/lib/repositories/monitors';

function getPausedByTrialEnd(monitors: MonitorRow[]): MonitorRow[] {
  return monitors.filter((m) => m.pausedReason === 'trial_end');
}

function hasRoomForFreeRestore(
  paused: MonitorRow,
  allMonitors: MonitorRow[],
  plan: string,
): boolean {
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
  if (!limits) return false;

  if (paused.isCompetitor) {
    const cap = limits.competitorMonitors;
    if (cap === -1) return true;
    const active = allMonitors.filter((m) => m.isCompetitor && m.isActive && !m.pausedReason).length;
    return active < cap;
  } else {
    const cap = limits.monitors;
    if (cap === -1) return true;
    const active = allMonitors.filter((m) => !m.isCompetitor && m.isActive && !m.pausedReason).length;
    return active < cap;
  }
}

export function RestoreBanner() {
  const { data: monitors } = useMonitors();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (dismissed || !monitors || !session) return null;

  const plan = session.plan ?? 'free';
  const paused = getPausedByTrialEnd(monitors);
  if (paused.length === 0) return null;

  const competitorCount = paused.filter((m) => m.isCompetitor).length;
  const ownCount = paused.filter((m) => !m.isCompetitor).length;

  // Find a candidate for free restore (first paused competitor, else first paused own)
  const freeCandidate =
    paused.find((m) => m.isCompetitor && hasRoomForFreeRestore(m, monitors, plan)) ??
    paused.find((m) => !m.isCompetitor && hasRoomForFreeRestore(m, monitors, plan)) ??
    null;

  async function handleRestoreOne() {
    if (!freeCandidate) return;
    setRestoringId(freeCandidate.id);
    try {
      const res = await apiFetch('/api/monitors/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitorId: freeCandidate.id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        alert(err.error ?? 'Failed to restore monitor');
      } else {
        await queryClient.invalidateQueries({ queryKey: ['monitors'] });
      }
    } finally {
      setRestoringId(null);
    }
  }

  const summary: string[] = [];
  if (competitorCount > 0) summary.push(`${competitorCount} competitor monitor${competitorCount !== 1 ? 's' : ''}`);
  if (ownCount > 0) summary.push(`${ownCount} uptime monitor${ownCount !== 1 ? 's' : ''}`);

  return (
    <div
      className="relative flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
      role="alert"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

      <div className="flex-1 space-y-2">
        <p className="font-medium text-amber-900">
          {summary.join(' and ')} paused after your trial ended
        </p>
        <p className="text-amber-800">
          Upgrade within 30 days to restore everything automatically. After that they cannot be
          recovered.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/settings/billing"
            className="inline-flex h-7 items-center rounded-md bg-amber-700 px-3 text-xs font-semibold text-white hover:bg-amber-800 transition-colors"
          >
            Upgrade to restore all
          </Link>
          {freeCandidate && (
            <button
              onClick={handleRestoreOne}
              disabled={restoringId !== null}
              className="inline-flex h-7 items-center rounded-md border border-amber-300 bg-white px-3 text-xs font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-50 transition-colors"
            >
              {restoringId ? 'Restoring...' : `Restore "${freeCandidate.name}" for free`}
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-0.5 text-amber-500 hover:text-amber-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
