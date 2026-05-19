'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, Loader2, Pencil, X } from 'lucide-react';
import { apiFetch } from '@/lib/api-fetch';
import { PLAN_LIMITS } from '@beaconmon/types';
import type { PlanTier } from '@beaconmon/types';
import { COMPETITOR_PRESETS } from '@/lib/competitor-presets';
import type { CompetitorPreset } from '@/lib/competitor-presets';
import { cn } from '@/lib/utils';

interface PresetMatch {
  preset: CompetitorPreset;
  selector: string;
  preview: string;
  matched: boolean;
  aiSelector: string | null;
  aiRationale: string | null;
}

interface AddCompetitorWizardProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: PlanTier;
  onCreated: () => void;
}

type Step = 'url' | 'presets' | 'creating';

export function AddCompetitorWizard({ open, onOpenChange, plan, onCreated }: AddCompetitorWizardProps) {
  const [step, setStep] = useState<Step>('url');
  const [url, setUrl] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [matches, setMatches] = useState<PresetMatch[]>([]);
  const [selected, setSelected] = useState<PresetMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectorOverrides, setSelectorOverrides] = useState<Record<string, string>>({});
  const [editingSelector, setEditingSelector] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const minInterval = PLAN_LIMITS[plan].checkIntervalSeconds;

  function reset() {
    setStep('url');
    setUrl('');
    setDetecting(false);
    setMatches([]);
    setSelected(null);
    setError(null);
    setSelectorOverrides({});
    setEditingSelector(null);
    setEditValue('');
  }

  function effectiveSelector(m: PresetMatch): string {
    return selectorOverrides[m.preset.id] ?? m.aiSelector ?? m.selector;
  }

  function startEditSelector(m: PresetMatch) {
    setEditingSelector(m.preset.id);
    setEditValue(effectiveSelector(m));
    setTimeout(() => editInputRef.current?.focus(), 0);
  }

  function commitSelectorEdit(presetId: string) {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== (matches.find((m) => m.preset.id === presetId)?.aiSelector ?? matches.find((m) => m.preset.id === presetId)?.selector)) {
      setSelectorOverrides((prev) => ({ ...prev, [presetId]: trimmed }));
    } else if (!trimmed) {
      setSelectorOverrides((prev) => { const next = { ...prev }; delete next[presetId]; return next; });
    }
    setEditingSelector(null);
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  async function handleDetect(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDetecting(true);
    try {
      const res = await apiFetch('/api/competitors/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json() as { matches?: PresetMatch[]; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Failed to fetch URL');
        return;
      }
      setMatches(data.matches ?? COMPETITOR_PRESETS.map((p) => ({ preset: p, selector: p.selectors[p.selectors.length - 1]!, preview: '', matched: false, aiSelector: null, aiRationale: null })));
      const firstMatch = data.matches?.find((m: PresetMatch) => m.matched);
      setSelected(firstMatch ?? null);
      setStep('presets');
    } catch {
      setError('Network error — could not reach the server');
    } finally {
      setDetecting(false);
    }
  }

  async function handleCreate() {
    if (!selected) return;
    setError(null);
    setStep('creating');
    try {
      const rawHostname = (() => { try { return new URL(url).hostname; } catch { return ''; } })();
      if (!rawHostname) {
        setError('Invalid URL');
        setStep('presets');
        return;
      }
      const hostname = rawHostname.replace(/^www\./, '');
      const res = await apiFetch('/api/monitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${hostname} — ${selected.preset.label}`,
          url,
          type: 'content',
          intervalSeconds: minInterval,
          isCompetitor: true,
          config: { selector: effectiveSelector(selected) },
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to create monitor');
        setStep('presets');
        return;
      }
      onCreated();
      handleOpenChange(false);
    } catch {
      setError('Network error — could not reach the server');
      setStep('presets');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'url' ? 'Add competitor' : 'Choose what to track'}
          </DialogTitle>
        </DialogHeader>

        {step === 'url' && (
          <form onSubmit={handleDetect} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="competitor-url">Competitor URL</Label>
              <Input
                id="competitor-url"
                type="url"
                placeholder="https://competitor.com/pricing"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                autoFocus
              />
              <p className="text-xs text-brand-muted">
                We&apos;ll fetch this page to preview which elements can be tracked.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={detecting || !url}>
                {detecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning…
                  </>
                ) : (
                  'Scan URL'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === 'presets' && (
          <div className="space-y-4">
            <p className="text-sm text-brand-dim">
              Pick what you want to watch on <span className="font-mono text-xs">{url}</span>
            </p>

            <div className="space-y-2">
              {matches.map((m) => {
                const isSelected = selected?.preset.id === m.preset.id;
                const hasAi = !!m.aiSelector;
                const isEditing = editingSelector === m.preset.id;
                const activeSelector = effectiveSelector(m);
                const isOverridden = !!selectorOverrides[m.preset.id];

                return (
                  <div
                    key={m.preset.id}
                    className={cn(
                      'w-full rounded-md border px-3 py-2.5 text-left transition-colors',
                      isSelected
                        ? 'border-brand-green bg-brand-green/5'
                        : 'border-brand-line bg-brand-surface'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className="w-full text-left"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]',
                            isSelected
                              ? 'border-brand-green bg-brand-green text-white'
                              : 'border-brand-line'
                          )}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-brand-text">{m.preset.label}</span>
                            {(m.matched || hasAi) && (
                              <span className="rounded bg-brand-green/10 px-1 py-0.5 text-[10px] font-medium text-brand-green-ink">
                                detected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {hasAi && m.aiRationale ? m.aiRationale : m.preset.description}
                          </p>
                          {m.preview && !hasAi && (
                            <p className="mt-1 text-[11px] text-brand-dim line-clamp-2 font-mono bg-brand-bg2 rounded px-1.5 py-1">
                              {m.preview}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    {(hasAi || isOverridden) && (
                      <div className="mt-2 ml-6">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              ref={editInputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitSelectorEdit(m.preset.id);
                                if (e.key === 'Escape') setEditingSelector(null);
                              }}
                              onBlur={() => commitSelectorEdit(m.preset.id)}
                              className="flex-1 rounded border border-brand-line bg-brand-bg2 px-2 py-0.5 font-mono text-[11px] text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-green"
                              placeholder="CSS selector"
                              maxLength={200}
                            />
                            <button
                              type="button"
                              onClick={() => setEditingSelector(null)}
                              className="text-brand-muted hover:text-brand-text"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {hasAi && !isOverridden && (
                              <span className="rounded bg-brand-bg3 px-1 py-0.5 text-[9px] font-medium text-brand-muted">
                                AI
                              </span>
                            )}
                            <span className="font-mono text-[11px] text-brand-dim truncate max-w-[220px]">
                              {activeSelector}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); startEditSelector(m); }}
                              className="ml-auto shrink-0 text-brand-muted hover:text-brand-text"
                              aria-label="Edit selector"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('url')}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={!selected}>
                Track this
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === 'creating' && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brand-green-ink" />
            <p className="text-sm text-brand-dim">Setting up your competitor monitor…</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
