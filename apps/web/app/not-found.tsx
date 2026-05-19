import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Page Not Found | Beaconmon',
  description: 'The page you were looking for could not be found.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--brand-bg)] p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <p className="font-mono text-5xl font-bold text-[var(--brand-green)]">404</p>
          <h1 className="text-2xl font-semibold text-[var(--brand-text)]">Page not found</h1>
          <p className="text-sm text-[var(--brand-muted)]">
            This page doesn&apos;t exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-3.5 w-3.5 mr-2" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/monitors">
              <LayoutDashboard className="h-3.5 w-3.5 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
