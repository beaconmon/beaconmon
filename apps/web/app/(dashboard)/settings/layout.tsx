'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Settings as SettingsIcon, User, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/settings/general',       label: 'General',       icon: SettingsIcon },
  { href: '/settings/team',          label: 'Team',          icon: User },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/billing',       label: 'Billing',       icon: Zap },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-brand-text">Settings</h1>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <nav className="w-full shrink-0 lg:w-52">
          <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:gap-0.5">
            {TABS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-brand-bg3 text-brand-text'
                        : 'text-brand-dim hover:bg-brand-bg3/60 hover:text-brand-text'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-brand-green-ink' : 'text-brand-muted'
                      )}
                    />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
