'use client';

import { useState, useEffect, use } from 'react';
import { ExternalLink, ChevronUp, ChevronDown, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useStatusPage, useUpdateStatusPage } from '@/lib/hooks/use-status-pages';
import { useMonitors } from '@/lib/hooks/use-monitors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';

export default function StatusPageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pageQ = useStatusPage(id);
  const monitorsQ = useMonitors();
  const update = useUpdateStatusPage(id);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [selectedMonitorIds, setSelectedMonitorIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const verifyDomain = useMutation({
    mutationFn: async () => {
      const res = await apiFetch(`/api/status-pages/${id}/verify-domain`, { method: 'POST' });
      const body = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(body.message ?? body.error ?? 'Verification failed');
      return body;
    },
    onSuccess: () => {
      setVerifyError(null);
      void queryClient.invalidateQueries({ queryKey: ['status-pages', id] });
    },
    onError: (err: Error) => setVerifyError(err.message),
  });

  useEffect(() => {
    if (pageQ.data) {
      setName(pageQ.data.name);
      setCustomDomain(pageQ.data.customDomain ?? '');
      setIsPublic(pageQ.data.isPublic);
      setSelectedMonitorIds(
        pageQ.data.monitors
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((m) => m.monitorId)
      );
    }
  }, [pageQ.data]);

  const isLoading = pageQ.isLoading || monitorsQ.isLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!pageQ.data) {
    return <p className="text-sm text-brand-muted">Status page not found.</p>;
  }

  const allMonitors = monitorsQ.data ?? [];

  function toggleMonitor(monitorId: string) {
    setSelectedMonitorIds((prev) =>
      prev.includes(monitorId)
        ? prev.filter((id) => id !== monitorId)
        : [...prev, monitorId]
    );
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setSelectedMonitorIds((prev) => {
      const next = [...prev];
      const a = next[idx - 1]!;
      const b = next[idx]!;
      next[idx - 1] = b;
      next[idx] = a;
      return next;
    });
  }

  function moveDown(idx: number) {
    setSelectedMonitorIds((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      const a = next[idx]!;
      const b = next[idx + 1]!;
      next[idx] = b;
      next[idx + 1] = a;
      return next;
    });
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    update.mutate(
      {
        name,
        customDomain: customDomain || null,
        isPublic,
        monitorIds: selectedMonitorIds,
      },
      {
        onSuccess: () => setSaved(true),
        onError: (err) => setError(err.message),
      }
    );
  }

  const slug = pageQ.data.slug;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">{pageQ.data.name}</h1>
        <a
          href={`/s/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-dim transition-colors duration-150"
        >
          Preview
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {saved && (
        <Alert>
          <AlertDescription>Changes saved.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sp-name">Name</Label>
            <Input id="sp-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sp-slug">Slug</Label>
            <Input id="sp-slug" value={slug} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Slug cannot be changed after creation.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sp-domain">Custom domain <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input
              id="sp-domain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="status.mycompany.com"
            />
            {customDomain && customDomain === pageQ.data?.customDomain && (
              <div className="rounded-md border bg-muted/30 px-3 py-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Add this DNS record at your domain registrar:
                </p>
                <div className="font-mono text-xs bg-background rounded px-2 py-1.5 border">
                  <span className="text-muted-foreground">CNAME</span>{' '}
                  <span className="font-semibold">{customDomain}</span>{' → '}
                  <span className="font-semibold">{typeof window !== 'undefined' ? window.location.hostname : 'your-app-domain.com'}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {pageQ.data?.customDomainVerified ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => verifyDomain.mutate()}
                        disabled={verifyDomain.isPending}
                      >
                        {verifyDomain.isPending && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                        Verify DNS
                      </Button>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <XCircle className="h-3.5 w-3.5" />
                        Not verified
                      </span>
                    </>
                  )}
                </div>
                {verifyError && (
                  <p className="text-xs text-destructive">{verifyError}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="sp-public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="sp-public">Public</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monitors on this page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allMonitors.length === 0 ? (
            <p className="text-sm text-muted-foreground">No monitors yet.</p>
          ) : (
            <>
              {/* Unselected monitors */}
              <div className="space-y-2">
                {allMonitors
                  .filter((m) => !selectedMonitorIds.includes(m.id))
                  .map((monitor) => (
                    <label
                      key={monitor.id}
                      className="flex items-center gap-3 rounded-md border border-brand-line px-3 py-2 cursor-pointer transition-colors duration-150 hover:bg-brand-bg3/50"
                    >
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => toggleMonitor(monitor.id)}
                      />
                      <span className="text-sm text-brand-text">{monitor.name}</span>
                      <span className="text-xs text-brand-muted font-mono truncate">{monitor.url}</span>
                    </label>
                  ))}
              </div>

              {/* Selected monitors (ordered) */}
              {selectedMonitorIds.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-brand-line">
                  <p className="text-xs text-brand-muted font-medium uppercase tracking-wide">Selected (displayed order)</p>
                  {selectedMonitorIds.map((mId, idx) => {
                    const monitor = allMonitors.find((m) => m.id === mId);
                    if (!monitor) return null;
                    return (
                      <div
                        key={mId}
                        className="flex items-center gap-2 rounded-md border border-brand-line bg-brand-bg3/30 px-3 py-2"
                      >
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => toggleMonitor(mId)}
                        />
                        <span className="flex-1 text-sm font-medium">{monitor.name}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveUp(idx)} disabled={idx === 0}>
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveDown(idx)} disabled={idx === selectedMonitorIds.length - 1}>
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={update.isPending}>
        {update.isPending ? 'Saving…' : 'Save changes'}
      </Button>
    </div>
  );
}
