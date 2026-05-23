'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/dashboard/empty-state';
import { UpgradePrompt } from '@/components/ui/upgrade-prompt';
import { useSession } from '@/lib/hooks/use-session';
import { useGenerateReport } from '@/lib/hooks/use-reports';

// ─── Generate report dialog ───────────────────────────────────────────────────

function GenerateReportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const generate = useGenerateReport();
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [dateError, setDateError] = useState('');

  function reset() {
    setPeriodStart('');
    setPeriodEnd('');
    setClientName('');
    setClientNotes('');
    setDateError('');
    generate.reset();
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDateError('');

    // Parse as local midnight/end-of-day to avoid UTC timezone shift on date-only strings
    const start = new Date(periodStart + 'T00:00:00');
    const end = new Date(periodEnd + 'T23:59:59');
    if (end <= start) {
      setDateError('End date must be after start date');
      return;
    }

    try {
      await generate.mutateAsync({
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        clientName,
        ...(clientNotes && { clientNotes }),
      });
    } catch {
      // error shown via mutation state
    }
  }

  if (generate.isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report queued</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-brand-dim">
            Your report is being generated. You&apos;ll receive it by email shortly.
          </p>
          <DialogFooter>
            <Button onClick={() => handleClose(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate report</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 pt-1">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text" htmlFor="period-start">
                From
              </label>
              <Input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => { setPeriodStart(e.target.value); setDateError(''); }}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-brand-text" htmlFor="period-end">
                To
              </label>
              <Input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => { setPeriodEnd(e.target.value); setDateError(''); }}
                required
              />
            </div>
          </div>
          {dateError && <p className="text-xs text-red-400">{dateError}</p>}

          {/* Client name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text" htmlFor="client-name">
              Client name
            </label>
            <Input
              id="client-name"
              type="text"
              placeholder="Acme Corp"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-text" htmlFor="client-notes">
              Notes
              <span className="ml-1.5 font-normal text-brand-muted">(optional)</span>
            </label>
            <textarea
              id="client-notes"
              className="w-full rounded-md border border-brand-line bg-brand-bg2 px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:ring-1 focus:ring-brand-outline disabled:opacity-50"
              placeholder="Add any context for the client…"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
          </div>

          {generate.isError && (
            <p className="text-sm text-red-400">{generate.error?.message}</p>
          )}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={generate.isPending}>
              {generate.isPending ? 'Generating…' : 'Generate report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  const plan = session?.plan ?? 'free';
  const isPaid = plan !== 'free';
  const isViewer = session?.role === 'viewer';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">Reports</h1>
        {isPaid && !isViewer && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-fg transition-colors hover:bg-brand-green/90"
          >
            Generate report
          </button>
        )}
      </div>

      {/* Plan gate */}
      {!isPaid && (
        <UpgradePrompt currentPlan="free" limitReached="reports" />
      )}

      {/* Empty state */}
      <EmptyState
        icon={FileText}
        title="No reports yet"
        description={
          isPaid
            ? 'Generate your first report above. It will be delivered to your email.'
            : 'Upgrade to a paid plan to generate PDF reports.'
        }
      />

      <GenerateReportDialog open={showModal} onOpenChange={setShowModal} />
    </div>
  );
}
