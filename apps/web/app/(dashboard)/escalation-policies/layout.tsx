import { SettingsShell } from '@/components/dashboard/settings-shell';

export default function EscalationPoliciesLayout({ children }: { children: React.ReactNode }) {
  return <SettingsShell>{children}</SettingsShell>;
}
