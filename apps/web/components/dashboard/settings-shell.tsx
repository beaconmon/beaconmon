'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  CreditCard,
  FileText,
  GitBranch,
  Globe,
  Settings as SettingsIcon,
  Users,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  moved?: boolean;
}

interface SubNavGroup {
  group: string;
  items: SubNavItem[];
}

const GROUPS: SubNavGroup[] = [
  {
    group: 'Workspace',
    items: [
      { href: '/settings/general',       label: 'General',         icon: SettingsIcon },
      { href: '/settings/team',          label: 'Team & members',  icon: Users },
      { href: '/settings/billing',       label: 'Billing',         icon: CreditCard },
    ],
  },
  {
    group: 'Alerting',
    items: [
      { href: '/alert-channels',         label: 'Alert channels',     icon: Bell,       moved: true },
      { href: '/escalation-policies',    label: 'Escalation policies', icon: GitBranch, moved: true },
    ],
  },
  {
    group: 'Public & ops',
    items: [
      { href: '/status-pages',           label: 'Status pages',         icon: Globe,    moved: true },
      { href: '/maintenance-windows',    label: 'Maintenance windows',  icon: Wrench,   moved: true },
    ],
  },
  {
    group: 'Insights',
    items: [
      { href: '/reports',                label: 'Reports',              icon: FileText, moved: true },
    ],
  },
];

interface SettingsShellProps {
  children: React.ReactNode;
}

export function SettingsShell({ children }: SettingsShellProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-text">Settings</h1>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <nav aria-label="Settings sections" className="w-full shrink-0 lg:w-60">
          <ul className="flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {GROUPS.map((group, groupIdx) => (
              <li key={group.group} className={cn('lg:block', groupIdx > 0 && 'lg:mt-4')}>
                <p className="hidden px-2 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-muted lg:block">
                  {group.group}
                </p>
                <ul className="flex flex-row gap-1 lg:flex-col lg:gap-0.5">
                  {group.items.map(({ href, label, icon: Icon, moved }) => {
                    const isActive =
                      pathname === href ||
                      (href !== '/' && pathname.startsWith(href + '/'));
                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          className={cn(
                            'group relative flex items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                            isActive
                              ? 'bg-brand-bg3 text-brand-text'
                              : 'text-brand-dim hover:bg-brand-bg3/60 hover:text-brand-text'
                          )}
                        >
                          {isActive && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-green"
                            />
                          )}
                          <Icon
                            className={cn(
                              'h-3.5 w-3.5 shrink-0',
                              isActive ? 'text-brand-green-ink' : 'text-brand-muted'
                            )}
                          />
                          <span className="flex-1">{label}</span>
                          {moved && (
                            <span
                              className="font-mono text-[9px] uppercase tracking-wider"
                              style={{ color: 'var(--brand-green-ink)' }}
                            >
                              moved
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
