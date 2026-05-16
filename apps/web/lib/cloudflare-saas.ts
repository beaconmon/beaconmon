import { z } from 'zod';
import { createLogger } from '@beaconmon/logger';

const CF_API = 'https://api.cloudflare.com/client/v4';
const FETCH_TIMEOUT_MS = 10_000;

const logger = createLogger('web');

const cfEnvSchema = z.object({
  zoneId: z.string().min(1),
  token: z.string().min(1),
});

function getCfConfig(): { zoneId: string; token: string } | null {
  const result = cfEnvSchema.safeParse({
    zoneId: process.env['CLOUDFLARE_ZONE_ID'],
    token: process.env['CLOUDFLARE_API_TOKEN'],
  });
  if (!result.success) return null;
  return result.data;
}

type CfResponse<T> = { success: boolean; result: T; errors: { code: number; message: string }[] };
type CustomHostnameResult = { id: string; hostname: string; ssl: { status: string } };

export async function createCustomHostname(hostname: string): Promise<string | null> {
  const cfg = getCfConfig();
  if (!cfg) return null;

  logger.info({ service: 'web', hostname }, 'Creating Cloudflare custom hostname');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${CF_API}/zones/${cfg.zoneId}/custom_hostnames`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostname,
        ssl: {
          method: 'http',
          type: 'dv',
          settings: { http2: 'on', tls_1_3: 'on', min_tls_version: '1.2' },
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = (await res.json()) as CfResponse<CustomHostnameResult>;

    if (!data.success || !data.result?.id) {
      logger.error(
        { service: 'web', hostname, status: res.status, errors: data.errors },
        'Cloudflare custom hostname creation failed',
      );
      return null;
    }

    logger.info({ service: 'web', hostname, hostnameId: data.result.id }, 'Cloudflare custom hostname created');
    return data.result.id;
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    logger.error(
      { service: 'web', hostname, zoneId: cfg.zoneId, err, timedOut: isTimeout },
      'Failed to create Cloudflare custom hostname',
    );
    return null;
  }
}

export async function deleteCustomHostname(hostnameId: string): Promise<void> {
  const cfg = getCfConfig();
  if (!cfg) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${CF_API}/zones/${cfg.zoneId}/custom_hostnames/${hostnameId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      logger.error(
        { service: 'web', hostnameId, zoneId: cfg.zoneId, status: res.status },
        'Cloudflare custom hostname deletion failed',
      );
      return;
    }

    logger.info({ service: 'web', hostnameId }, 'Cloudflare custom hostname deleted');
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    logger.error(
      { service: 'web', hostnameId, zoneId: cfg.zoneId, err, timedOut: isTimeout },
      'Failed to delete Cloudflare custom hostname',
    );
  }
}
