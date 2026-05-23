'use client';

import Link from 'next/link';
import { Bell, ShieldAlert, Globe, Activity } from 'lucide-react';
import { useNotifications } from '@/lib/hooks/use-notifications';
import type { FeedItemKind } from '@/lib/repositories/notifications-feed';

const KIND_ICON: Record<FeedItemKind, React.ElementType> = {
  'incident.opened':  Activity,
  'incident.resolved': Activity,
  'expiry.warning':   ShieldAlert,
  'deploy.started':   Globe,
  'snapshot.changed': Globe,
};

const KIND_COLOR: Record<FeedItemKind, string> = {
  'incident.opened':  'text-brand-red',
  'incident.resolved': 'text-brand-green-ink',
  'expiry.warning':   'text-amber-500',
  'deploy.started':   'text-brand-dim',
  'snapshot.changed': 'text-brand-dim',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function RecentAlertsPanel() {
  const { data } = useNotifications();
  const items = data?.items.slice(0, 6) ?? [];

  return (
    <div
      className="overflow-hidden rounded-lg"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <div className="flex items-center justify-between border-b border-brand-line px-4 py-2.5">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-muted">
          Recent alerts
        </p>
        <Bell className="h-3.5 w-3.5 text-brand-muted" />
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-5 text-center">
          <p className="text-sm text-brand-muted">No recent alerts.</p>
        </div>
      ) : (
        <div>
          {items.map((item, i) => {
            const Icon = KIND_ICON[item.kind];
            const color = KIND_COLOR[item.kind];
            const rowClass = `flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-brand-bg3/40 ${i > 0 ? 'border-t border-brand-line/60' : ''}`;
            const inner = (
              <>
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${color}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-brand-text">{item.title}</p>
                  {item.subtitle && (
                    <p className="truncate text-[11px] text-brand-muted">{item.subtitle}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-[10px] text-brand-muted">
                  {timeAgo(item.occurredAt)}
                </span>
              </>
            );
            return item.href ? (
              <Link key={item.id} href={item.href} className={rowClass}>
                {inner}
              </Link>
            ) : (
              <div key={item.id} className={rowClass}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
