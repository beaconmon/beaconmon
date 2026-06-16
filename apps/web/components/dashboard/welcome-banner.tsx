'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Store, Users, CalendarCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'beaconmon_welcome_dismissed';

export function WelcomeBanner() {
  // Start hidden so the server render and first client render match. We only
  // reveal the banner after reading localStorage on the client.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== '1') {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (private mode, etc.); skip the banner.
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore write failures; banner closes for this session regardless.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <Card className="relative border-brand-line bg-brand-surface p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss welcome banner"
        className="absolute right-3 top-3 text-brand-muted transition-colors hover:text-brand-text"
      >
        <X className="h-4 w-4" />
      </button>

      <h2 className="pr-8 text-base font-semibold text-brand-text">
        Track your store&apos;s uptime and monitor competitor moves.
      </h2>
      <p className="mt-1 text-sm text-brand-muted">
        Get set up in three quick steps.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/monitors/new">
            <Store className="mr-1.5 h-4 w-4" />
            Add your store
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/wire?tab=competitors">
            <Users className="mr-1.5 h-4 w-4" />
            Add competitors
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/alert-channels">
            <CalendarCheck className="mr-1.5 h-4 w-4" />
            Set up alerts
          </Link>
        </Button>
      </div>
    </Card>
  );
}
