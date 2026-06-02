'use client';

import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2, ExternalLink } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api-fetch';
import type { PlanTier } from '@beaconmon/types';
import { PLAN_LIMITS } from '@beaconmon/types';

interface CompetitorMonitor {
  id: string;
  name: string;
  url: string;
}

interface CompetitorManagementSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: PlanTier;
  onChanged: () => void;
}

export function CompetitorManagementSheet({
  open,
  onOpenChange,
  plan,
  onChanged,
}: CompetitorManagementSheetProps) {
  const [competitors, setCompetitors] = useState<CompetitorMonitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [addName, setAddName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function loadCompetitors() {
    setLoading(true);
    try {
      setCompetitors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) void loadCompetitors();
  }, [open]);

  async function handleAdd() {
    const url = addUrl.trim();

    if (!url) {
      setAddError('URL is required');
      return;
    }

    let name = addName.trim();
    if (!name) {
      try {
        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
        name = new URL(fullUrl).hostname;
      } catch {
        setAddError('Invalid URL format');
        return;
      }
    }

    const limit = PLAN_LIMITS[plan].competitorMonitors;
    if (limit !== -1 && competitors.length >= limit) {
      setAddError(`Your plan allows up to ${limit} competitor monitors`);
      return;
    }

    setAdding(true);
    setAddError(null);
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const res = await apiFetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          url: fullUrl,
          type: 'content',
          intervalSeconds: PLAN_LIMITS[plan].checkIntervalSeconds,
        }),
      });
      if (!res.ok) {
        const err: { error?: string } = await res.json();
        setAddError(err.error ?? 'Failed to add competitor');
        return;
      }
      setAddUrl('');
      setAddName('');
      await loadCompetitors();
      onChanged();
    } catch {
      setAddError('Failed to add competitor');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setDeleteError(null);
    try {
      const res = await apiFetch(`/api/monitors/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err: { error?: string } = await res.json().catch(() => ({}));
        setDeleteError(err.error ?? 'Failed to delete competitor');
        return;
      }
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
      onChanged();
    } catch {
      setDeleteError('Failed to delete competitor');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-brand-bg border-brand-line">
        <SheetHeader>
          <SheetTitle className="text-brand-text">Manage competitors</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Add form */}
          <div className="rounded-lg border border-brand-line bg-brand-bg2 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Add competitor
            </p>
            <div className="space-y-2">
              <Label className="text-xs text-brand-dim">URL</Label>
              <Input
                placeholder="https://competitor.com/pricing"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                className="h-8 text-sm border-brand-line bg-brand-bg"
                onKeyDown={(e) => { if (e.key === 'Enter') void handleAdd(); }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-brand-dim">Name (optional)</Label>
              <Input
                placeholder="Auto-detected from URL"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="h-8 text-sm border-brand-line bg-brand-bg"
                onKeyDown={(e) => { if (e.key === 'Enter') void handleAdd(); }}
              />
            </div>
            {addError && <p className="text-xs text-red-500">{addError}</p>}
            <Button size="sm" onClick={() => void handleAdd()} disabled={adding} className="gap-1.5">
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </Button>
          </div>

          {/* Competitor list */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted mb-3">
              Current competitors {!loading && `(${competitors.length})`}
            </p>
            {deleteError && <p className="text-xs text-red-500 mb-2">{deleteError}</p>}
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-brand-muted" />
              </div>
            ) : competitors.length === 0 ? (
              <p className="text-sm text-brand-muted text-center py-6">No competitor monitors yet.</p>
            ) : (
              <div className="space-y-2">
                {competitors.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-md border border-brand-line bg-brand-bg2 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brand-text truncate">{c.name}</p>
                      <p className="font-mono text-xs text-brand-muted truncate">{c.url}</p>
                    </div>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-brand-muted hover:text-brand-dim"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-brand-muted hover:text-red-500"
                      disabled={deletingId === c.id}
                      onClick={() => void handleDelete(c.id)}
                    >
                      {deletingId === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
