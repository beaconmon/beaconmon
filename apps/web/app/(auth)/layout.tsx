import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-brand-bg">{children}</div>;
}
