'use client';

import type { PlanTier } from '@beaconmon/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface TheWireBannerProps {
  plan: PlanTier;
}

export function TheWireBanner({ plan }: TheWireBannerProps) {
  if (plan === 'free' || plan === 'starter') return null;

  const now = new Date();
  const dateLabel = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  return (
    <div
      className="overflow-hidden rounded-lg px-5 py-4"
      style={{ background: 'var(--brand-bg2)', boxShadow: 'inset 0 0 0 1px var(--brand-line-soft)' }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">{dateLabel}</p>
      <p className="mt-1 text-sm italic text-brand-dim">
        Today&apos;s signals across your store and competitors. Open the feed below for the full picture.
      </p>
    </div>
  );
}
