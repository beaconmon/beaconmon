import type { Metadata } from 'next';
import DashboardShell from './shell';

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
