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

  async function handleSubmit() {
    if (domains.length === 0) return;
    setError(null);
    setSubmitting(true);
    const created: string[] = [];
    try {
      for (const domain of domains) {
        const res = await apiFetch('/api/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: domainToName(domain),
            url: `https://${domain}`,
            platform: 'other',
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
