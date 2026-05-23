import type { IntelligenceEvent } from '@/lib/hooks/use-intelligence-feed';

export function binBy7Days(events: IntelligenceEvent[]): number[] {
  const now = Date.now();
  const bins = new Array<number>(7).fill(0);
  for (const e of events) {
    const daysAgo = Math.floor((now - new Date(e.timestamp).getTime()) / 86400000);
    const idx = 6 - daysAgo;
    if (idx >= 0 && idx < 7) bins[idx]!++;
  }
  return bins;
}
