import { SettingsShell } from '@/components/dashboard/settings-shell';

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
