// Server adapter — the extension's ONLY authenticated touchpoint with Beaconmon.
// Everything else (the X-ray) is on-device. Track creates a single catalog-sync
// competitor monitor; free-tier footprint and plan-limit enforcement live on the
// server (reusing PlanLimitError), so this layer just translates HTTP to intent.
import { API_ORIGIN } from './config.js';
import { getToken, clearToken } from './auth.js';
import type { TrackResult } from './messages.js';

// Server contract (to be implemented on the web app):
//   POST {API_ORIGIN}/api/extension/track
//   Authorization: Bearer <extension token>
//   body: { domain: string, name: string }
//   -> 201 { ok: true }
//   -> 401 unauthenticated (token missing/revoked)
//   -> 402/403 PlanLimitError (free competitor cap hit) { code: 'PLAN_LIMIT', error }
// The endpoint resolves the token to a team, then creates one Shopify competitor
// (dataTier: full_catalog) the same way POST /api/competitors does, tagged
// source: 'extension'. See docs/chrome-extension-mvp.md "Server contract".
export async function track(domain: string, name: string): Promise<TrackResult> {
  const token = await getToken();
  if (!token) {
    return { ok: false, reason: 'unauthenticated', message: 'Connect your Beaconmon account first.' };
  }

  let res: Response;
  try {
    res = await fetch(`${API_ORIGIN}/api/extension/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ domain, name }),
    });
  } catch {
    return { ok: false, reason: 'error', message: 'Could not reach Beaconmon. Check your connection.' };
  }

  if (res.ok) return { ok: true };

  if (res.status === 401) {
    await clearToken();
    return { ok: false, reason: 'unauthenticated', message: 'Your session expired. Reconnect to keep tracking.' };
  }

  // Plan cap: free competitor slots exhausted. Surface the upgrade nudge.
  if (res.status === 402 || res.status === 403) {
    const body = await safeJson(res);
    return {
      ok: false,
      reason: 'limit',
      message: body?.error ?? "You're at your plan's competitor limit. Upgrade to watch more stores.",
    };
  }

  const body = await safeJson(res);
  return { ok: false, reason: 'error', message: body?.error ?? 'Something went wrong starting tracking.' };
}

async function safeJson(res: Response): Promise<{ error?: string } | null> {
  try {
    return (await res.json()) as { error?: string };
  } catch {
    return null;
  }
}
