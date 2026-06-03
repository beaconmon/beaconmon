'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api-fetch';
import type { CompetitorDecisionData } from '@/lib/hooks/use-competitors';

const RESPONSES = [
  { value: 'ignore', label: 'Ignore' },
  { value: 'match', label: 'Match' },
  { value: 'counter', label: 'Counter' },
  { value: 'leapfrog', label: 'Leapfrog' },
] as const;

type ResponseValue = (typeof RESPONSES)[number]['value'];

interface Props {
  eventId: string;
  competitorId: string;
  currentDecision?: CompetitorDecisionData | null;
  onDecisionChange: (d: CompetitorDecisionData | null) => void;
}

export function DecisionActionBar({ eventId, competitorId, currentDecision, onDecisionChange }: Props) {
  const [isPending, setIsPending] = useState<ResponseValue | null>(null);

  async function handleClick(value: ResponseValue) {
    if (isPending) return;
    const isActive = currentDecision?.response === value;
    setIsPending(value);
    try {
      if (isActive) {
        const res = await apiFetch(
          `/api/competitors/${competitorId}/events/${eventId}/decision`,
          { method: 'DELETE' }
        );
        if (res.ok) onDecisionChange(null);
      } else {
        const res = await apiFetch(
          `/api/competitors/${competitorId}/events/${eventId}/decision`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response: value }),
          }
        );
        if (res.ok) {
          const decision: CompetitorDecisionData = await res.json();
          onDecisionChange(decision);
        }
      }
    } finally {
      setIsPending(null);
    }
  }

  return (
    <div className="mt-2 flex gap-1.5">
      {RESPONSES.map(({ value, label }) => {
        const isActive = currentDecision?.response === value;
        const isInFlight = isPending === value;
        return (
          <Button
            key={value}
            size="sm"
            variant="outline"
            disabled={isPending !== null}
            onClick={() => handleClick(value)}
            className={`h-6 px-2 text-[11px] ${isActive ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/30' : ''}`}
          >
            {isInFlight ? <Loader2 className="h-3 w-3 animate-spin" /> : label}
          </Button>
        );
      })}
    </div>
  );
}
