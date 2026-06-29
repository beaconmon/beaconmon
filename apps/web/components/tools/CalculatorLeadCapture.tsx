'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';

type Status = 'idle' | 'sending' | 'done' | 'error';

interface Props {
  tool: string;
  result: string | number;
  inputs: Record<string, unknown>;
  /** One-line prompt shown above the email input. */
  prompt: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CalculatorLeadCapture({ tool, result, inputs, prompt }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await apiFetch('/api/tools/calculator-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, tool, result, inputs }),
      });
      if (!res.ok) {
        setStatus('error');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-4 rounded-2xl border border-brand-green-border-25 bg-brand-green-glow-10 px-5 py-4">
        <p className="text-[14px] text-brand-text leading-[1.55]">
          Saved. Check your inbox shortly for your result and a one-time tip.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-line-soft bg-brand-bg1 px-5 py-4">
      <p className="text-[13px] text-brand-dim leading-[1.5] mb-3">{prompt}</p>
      <form onSubmit={submit} className="flex gap-2 max-w-[460px] max-[480px]:flex-col">
        <label htmlFor={`lead-email-${tool}`} className="sr-only">
          Email address
        </label>
        <input
          id={`lead-email-${tool}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@store.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') setStatus('idle');
          }}
          disabled={status === 'sending'}
          className="flex-1 min-w-0 bg-brand-bg2 border border-brand-line text-brand-text text-[14px] rounded-lg px-4 py-2.5 outline-none focus:border-[rgba(0,229,122,0.5)] focus:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all placeholder:text-brand-muted disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === 'sending' || email.trim() === ''}
          className="inline-flex items-center justify-center h-[42px] px-5 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] transition-all duration-[120ms] whitespace-nowrap hover:scale-[1.02] hover:bg-[#00ff8a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,147,90,0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-55 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {status === 'sending' ? 'Sending...' : 'Send me this report'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-2 text-[13px] text-brand-red">Enter a valid email address and try again.</p>
      )}
    </div>
  );
}
