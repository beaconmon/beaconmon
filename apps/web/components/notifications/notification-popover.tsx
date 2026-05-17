'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  GitBranch,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications, useMarkNotificationsRead } from '@/lib/hooks/use-notifications';
import type { FeedItem, FeedItemKind } from '@/lib/repositories/notifications-feed';

const ICONS: Record<FeedItemKind, React.ElementType> = {
  'incident.opened': AlertTriangle,
  'incident.resolved': CheckCircle2,
  'expiry.warning': ShieldAlert,
  'deploy.started': GitBranch,
  'snapshot.changed': Clock,
};

const ICON_COLORS: Record<FeedItemKind, string> = {
  'incident.opened': 'text-brand-red',
  'incident.resolved': 'text-brand-green-ink',
  'expiry.warning': 'text-brand-amber',
  'deploy.started': 'text-brand-dim',
  'snapshot.changed': 'text-brand-dim',
};

function FeedRow({
  item,
  isUnread,
  onNavigate,
}: {
  item: FeedItem;
  isUnread: boolean;
  onNavigate: () => void;
}) {
  const Icon = ICONS[item.kind];
  const iconColor = ICON_COLORS[item.kind];

  const inner = (
    <div className="flex items-start gap-2.5 px-3 py-2.5">
      <Icon className={cn('h-3.5 w-3.5 shrink-0 mt-0.5', iconColor)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-xs font-medium text-brand-text">{item.title}</p>
          {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" />}
        </div>
        <p className="truncate text-[11px] text-brand-muted">{item.subtitle}</p>
        <p className="text-[10px] text-brand-muted/70">
          {formatDistanceToNow(new Date(item.occurredAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block transition-colors hover:bg-brand-bg3/60"
      >
        {inner}
      </Link>
    );
  }

  return <div>{inner}</div>;
}

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  function handleToggle() {
    setOpen((v) => !v);
  }

  function handleMarkRead() {
    if (unreadCount === 0) return;
    markRead.mutate();
  }

  function handleNavigate() {
    if (unreadCount > 0) markRead.mutate();
    setOpen(false);
  }

  const items = data?.items ?? [];
  const lastSeenAt = data?.lastSeenAt;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-brand-muted transition-colors hover:bg-brand-bg3/50 hover:text-brand-text"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-brand-red px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-lg border border-brand-line bg-brand-bg3 shadow-xl">
          <div className="flex items-center justify-between border-b border-brand-line px-3 py-2.5">
            <p className="text-xs font-semibold text-brand-text">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkRead}
                disabled={markRead.isPending}
                className="text-[11px] text-brand-green-ink transition-colors hover:text-brand-green-ink/80 disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {isLoading ? (
              <p className="px-3 py-8 text-center text-xs text-brand-muted">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-brand-muted">
                No recent notifications.
              </p>
            ) : (
              <div className="divide-y divide-brand-line">
                {items.map((item) => {
                  const isUnread = !lastSeenAt || item.occurredAt > lastSeenAt;
                  return (
                    <FeedRow
                      key={item.id}
                      item={item}
                      isUnread={isUnread}
                      onNavigate={handleNavigate}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
