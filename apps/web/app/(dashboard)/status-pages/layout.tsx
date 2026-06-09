'use client';

import { usePathname } from 'next/navigation';
import { SettingsShell } from '@/components/dashboard/settings-shell';

export default function StatusPagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Detail/edit views render full-bleed; only the index uses the Settings shell.
  if (pathname !== '/status-pages') {
    return <>{children}</>;
  }
  return <SettingsShell>{children}</SettingsShell>;
}
