'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  Check,
  Globe,
  Loader2,
  Lock,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useDiscoverMonitors,
  useBulkCreateMonitors,
  type DiscoverySuggestion,
  type DiscoverResponse,
} from '@/lib/hooks/use-discovery';
import type { CreateMonitorInput } from '@/lib/validations/monitors';

interface DiscoverEmptyStateProps {
  onCreated?: (count: number) => void;
}

function suggestionIcon(type: DiscoverySuggestion['type']) {
  if (type === 'ssl') return Lock;
  if (type === 'domain') return Globe;
  return Activity;
}

function suggestionToInput(s: DiscoverySuggestion): CreateMonitorInput {
  return {
    name: s.name,
    url: s.url,
    type: s.type,
    intervalSeconds: s.defaultIntervalSeconds,
  };
}

export function DiscoverEmptyState({ onCreated }: DiscoverEmptyStateProps) {
  const [domain, setDomain] = useState('');
  const [discovery, setDiscovery] = useState<DiscoverResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitError, setSubmitError] = useState<string | null>(null);

  const discoverMutation = useDiscoverMonitors();
  const bulkCreate = useBulkCreateMonitors();

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!domain.trim()) return;
    try {
      const result = await discoverMutation.mutateAsync({ domain: domain.trim() });
      setDiscovery(result);
      const initial = new Set<string>();
      for (const s of result.suggestions) {
        if (s.checkedByDefault) initial.add(`${s.type}:${s.url}`);
      }
      setSelected(initial);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Discovery failed');
    }
  };

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!discovery) return;
    setSubmitError(null);
    const chosen = discovery.suggestions.filter((s) =>
      selected.has(`${s.type}:${s.url}`)
    );
    if (chosen.length === 0) return;
    try {
      const res = await bulkCreate.mutateAsync({
        monitors: chosen.map(suggestionToInput),
        source: 'discovery',
      });
      onCreated?.(res.created.length);
      reset();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create monitors');
    }
  };

  const reset = () => {
    setDiscovery(null);
    setSelected(new Set());
    setDomain('');
    setSubmitError(null);
  };

  if (!discovery) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Set up monitoring in 10 seconds</h3>
        <p className="mb-6 max-w-md text-sm text-muted-foreground">
          Paste your site and we&apos;ll suggest the right monitors — homepage uptime, SSL,
          domain expiry, plus key pages from your sitemap.
        </p>

        <form onSubmit={handleDiscover} className="flex w-full max-w-md gap-2">
          <Input
            type="text"
            placeholder="yoursite.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            disabled={discoverMutation.isPending}
            autoFocus
            aria-label="Domain to discover"
          />
          <Button type="submit" disabled={discoverMutation.isPending || !domain.trim()}>
            {discoverMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Discover
              </>
            )}
          </Button>
        </form>

        {(submitError || discoverMutation.error) && (
          <Alert variant="destructive" className="mt-4 max-w-md text-left">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {submitError ?? discoverMutation.error?.message}
            </AlertDescription>
          </Alert>
        )}

        <Link
          href="/monitors/new"
          className="mt-6 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Or add a monitor manually
        </Link>
      </div>
    );
  }

  const selectedCount = selected.size;
  const total = discovery.suggestions.length;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Suggested monitors for {discovery.domain}</h3>
        <p className="text-sm text-muted-foreground">
          Uncheck anything you don&apos;t want, then create them in one click.
        </p>
      </div>

      {discovery.warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {discovery.warnings.map((w, i) => (
            <Alert key={i}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{w}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {total === 0 ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            We couldn&apos;t suggest any new monitors for this domain.
          </AlertDescription>
        </Alert>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-brand-line bg-brand-surface">
          {discovery.suggestions.map((s) => {
            const key = `${s.type}:${s.url}`;
            const isSelected = selected.has(key);
            const Icon = suggestionIcon(s.type);
            return (
              <li
                key={key}
                className="flex items-start gap-3 border-b border-brand-line px-4 py-3 last:border-b-0"
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggle(key)}
                  aria-label={`Toggle ${s.name}`}
                  className="mt-1"
                />
                <div className="flex shrink-0 items-center justify-center rounded-md bg-muted p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                      {s.type}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{s.url}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {submitError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-brand-line bg-background pt-4">
        <Button variant="ghost" onClick={reset} disabled={bulkCreate.isPending}>
          Back
        </Button>
        <Button
          onClick={handleCreate}
          disabled={selectedCount === 0 || bulkCreate.isPending}
        >
          {bulkCreate.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Create {selectedCount} monitor{selectedCount === 1 ? '' : 's'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
