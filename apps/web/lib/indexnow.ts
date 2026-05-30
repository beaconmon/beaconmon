const INDEXNOW_API = 'https://api.indexnow.org/indexnow';
const HOST = 'beaconmon.com';

export async function notifyIndexNow(urls: string[]): Promise<void> {
  const key = process.env.NEXT_PUBLIC_INDEXNOW_KEY;
  if (!key || urls.length === 0) return;

  try {
    await fetch(INDEXNOW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList: urls }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // IndexNow is a best-effort push; failures are non-fatal
  }
}
