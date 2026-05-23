'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useDeleteMonitor } from '@/lib/hooks/use-monitors';

interface AdvancedTabProps {
  monitorId: string;
  monitorName: string;
}

export function AdvancedTab({ monitorId, monitorName }: AdvancedTabProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const deleteMonitor = useDeleteMonitor(monitorId);

  function handleDelete() {
    deleteMonitor.mutate(undefined, {
      onSuccess: () => {
        router.push('/monitors');
      },
    });
  }

  return (
    <div className="space-y-8 py-2">
      {/* Danger zone */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-brand-red">Danger zone</p>
          <p className="text-xs text-brand-muted">These actions are permanent and cannot be undone.</p>
        </div>

        <div className="rounded-lg border border-brand-red/30 bg-brand-red/5 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-text">Delete monitor</p>
              <p className="text-xs text-brand-muted">
                Permanently delete <span className="font-medium">{monitorName}</span> and all its
                check results, incidents, and alert history.
              </p>
            </div>
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="shrink-0 flex items-center gap-1.5 rounded-md border border-brand-red/40 px-3 py-1.5 text-sm font-medium text-brand-red transition-colors hover:bg-brand-red/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            ) : (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteMonitor.isPending}
                  className="rounded-md bg-brand-red px-3 py-1.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                >
                  {deleteMonitor.isPending ? 'Deleting…' : 'Confirm delete'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="text-sm text-brand-muted hover:text-brand-text"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          {deleteMonitor.isError && (
            <p className="mt-2 text-xs text-brand-red">{deleteMonitor.error?.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
