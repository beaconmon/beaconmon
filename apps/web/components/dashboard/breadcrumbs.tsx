'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

const SEGMENT_LABELS: Record<string, string> = {
  monitors:               'Monitors',
  incidents:              'Incidents',
  'status-pages':         'Status Pages',
  'alert-channels':       'Alert Channels',
  'escalation-policies':  'Escalation Policies',
  reports:                'Reports',
  settings:               'Settings',
  general:                'General',
  billing:                'Billing',
  team:                   'Team',
  'api-keys':             'API keys',
  notifications:          'Notifications',
  new:                    'New',
  edit:                   'Edit',
};

function getLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return <span className="text-sm font-medium text-foreground">Overview</span>;
  }

  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;
    const label = getLabel(seg);
    return { href, label, isLast };
  });

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link href="/monitors" className="text-muted-foreground hover:text-foreground transition-colors">
        Overview
      </Link>
      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          {isLast ? (
            <span className="font-medium text-foreground">{label}</span>
          ) : (
            <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
