'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPasswordStrength, MIN_PASSWORD_STRENGTH } from '@/lib/validations/password';
import Logo from '@/components/logo';

export { getPasswordStrength, MIN_PASSWORD_STRENGTH };

// ─── Logo ────────────────────────────────────────────────────────────────────

export function AuthLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 w-fit">
      <Logo size={28} />
      <span className="text-base font-semibold tracking-tight text-brand-text">Beaconmon</span>
    </Link>
  );
}

// ─── Shell ───────────────────────────────────────────────────────────────────

export function AuthShell({ children, panel }: { children: React.ReactNode; panel: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      {/* Form side */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-16 xl:px-24">
        {children}
      </div>
      {/* Brand panel side — hidden on small screens */}
      <div className="hidden lg:flex lg:w-1/2">{panel}</div>
    </div>
  );
}

// ─── Brand panel ─────────────────────────────────────────────────────────────

type PanelVariant = 'default' | 'welcome' | 'reset';

const PANEL_COPY: Record<PanelVariant, { headline: string; sub: string }> = {
  default: {
    headline: 'Never miss a minute of downtime.',
    sub: 'Add a monitor in 30 seconds. Get alerted the instant something breaks.',
  },
  welcome: {
    headline: 'Welcome back.',
    sub: 'Your monitors are running. Let\'s check in.',
  },
  reset: {
    headline: 'Locked out? No problem.',
    sub: 'We\'ll send a secure link to reset your password in seconds.',
  },
};

const MONITOR_ROWS = [
  { name: 'api.acme.com', ms: '142ms', status: 'up' },
  { name: 'checkout.acme.com', ms: '98ms', status: 'up' },
  { name: 'cdn.acme.com', ms: '23ms', status: 'up' },
];

function Sparkline() {
  // Fake sparkline bars — purely decorative
  const bars = [4, 7, 5, 8, 6, 9, 5, 7, 6, 8];
  return (
    <div className="flex items-end gap-0.5 h-4">
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-1 rounded-sm bg-brand-green opacity-60"
          style={{ height: `${h * 4}px` }}
        />
      ))}
    </div>
  );
}

export function AuthPanel({ variant = 'default' }: { variant?: PanelVariant }) {
  const { headline, sub } = PANEL_COPY[variant];

  return (
    <div className="relative flex w-full flex-col justify-between overflow-hidden bg-brand-bg2 p-10">
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 70% 40%, rgba(0,229,122,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Top: logo */}
      <AuthLogo />

      {/* Center: headline + monitor mock + alert card */}
      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="text-2xl font-bold leading-tight text-brand-text">{headline}</h2>
          <p className="mt-2 text-sm text-brand-dim">{sub}</p>
        </div>

        {/* Live monitor rows */}
        <div className="rounded-lg border border-brand-line bg-brand-bg3/60 p-4 space-y-3 backdrop-blur-sm">
          {MONITOR_ROWS.map((row) => (
            <div key={row.name} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green animate-blip" />
              <span className="flex-1 text-xs text-brand-dim font-mono truncate">{row.name}</span>
              <Sparkline />
              <span className="text-xs text-brand-muted font-mono tabular-nums">{row.ms}</span>
            </div>
          ))}
        </div>

        {/* Animated alert card */}
        <div className="animate-a-slide-up rounded-lg border border-brand-green/20 bg-brand-green/5 p-3.5 flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/20">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand-green-ink">All systems operational</p>
            <p className="text-[11px] text-brand-dim mt-0.5">3 monitors · last checked 12s ago</p>
          </div>
        </div>
      </div>

      {/* Bottom: social proof */}
      <div className="relative z-10 flex items-center gap-6 border-t border-brand-line pt-6">
        {[
          { value: '30s', label: 'check interval' },
          { value: '<60s', label: 'alert latency' },
          { value: '99.9%', label: 'uptime' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-sm font-bold text-brand-green-ink">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-brand-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Form primitives ─────────────────────────────────────────────────────────

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-brand-dim mb-1.5">
      {children}
    </label>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  rightSlot?: React.ReactNode;
}

export function Input({ error, rightSlot, className, ...props }: InputProps) {
  return (
    <div className="relative">
      <input
        {...props}
        className={cn(
          'w-full rounded-lg border bg-brand-bg2 px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-muted outline-none transition-colors',
          'focus:border-brand-green/60 focus:ring-1 focus:ring-brand-green/20',
          error
            ? 'border-brand-red/60 focus:border-brand-red focus:ring-brand-red/20'
            : 'border-brand-line',
          rightSlot && 'pr-10',
          className
        )}
      />
      {rightSlot && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">{rightSlot}</div>
      )}
    </div>
  );
}

export function PasswordInput({
  error,
  className,
  ...props
}: Omit<InputProps, 'type' | 'rightSlot'>) {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      type={show ? 'text' : 'password'}
      error={error}
      className={className}
      rightSlot={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="text-brand-muted hover:text-brand-dim transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  );
}

export function FieldNote({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <p className={cn('mt-1.5 text-[11px]', error ? 'text-brand-red' : 'text-brand-muted')}>
      {children}
    </p>
  );
}

export function PrimaryBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'w-full rounded-lg bg-brand-green px-4 py-2.5 text-sm font-semibold text-brand-green-fg transition-colors hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

export function OutlineBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'w-full flex items-center justify-center gap-2 rounded-lg border border-brand-line bg-brand-bg2 px-4 py-2.5 text-sm text-brand-dim transition-colors hover:border-brand-line hover:bg-brand-bg3 hover:text-brand-text disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

export function Divider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <span className="h-px flex-1 bg-brand-line" />
      <span className="text-[11px] uppercase tracking-wider text-brand-muted">{label}</span>
      <span className="h-px flex-1 bg-brand-line" />
    </div>
  );
}

export function Checkbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer group">
      <div
        className={cn(
          'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
          checked
            ? 'border-brand-green bg-brand-green'
            : 'border-brand-line bg-brand-bg2 group-hover:border-brand-dim'
        )}
      >
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        {checked && <Check className="h-2.5 w-2.5 text-brand-bg" strokeWidth={3} />}
      </div>
      <span className="text-xs text-brand-dim leading-relaxed">{label}</span>
    </label>
  );
}


const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', 'bg-brand-red', 'bg-brand-amber', 'bg-brand-green/70', 'bg-brand-green'];

export function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              i <= strength ? STRENGTH_COLOR[strength] : 'bg-brand-line'
            )}
          />
        ))}
      </div>
      <p className={cn('text-[11px]', strength >= 3 ? 'text-brand-green-ink' : strength >= 2 ? 'text-brand-amber' : 'text-brand-red')}>
        {STRENGTH_LABEL[strength]}
      </p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-brand-red/30 bg-brand-red/10 px-3.5 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
      <p className="text-sm text-brand-red">{message}</p>
    </div>
  );
}

// ─── Social login buttons ─────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function SocialButtons({
  onGoogle,
  onGitHub,
  loading,
}: {
  onGoogle: () => void;
  onGitHub: () => void;
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <OutlineBtn onClick={onGoogle} disabled={loading}>
        <GoogleIcon />
        Google
      </OutlineBtn>
      <OutlineBtn onClick={onGitHub} disabled={loading}>
        <GitHubIcon />
        GitHub
      </OutlineBtn>
    </div>
  );
}
