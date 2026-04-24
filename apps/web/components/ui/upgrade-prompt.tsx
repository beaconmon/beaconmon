'use client';

import { useRef } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/hooks/use-session';
import type { PlanTier } from '@beaconmon/types';

declare global {
  interface Window {
    Paddle?: {
      Initialize: (opts: { token: string }) => void;
      Checkout: {
        open: (opts: { items: { priceId: string }[]; customData: Record<string, string> }) => void;
      };
    };
  }
}

interface UpgradePromptProps {
  currentPlan: PlanTier;
  limitReached: string;
}

const PLAN_LABEL: Record<PlanTier, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

export function UpgradePrompt({ currentPlan, limitReached }: UpgradePromptProps) {
  const { data: session } = useSession();
  const paddleReady = useRef(false);

  function handleUpgrade() {
    const proPriceId = process.env['NEXT_PUBLIC_PADDLE_PRO_PRICE_ID'];
    const teamId = session?.teamId;
    if (!proPriceId || !teamId || !window.Paddle) return;

    window.Paddle.Checkout.open({
      items: [{ priceId: proPriceId }],
      customData: { teamId },
    });
  }

  return (
    <>
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        onLoad={() => {
          if (window.Paddle && !paddleReady.current) {
            const token = process.env['NEXT_PUBLIC_PADDLE_CLIENT_TOKEN'];
            if (token) {
              window.Paddle.Initialize({ token });
              paddleReady.current = true;
            }
          }
        }}
      />
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="font-medium text-amber-900">
          You&apos;ve reached the {limitReached} limit on the {PLAN_LABEL[currentPlan]} plan.
        </p>
        <p className="mt-1 text-amber-700">
          Upgrade to Pro for more {limitReached} and higher limits.
        </p>
        <Button
          size="sm"
          className="mt-3"
          onClick={handleUpgrade}
        >
          Upgrade to Pro
        </Button>
      </div>
    </>
  );
}
