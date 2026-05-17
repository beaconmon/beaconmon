'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CtaForm({ className = '' }: { className?: string }) {
  const [email, setEmail] = useState('');
  const router = useRouter();

  return (
    <form
      className={`flex gap-2 bg-brand-bg2 border border-brand-line p-[6px] rounded-xl max-w-[520px] focus-within:border-[rgba(0,229,122,0.5)] focus-within:shadow-[0_0_0_3px_rgba(0,229,122,0.18)] transition-all ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (email) {
          router.push(`/sign-up?email=${encodeURIComponent(email)}`);
        } else {
          router.push('/sign-up');
        }
      }}
    >
      <input
        type="email"
        placeholder="you@company.com"
        aria-label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 min-w-0 bg-transparent border-0 text-brand-text font-[inherit] text-[15px] px-[14px] outline-none placeholder:text-brand-muted"
      />
      <button
        type="submit"
        className="inline-flex items-center justify-center h-[42px] px-4 text-[14px] font-semibold rounded-lg bg-brand-green text-brand-green-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_0_1px_rgba(0,147,90,0.25),0_6px_16px_rgba(0,147,90,0.18)] hover:scale-[1.02] hover:bg-[#00ff8a] transition-all duration-[120ms] whitespace-nowrap"
      >
        Start monitoring free →
      </button>
    </form>
  );
}
