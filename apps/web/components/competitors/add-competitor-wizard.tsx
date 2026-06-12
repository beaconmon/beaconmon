'use client';

import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiFetch } from '@/lib/api-fetch';
import type { PlanTier } from '@beaconmon/types';
import {
  CompetitorDomainInput,
  domainToName,
} from '@/components/competitors/competitor-domain-input';

interface AddCompetitorWizardProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: PlanTier;
  onCreated: () => void;
}

export function AddCompetitorWizard({
  open,
  onOpenChange,
  plan,
  onCreated,
}: AddCompetitorWizardProps) {
  const [domains, setDomains] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(v: boolean) {
    if (!v) {
      setDomains([]);
      setError(null);
    }
    onOpenChange(v);
  }

  async function detectPlatform(domain: string): Promise<'shopify' | 'woocommerce' | 'other'> {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      const res = await apiFetch('/api/onboarding/check-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `https://${domain}` }),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) return 'other';
      const data = (await res.json()) as { platform?: string };
      return data.platform === 'shopify' || data.platform === 'woocommerce' ? data.platform : 'other';
    } catch {
      return 'other';
    }
  }

  async function handleSubmit() {
    if (domains.length === 0) return;
    setError(null);
    setSubmitting(true);
    const created: string[] = [];
    try {
      // Detect platform up front: Shopify stores start at the full catalog
      // tier, everything else is probed by the worker after creation.
      const platforms = await Promise.all(domains.map(detectPlatform));
      for (const [i, domain] of domains.entries()) {
        const res = await apiFetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: domainToName(domain),
            url: `https://${domain}`,
            platform: platforms[i] ?? 'other',
          }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          if (created.length > 0) {
            setDomains((prev) => prev.filter((d) => !created.includes(d)));
            onCreated();
          }
          if (res.status === 403) {
            setError('You need editor permissions to add competitors.');
          } else {
            setError(data.error ?? 'Failed to add competitor. Please try again.');
          }
          return;
        }
        created.push(domain);
      }
      onCreated();
      handleOpenChange(false);
    } catch {
      if (created.length > 0) {
        setDomains((prev) => prev.filter((d) => !created.includes(d)));
        onCreated();
      }
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add competitor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <CompetitorDomainInput value={domains} onChange={setDomains} plan={plan} />

          <p className="text-xs text-brand-muted">
            We detect the store platform automatically. Shopify stores get full catalog tracking,
            and other platforms are tracked at the best tier their site allows.
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={domains.length === 0 || submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Start watching'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
