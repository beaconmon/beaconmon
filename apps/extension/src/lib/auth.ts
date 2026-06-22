// Bearer-token store. The token is minted server-side after a magic-link sign-in
// on beaconmon.com/extension/connect and handed to the service worker via
// externally_connectable. We persist it in chrome.storage.local (survives worker
// restarts) and attach it as `Authorization: Bearer` on authenticated calls.
import type { AuthState } from './messages.js';

const TOKEN_KEY = 'bm_ext_token';
const TEAM_NAME_KEY = 'bm_ext_team_name';

export async function getToken(): Promise<string | null> {
  const stored = await chrome.storage.local.get(TOKEN_KEY);
  const token = stored[TOKEN_KEY];
  return typeof token === 'string' && token.length > 0 ? token : null;
}

export async function setToken(token: string, teamName?: string): Promise<void> {
  await chrome.storage.local.set({
    [TOKEN_KEY]: token,
    [TEAM_NAME_KEY]: teamName ?? null,
  });
}

export async function clearToken(): Promise<void> {
  await chrome.storage.local.remove([TOKEN_KEY, TEAM_NAME_KEY]);
}

export async function getAuthState(): Promise<AuthState> {
  const stored = await chrome.storage.local.get([TOKEN_KEY, TEAM_NAME_KEY]);
  const token = stored[TOKEN_KEY];
  const teamName = stored[TEAM_NAME_KEY];
  return {
    connected: typeof token === 'string' && token.length > 0,
    teamName: typeof teamName === 'string' ? teamName : undefined,
  };
}
