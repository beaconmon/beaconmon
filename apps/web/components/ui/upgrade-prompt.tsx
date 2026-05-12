'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/hooks/use-session';
import type { PlanTier } from '@beaconmon/types';

type FreemiusCheckoutHandler = {
  open: (opts: {
    name?: string;
    plan_id: number;
    billing_cycle?: 'monthly' | 'annual' | 'lifetime';
    user_email?: string;
    readonly_user?: boolean;
    success?: (response: unknown) => void;
  }) => void;
  close?: () => void;
};

declare global {
  interface Window {
    FS?: {
      Checkout: new (opts: {
        product_id: string;
        public_key?: string;
        sandbox?: boolean;
      }) => FreemiusCheckoutHandler;
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
  const handlerRef = useRef<FreemiusCheckoutHandler | null>(null);

  useEffect(() => {
    return () => {
      handlerRef.current?.close?.();
    };
  }, []);

  function ensureHandler(): FreemiusCheckoutHandler | null {
    if (handlerRef.current) return handlerRef.current;
    const productId = process.env['NEXT_PUBLIC_FREEMIUS_PRODUCT_ID'];
    if (!productId || !window.FS) return null;
    const sandbox = process.env['NEXT_PUBLIC_FREEMIUS_SANDBOX'] === 'true';
    handlerRef.current = new window.FS.Checkout({ product_id: productId, ...(sandbox && { sandbox: true }) });
    return handlerRef.current;
  }

  function handleUpgrade() {
    const proPlanId = process.env['NEXT_PUBLIC_FREEMIUS_PRO_PLAN_ID'];
    const email = session?.email;
    const handler = ensureHandler();
    if (!proPlanId || !email || !handler) {
      alert('Unable to start checkout. Please refresh the page and try again.');
      return;
    }

    handler.open({
      name: 'Pro Monthly',
      plan_id: Number(proPlanId),
      billing_cycle: 'monthly',
      user_email: email,
      readonly_user: true,
    });
  }

  return (
    <>
      <Script src="https://checkout.freemius.com/js/v1/" strategy="lazyOnload" />
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="font-medium text-amber-900">
          You&apos;ve reached the {limitReached} limit on the {PLAN_LABEL[currentPlan]} plan.
        </p>
        <p className="mt-1 text-amber-700">
          Upgrade to Pro for more {limitReached} and higher limits.
        </p>
        <Button size="sm" className="mt-3" onClick={handleUpgrade}>
          Upgrade to Pro
        </Button>
      </div>
    </>
  );
}
