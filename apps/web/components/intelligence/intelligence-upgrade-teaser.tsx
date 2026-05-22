'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const SAMPLE_EVENTS = [
  {
    id: '1',
    monitorName: 'competitor.com',
    monitorUrl: 'https://competitor.com/pricing',
    badge: 'Pricing change',
    badgeClass: 'bg-amber-100 text-amber-800',
    time: '2h ago',
    summary: 'Pricing page updated — new enterprise tier added at $299/mo.',
  },
  {
    id: '2',
    monitorName: 'rival-shop.com',
    monitorUrl: 'https://rival-shop.com/features',
    badge: 'Content change',
    badgeClass: 'bg-blue-100 text-blue-800',
    time: '1d ago',
    summary: 'Features page content changed in 3 sections.',
  },
  {
    id: '3',
    monitorName: 'otherbrand.io',
    monitorUrl: 'https://otherbrand.io',
    badge: 'SSL expiring',
    badgeClass: 'bg-red-100 text-red-800',
    time: '3d ago',
    summary: undefined,
  },
];

export function IntelligenceUpgradeTeaser() {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        <div className="rounded-lg border border-brand-line bg-brand-surface">
          <div className="border-b border-brand-line px-4 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Activity feed
            </h2>
          </div>
          <div className="divide-y divide-brand-line">
            {SAMPLE_EVENTS.map((e) => (
              <div key={e.id} className="flex items-start gap-4 px-4 py-3">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-green" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-brand-text">{e.monitorName}</span>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${e.badgeClass}`}>
                      {e.badge}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-brand-muted">{e.monitorUrl}</p>
                  {e.summary && <p className="mt-1 text-sm text-brand-dim">{e.summary}</p>}
                </div>
                <span className="font-mono text-xs text-brand-muted">{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-brand-bg/60 backdrop-blur-[2px]">
        <div className="rounded-lg border border-brand-line bg-brand-surface p-6 text-center shadow-lg max-w-sm mx-4">
          <h3 className="text-base font-semibold text-brand-text">Track competitor activity</h3>
          <p className="mt-1.5 text-sm text-brand-muted">
            Monitor competitor pricing changes, content updates, and SSL/domain expiry in one feed.
            Upgrade to Starter to get started.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/pricing">Upgrade to Starter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
