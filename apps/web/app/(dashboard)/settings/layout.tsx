import { SettingsShell } from '@/components/dashboard/settings-shell';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
