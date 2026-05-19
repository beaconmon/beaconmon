'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  Check,
  Code2,
  Globe,
  Loader2,
  Lock,
  Search,
  Sparkles,
  Tag,
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
  if (type === 'content') return Code2;
  return Activity;
}

function suggestionToInput(s: DiscoverySuggestion): CreateMonitorInput {
  const base: CreateMonitorInput = {
    name: s.name,
    url: s.url,
    type: s.type,
    intervalSeconds: s.defaultIntervalSeconds,
  };

  if (s.type === 'content') {
    base.config = {
      ...(s.selectorChosen ? { selector: s.selectorChosen } : {}),
      smartSetup: {
        classification: s.classification,
        selectorCandidates: s.selectorCandidates,
        selectorChosen: s.selectorChosen,
        generatedAt: s.generatedAt ?? new Date().toISOString(),
      },
    };
  }

  return base;
}

function AiCategoryBadge({ classification }: { classification: DiscoverResponse['aiClassification'] }) {
  if (!classification) return null;
  const pct = Math.round(classification.confidence * 100);
  const label = classification.category.charAt(0).toUpperCase() + classification.category.slice(1);
  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border border-brand-line bg-muted/50 px-3 py-2 text-sm">
      <Sparkles className="h-4 w-4 shrink-0 text-primary" />
      <span>
        <span className="font-medium">Detected: {label}</span>
        <span className="ml-1 text-muted-foreground">· {pct}% confidence</span>
      </span>
    </div>
  );
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
    const hasAi = chosen.some((s) => s.source === 'ai' || s.source === 'ai+sitemap');
    try {
      const res = await bulkCreate.mutateAsync({
        monitors: chosen.map(suggestionToInput),
        source: hasAi ? 'smart-setup' : 'discovery',
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

      {discovery.degraded && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            AI suggestions unavailable right now — showing keyword-only results.
          </AlertDescription>
        </Alert>
      )}

      <AiCategoryBadge classification={discovery.aiClassification} />

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
            const isAi = s.source === 'ai' || s.source === 'ai+sitemap';
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
                    <div className="flex shrink-0 items-center gap-1.5">
                      {isAi && (
                        <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary">
                          <Sparkles className="h-3 w-3" />
                          AI
                        </span>
                      )}
                      <span className="text-[10px] font-medium uppercase tracking-wider text-brand-muted">
                        {s.type}
                      </span>
                    </div>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{s.url}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                  {s.aiReason && s.aiReason !== s.reason && (
                    <p className="mt-0.5 text-xs text-muted-foreground/70">{s.aiReason}</p>
                  )}
                  {s.type === 'content' && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="h-3 w-3" />
                      {s.selectorChosen != null ? (
                        <>Watches: <code className="font-mono">{s.selectorChosen}</code></>
                      ) : (
                        'Watches: full page'
                      )}
                    </p>
                  )}
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
