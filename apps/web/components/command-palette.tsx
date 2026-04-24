'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Activity, AlertTriangle, Bell, Globe, Settings, Plus, Search } from 'lucide-react';
import { useMonitors } from '@/lib/hooks/use-monitors';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAV_ITEMS = [
  { label: 'Monitors',       href: '/monitors',         icon: Activity },
  { label: 'Incidents',      href: '/incidents',        icon: AlertTriangle },
  { label: 'Status Pages',   href: '/status-pages',     icon: Globe },
  { label: 'Alert Channels', href: '/alert-channels',   icon: Bell },
  { label: 'Settings',       href: '/settings/billing', icon: Settings },
];

function CmdGroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
      {children}
    </p>
  );
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { data: monitors } = useMonitors();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-brand-line bg-brand-bg3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <div className="flex items-center gap-2 border-b border-brand-line px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-brand-muted" />
            <Command.Input
              autoFocus
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent text-sm text-brand-text placeholder:text-brand-muted outline-none"
            />
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-brand-line bg-brand-bg2 px-1.5 text-[10px] text-brand-muted">
              Esc
            </kbd>
          </div>

          <Command.List className="max-h-72 overflow-y-auto py-1">
            <Command.Empty className="py-8 text-center text-sm text-brand-dim">
              No results found.
            </Command.Empty>

            <CmdGroupHeading>Navigate</CmdGroupHeading>
            <Command.Group>
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <Command.Item
                  key={href}
                  value={label}
                  onSelect={() => navigate(href)}
                  className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-brand-text data-[selected=true]:bg-brand-bg2 outline-none"
                >
                  <Icon className="h-4 w-4 text-brand-dim" />
                  {label}
                </Command.Item>
              ))}
            </Command.Group>

            <CmdGroupHeading>Actions</CmdGroupHeading>
            <Command.Group>
              <Command.Item
                value="Add monitor"
                onSelect={() => navigate('/monitors/new')}
                className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-brand-text data-[selected=true]:bg-brand-bg2 outline-none"
              >
                <Plus className="h-4 w-4 text-brand-dim" />
                Add monitor
              </Command.Item>
            </Command.Group>

            {monitors && monitors.length > 0 && (
              <>
                <CmdGroupHeading>Monitors</CmdGroupHeading>
                <Command.Group>
                  {monitors.map((m) => (
                    <Command.Item
                      key={m.id}
                      value={m.name}
                      onSelect={() => navigate(`/monitors/${m.id}`)}
                      className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-brand-text data-[selected=true]:bg-brand-bg2 outline-none"
                    >
                      <Activity className="h-4 w-4 shrink-0 text-brand-dim" />
                      <span className="truncate">{m.name}</span>
                      <span className="ml-auto text-xs text-brand-muted font-mono truncate max-w-[140px]">
                        {m.url}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
