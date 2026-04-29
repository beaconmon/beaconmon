'use client';

import { useState } from 'react';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { QueryState } from '@/components/dashboard/query-state';
import { EmptyState } from '@/components/dashboard/empty-state';
import {
  useMaintenanceWindows,
  useCreateMaintenanceWindow,
  useDeleteMaintenanceWindow,
} from '@/lib/hooks/use-maintenance-windows';
import { useMonitors } from '@/lib/hooks/use-monitors';
import type { MaintenanceWindowRow } from '@/lib/repositories/maintenance-windows';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function windowStatus(w: MaintenanceWindowRow): 'active' | 'upcoming' | 'past' {
  const now = new Date();
  const start = new Date(w.startsAt);
  const end = new Date(w.endsAt);
  if (isWithinInterval(now, { start, end })) return 'active';
  if (isFuture(start)) return 'upcoming';
  return 'past';
}

function durationLabel(startsAt: Date | string, endsAt: Date | string) {
  const mins = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

// ─── Window card ──────────────────────────────────────────────────────────────

function WindowCard({
  window: w,
  monitorNames,
  onDelete,
  isDeleting,
}: {
  window: MaintenanceWindowRow;
  monitorNames: Record<string, string>;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const status = windowStatus(w);

  return (
    <div className="rounded-lg border border-brand-line bg-brand-surface">
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                status === 'active' && 'bg-brand-amber/15 text-brand-amber',
                status === 'upcoming' && 'bg-brand-green/15 text-brand-green',
                status === 'past' && 'bg-brand-bg3 text-brand-muted'
              )}
            >
              {status === 'active' && <span className="h-1.5 w-1.5 rounded-full bg-brand-amber" />}
              {status}
            </span>
            <span className="font-mono text-xs text-brand-dim">
              {format(new Date(w.startsAt), 'MMM d, HH:mm')}
              {' → '}
              {format(new Date(w.endsAt), 'MMM d, HH:mm')}
            </span>
            <span className="text-xs text-brand-muted">
              {durationLabel(w.startsAt, w.endsAt)}
            </span>
          </div>

          {w.reason && (
            <p className="text-sm text-brand-dim">{w.reason}</p>
          )}

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {w.monitorIds.map((mid) => (
              <span
                key={mid}
                className="rounded border border-brand-line bg-brand-bg3 px-2 py-0.5 text-[10px] text-brand-muted"
              >
                {monitorNames[mid] ?? mid.slice(0, 8)}
              </span>
            ))}
          </div>
        </div>

        {status !== 'past' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="shrink-0 text-brand-muted hover:text-brand-red"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Group heading ─────────────────────────────────────────────────────────────

function GroupHeading({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{label}</h2>
      <span className="rounded-full bg-brand-bg3 px-2 py-0.5 text-[10px] font-medium text-brand-muted">
        {count}
      </span>
    </div>
  );
}

// ─── Create dialog ─────────────────────────────────────────────────────────────

function toLocalDatetimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CreateWindowDialog({
  open,
  onClose,
  monitorOptions,
}: {
  open: boolean;
  onClose: () => void;
  monitorOptions: { id: string; name: string }[];
}) {
  const create = useCreateMaintenanceWindow();
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 5 * 60 * 1000);
  const defaultEnd = new Date(now.getTime() + 65 * 60 * 1000);

  const [startsAt, setStartsAt] = useState(toLocalDatetimeValue(defaultStart));
  const [endsAt, setEndsAt] = useState(toLocalDatetimeValue(defaultEnd));
  const [reason, setReason] = useState('');
  const [selectedMonitors, setSelectedMonitors] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  function reset() {
    setStartsAt(toLocalDatetimeValue(new Date(Date.now() + 5 * 60 * 1000)));
    setEndsAt(toLocalDatetimeValue(new Date(Date.now() + 65 * 60 * 1000)));
    setReason('');
    setSelectedMonitors([]);
    setFormError('');
  }

  function toggleMonitor(id: string) {
    setSelectedMonitors((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function handleSubmit() {
    if (!startsAt || !endsAt) {
      setFormError('Start and end times are required');
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError('End time must be after start time');
      return;
    }
    if (selectedMonitors.length === 0) {
      setFormError('Select at least one monitor');
      return;
    }
    setFormError('');
    create.mutate(
      {
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        reason: reason || undefined,
        monitorIds: selectedMonitors,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
        onError: (err) => setFormError(err.message),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New maintenance window</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-brand-dim">Start time</Label>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-brand-dim">End time</Label>
              <Input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-brand-dim">Reason (optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Planned database migration, routine deploy…"
              className="h-20 resize-none text-sm"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-brand-dim">Monitors affected</Label>
            {monitorOptions.length === 0 ? (
              <p className="text-xs text-brand-muted">No monitors available.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-md border border-brand-line divide-y divide-brand-line">
                {monitorOptions.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMonitor(m.id)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-brand-bg3/60',
                      selectedMonitors.includes(m.id) && 'bg-brand-bg3'
                    )}
                  >
                    <div
                      className={cn(
                        'h-4 w-4 shrink-0 rounded border',
                        selectedMonitors.includes(m.id)
                          ? 'border-brand-green bg-brand-green'
                          : 'border-brand-line bg-transparent'
                      )}
                    >
                      {selectedMonitors.includes(m.id) && (
                        <svg viewBox="0 0 16 16" fill="none" className="h-full w-full text-brand-bg">
                          <path d="M3.5 8l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="truncate text-xs text-brand-dim">{m.name}</span>
                  </button>
                ))}
              </div>
            )}
            {selectedMonitors.length > 0 && (
              <p className="text-[10px] text-brand-muted">{selectedMonitors.length} selected</p>
            )}
          </div>

          {formError && <p className="text-xs text-brand-red">{formError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={create.isPending}>
            Create window
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MaintenanceWindowsPage() {
  const windowsQ = useMaintenanceWindows();
  const monitorsQ = useMonitors();
  const deleteWindow = useDeleteMaintenanceWindow();
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const windows = windowsQ.data ?? [];
  const monitors = monitorsQ.data ?? [];

  const monitorNames = Object.fromEntries(monitors.map((m) => [m.id, m.name]));
  const monitorOptions = monitors.map((m) => ({ id: m.id, name: m.name }));

  const active = windows.filter((w) => windowStatus(w) === 'active');
  const upcoming = windows.filter((w) => windowStatus(w) === 'upcoming');
  const past = windows.filter((w) => windowStatus(w) === 'past');

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteWindow.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Maintenance Windows</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Schedule planned downtime to suppress alerts for selected monitors.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          New window
        </Button>
      </div>

      <QueryState
        isLoading={windowsQ.isLoading}
        isError={windowsQ.isError}
        error={windowsQ.error}
        onRetry={() => windowsQ.refetch()}
        skeletonRows={3}
      >
        {windows.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No maintenance windows"
            description="Schedule a window to suppress alerts during planned downtime."
            action={{ label: 'New window', onClick: () => setShowCreate(true) }}
          />
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <div className="space-y-3">
                <GroupHeading label="Active" count={active.length} />
                {active.map((w) => (
                  <WindowCard
                    key={w.id}
                    window={w}
                    monitorNames={monitorNames}
                    onDelete={() => handleDelete(w.id)}
                    isDeleting={deletingId === w.id}
                  />
                ))}
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="space-y-3">
                <GroupHeading label="Upcoming" count={upcoming.length} />
                {upcoming.map((w) => (
                  <WindowCard
                    key={w.id}
                    window={w}
                    monitorNames={monitorNames}
                    onDelete={() => handleDelete(w.id)}
                    isDeleting={deletingId === w.id}
                  />
                ))}
              </div>
            )}

            {past.length > 0 && (
              <div className="space-y-3">
                <GroupHeading label="Past" count={past.length} />
                {past.map((w) => (
                  <WindowCard
                    key={w.id}
                    window={w}
                    monitorNames={monitorNames}
                    onDelete={() => handleDelete(w.id)}
                    isDeleting={deletingId === w.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </QueryState>

      <CreateWindowDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        monitorOptions={monitorOptions}
      />
    </div>
  );
}
