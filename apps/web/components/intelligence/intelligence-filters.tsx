'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EVENT_TYPES = [
  { value: 'all', label: 'All events' },
  { value: 'content_change', label: 'Content changes' },
  { value: 'pricing_change', label: 'Pricing changes' },
  { value: 'expiry_alert', label: 'Expiry alerts' },
];

const RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

interface CompetitorOption {
  id: string;
  name: string;
}

interface IntelligenceFiltersProps {
  competitors: CompetitorOption[];
}

export function IntelligenceFilters({ competitors }: IntelligenceFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === 'all' || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete('before');
    router.replace(`/intelligence?${next.toString()}`);
  }

  const currentMonitor = params.get('monitorId') ?? 'all';
  const currentType = params.get('type') ?? 'all';
  const currentRange = params.get('range') ?? '30d';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {competitors.length > 0 && (
        <Select value={currentMonitor} onValueChange={(v) => update('monitorId', v)}>
          <SelectTrigger className="h-8 w-44 text-xs border-brand-line bg-brand-bg">
            <SelectValue placeholder="All competitors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All competitors</SelectItem>
            {competitors.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={currentType} onValueChange={(v) => update('type', v)}>
        <SelectTrigger className="h-8 w-44 text-xs border-brand-line bg-brand-bg">
          <SelectValue placeholder="All events" />
        </SelectTrigger>
        <SelectContent>
          {EVENT_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentRange} onValueChange={(v) => update('range', v)}>
        <SelectTrigger className="h-8 w-36 text-xs border-brand-line bg-brand-bg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGES.map((r) => (
            <SelectItem key={r.value} value={r.value}>
              {r.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
