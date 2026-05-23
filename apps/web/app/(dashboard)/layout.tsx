'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  GitBranch,
  Globe,
  LayoutGrid,
  LogOut,
  Plus,
  Search,
  Settings,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { BreadcrumbProvider } from '@/lib/breadcrumb-context';
import { CommandPalette } from '@/components/command-palette';
import { NotificationPopover } from '@/components/notifications/notification-popover';
import { Providers } from '@/components/providers';
import { TrialBanner } from '@/components/ui/trial-banner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { analytics } from '@/lib/analytics';
import { TeamSwitcher } from '@/components/dashboard/team-switcher';
import Logo from '@/components/logo';
import { useIncidents } from '@/lib/hooks/use-incidents';
import { useSession } from '@/lib/hooks/use-session';

const NAV_ITEMS = [
  { href: '/overview',               label: 'Overview',           icon: LayoutGrid },
  { href: '/monitors',               label: 'Monitors',           icon: Activity },
  { href: '/intelligence',           label: 'Intelligence',       icon: Brain,   badge: 'NEW' },
  { href: '/incidents',              label: 'Incidents',          icon: AlertTriangle },
  { href: '/maintenance-windows',    label: 'Maintenance',        icon: Wrench },
  { href: '/status-pages',           label: 'Status Pages',       icon: Globe },
  { href: '/alert-channels',         label: 'Alert Channels',     icon: Bell },
  { href: '/escalation-policies',    label: 'Escalations',        icon: GitBranch },
  { href: '/reports',                label: 'Reports',            icon: FileText },
  { href: '/settings',               label: 'Settings',           icon: Settings },
];

const ADD_MONITOR_ROUTES = ['/monitors', '/incidents', '/status-pages'];

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  labelBadge,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  labelBadge?: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-all duration-150',
        collapsed ? 'justify-center px-2' : 'px-3',
        isActive
          ? 'bg-brand-bg3 text-brand-text'
          : 'text-brand-dim hover:bg-brand-bg3/60 hover:text-brand-text'
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-green" />
      )}
      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-brand-green-ink' : 'text-brand-muted group-hover:text-brand-dim'
        )}
      />
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {labelBadge && (
            <span
              className="rounded px-1 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider"
              style={{
                background: 'rgba(0,229,122,0.12)',
                color: 'var(--brand-green-ink)',
                boxShadow: 'inset 0 0 0 1px rgba(0,229,122,0.3)',
              }}
            >
              {labelBadge}
            </span>
          )}
          {badge != null && badge > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[9px] font-bold text-white">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </>
      )}
      {collapsed && badge != null && badge > 0 && (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-brand-red" />
      )}
    </Link>
  );
}


function Sidebar({
  collapsed,
  onToggle,
  incidentCount,
}: {
  collapsed: boolean;
  onToggle: () => void;
  incidentCount: number;
}) {
  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-brand-line bg-brand-bg transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 items-center border-b border-brand-line',
          collapsed ? 'justify-center px-2' : 'gap-2.5 px-4'
        )}
      >
        <Logo size={24} className="shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-brand-text">Beaconmon</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            badge={item.href === '/incidents' ? incidentCount : undefined}
            labelBadge={'badge' in item ? (item.badge as string) : undefined}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Team card + collapse toggle */}
      <div className="border-t border-brand-line p-2 space-y-1">
        {!collapsed && <TeamSwitcher />}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center rounded-md py-2 text-xs text-brand-muted transition-colors hover:bg-brand-bg3/50 hover:text-brand-dim',
            collapsed ? 'justify-center px-2' : 'justify-start gap-2 px-3'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function TopBar({
  onOpenCommandPalette,
}: {
  onOpenCommandPalette: () => void;
}) {
  const pathname = usePathname();
  const showAddMonitor = ADD_MONITOR_ROUTES.some((r) => pathname.startsWith(r));

  async function handleSignOut() {
    await authClient.signOut();
    analytics.reset();
    window.location.href = '/sign-in';
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-brand-line bg-brand-bg px-4">
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Add monitor */}
      {showAddMonitor && (
        <Link
          href="/monitors/new"
          className="hidden sm:flex items-center gap-1.5 rounded-md bg-brand-green px-3 py-1.5 text-xs font-semibold text-brand-green-fg transition-colors hover:bg-brand-green/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Add monitor
        </Link>
      )}

      {/* ⌘K trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden sm:flex items-center gap-2 rounded-md border border-brand-line bg-brand-bg2 px-3 py-1.5 text-xs text-brand-muted transition-colors hover:border-brand-line hover:text-brand-dim w-56"
      >
        <Search className="h-3 w-3 shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="inline-flex h-4 items-center rounded border border-brand-line bg-brand-bg px-1 text-[10px] text-brand-muted">
          ⌘K
        </kbd>
      </button>

      {/* Notifications */}
      <NotificationPopover />

      {/* Avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-bg3 text-xs font-semibold text-brand-text transition-colors hover:bg-brand-bg3/80">
            U
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 border-brand-line bg-brand-bg3">
          <DropdownMenuItem asChild className="cursor-pointer text-brand-dim hover:text-brand-text focus:text-brand-text">
            <Link href="/settings/billing">
              <CreditCard className="mr-2 h-3.5 w-3.5" />
              Billing
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-brand-line" />
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-xs text-brand-muted">Theme</span>
            <ThemeToggle />
          </div>
          <DropdownMenuSeparator className="bg-brand-line" />
          <DropdownMenuItem
            className="cursor-pointer text-brand-dim hover:text-brand-text focus:text-brand-text"
            onSelect={(e) => { e.preventDefault(); void handleSignOut(); }}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const router = useRouter();

  // Auto-collapse sidebar on small screens (runs once on mount; SSR renders collapsed=false then corrects client-side)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.innerWidth < 1024) setCollapsed(true);
  }, []);
  const { data: incidents } = useIncidents();
  const { data: session } = useSession();
  const incidentCount = (incidents ?? []).filter((i) => !i.resolvedAt).length;

  useEffect(() => {
    if (session?.userId) {
      analytics.identify(session.userId, { plan: session.plan, teamId: session.teamId });
    }
  }, [session?.userId, session?.plan, session?.teamId]);

  useEffect(() => {
    if (!session?.teamId) return;
    try {
      if (localStorage.getItem(`bm_ob_${session.teamId}`) === null) {
        router.replace('/onboarding');
      }
    } catch {
      // localStorage unavailable
    }
  }, [session?.teamId, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        incidentCount={incidentCount}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenCommandPalette={() => setCmdOpen(true)} />
        {session?.plan && session.teamCreatedAt && (
          <TrialBanner plan={session.plan} teamCreatedAt={session.teamCreatedAt} />
        )}
        <main className="flex-1 overflow-y-auto bg-brand-bg-section p-4 lg:p-8">{children}</main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <BreadcrumbProvider>
        <DashboardShell>{children}</DashboardShell>
      </BreadcrumbProvider>
    </Providers>
  );
}
