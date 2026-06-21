'use client';

import { Suspense, useCallback, useEffect, useState, type ReactElement } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import {
  AuthShell,
  AuthPanel,
  AuthLogo,
  Label,
  Input,
  PrimaryBtn,
  ErrorBanner,
} from '@/components/auth';

// Hands a freshly minted bearer token to the installed extension via the
// externally_connectable channel. Returns false if the extension isn't reachable
// (not installed, wrong id, older Chrome), so the page can show a retry path.
function sendToExtension(extId: string, token: string, teamName: string | null): Promise<boolean> {
  return new Promise((resolve) => {
    const runtime = (globalThis as { chrome?: { runtime?: ChromeRuntime } }).chrome?.runtime;
    if (!runtime?.sendMessage) {
      resolve(false);
      return;
    }
    try {
      runtime.sendMessage(extId, { type: 'EXT_TOKEN', token, teamName: teamName ?? undefined }, (resp) => {
        if (runtime.lastError) {
          resolve(false);
          return;
        }
        resolve(Boolean(resp?.ok));
      });
    } catch {
      resolve(false);
    }
  });
}

interface ChromeRuntime {
  lastError?: { message?: string };
  sendMessage?: (
    extensionId: string,
    message: unknown,
    callback: (response?: { ok?: boolean }) => void
  ) => void;
}

type Phase =
  | 'checking' // resolving the current session
  | 'signin' // no session — collect email for magic link
  | 'sent' // magic link emailed
  | 'connecting' // session present — minting + handing off
  | 'done'
  | 'unreachable' // token minted but extension didn't answer
  | 'error';

// Chrome extension ids are 32 chars in a-p; reject anything else so we never
// post a token to an arbitrary id supplied in the URL.
const EXT_ID_RE = /^[a-p]{32}$/;

function ConnectFlow(): ReactElement {
  const searchParams = useSearchParams();
  const extId = searchParams.get('ext_id') ?? '';
  const extIdValid = EXT_ID_RE.test(extId);

  const [phase, setPhase] = useState<Phase>('checking');
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mint a token for the signed-in user and hand it to the extension.
  const connect = useCallback(async () => {
    setPhase('connecting');
    setError('');
    try {
      const res = await fetch('/api/extension/token', { method: 'POST' });
      if (!res.ok) {
        setError('Could not issue an extension token. Please try again.');
        setPhase('error');
        return;
      }
      const data = (await res.json()) as { token: string; teamName: string | null };
      setTeamName(data.teamName);
      const delivered = await sendToExtension(extId, data.token, data.teamName);
      setPhase(delivered ? 'done' : 'unreachable');
    } catch {
      setError('Something went wrong connecting your extension.');
      setPhase('error');
    }
  }, [extId]);

  // On load, if already authenticated, go straight to minting; otherwise prompt
  // for the magic link. After the user clicks the emailed link they return here
  // with a session and this effect completes the handoff.
  useEffect(() => {
    if (!extIdValid) {
      setPhase('error');
      setError('This page must be opened from the Beaconmon extension.');
      return;
    }
    let cancelled = false;
    void authClient.getSession().then((session) => {
      if (cancelled) return;
      if (session.data?.user) {
        void connect();
      } else {
        setPhase('signin');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [extIdValid, connect]);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    // Return to this same page (ext_id preserved) once the link is verified.
    const callbackURL = `/extension/connect?ext_id=${encodeURIComponent(extId)}`;
    const res = await authClient.signIn.magicLink({ email, callbackURL });
    setLoading(false);
    if (res.error) {
      setError(res.error.message ?? 'Could not send the magic link.');
      return;
    }
    setPhase('sent');
  }

  return (
    <AuthShell panel={<AuthPanel variant="welcome" />}>
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="mb-2">
          <AuthLogo />
        </div>

        <div>
          <h1 className="text-xl font-bold text-brand-text">Connect your extension</h1>
          <p className="mt-1 text-sm text-brand-dim">
            Link the Competitor X-ray extension to your Beaconmon account so you can watch competitor stores.
          </p>
        </div>

        {error && <ErrorBanner message={error} />}

        {phase === 'checking' && <p className="text-sm text-brand-dim">Checking your session…</p>}

        {phase === 'signin' && (
          <form onSubmit={sendMagicLink} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                error={Boolean(error)}
                required
              />
            </div>
            <PrimaryBtn type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Email me a sign-in link'}
            </PrimaryBtn>
            <p className="text-center text-xs text-brand-muted">
              Shopify App merchants: use the email on your store and we&apos;ll connect this to the same workspace.
            </p>
          </form>
        )}

        {phase === 'sent' && (
          <p className="text-sm text-brand-dim">
            Check your inbox and click the sign-in link. This page will finish connecting automatically when you return.
          </p>
        )}

        {phase === 'connecting' && <p className="text-sm text-brand-dim">Connecting…</p>}

        {phase === 'done' && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-green-ink">Connected{teamName ? ` to ${teamName}` : ''}.</p>
            <p className="text-sm text-brand-dim">
              You can close this tab and go back to the store. The Track button in the extension is ready.
            </p>
          </div>
        )}

        {phase === 'unreachable' && (
          <div className="space-y-3">
            <p className="text-sm text-brand-dim">
              We signed you in, but couldn&apos;t reach the extension. Make sure the Beaconmon extension is installed and
              enabled, then try again.
            </p>
            <PrimaryBtn type="button" onClick={() => void connect()}>
              Retry
            </PrimaryBtn>
          </div>
        )}
      </div>
    </AuthShell>
  );
}

export default function ExtensionConnectPage(): ReactElement {
  return (
    <Suspense>
      <ConnectFlow />
    </Suspense>
  );
}
