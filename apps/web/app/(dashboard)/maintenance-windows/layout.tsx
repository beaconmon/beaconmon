import { SettingsShell } from '@/components/dashboard/settings-shell';

export default function MaintenanceWindowsLayout({ children }: { children: React.ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
