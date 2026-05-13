const CF_API = 'https://api.cloudflare.com/client/v4';

function getCfConfig(): { zoneId: string; token: string } | null {
  const zoneId = process.env['CLOUDFLARE_ZONE_ID'];
  const token = process.env['CLOUDFLARE_API_TOKEN'];
  if (!zoneId || !token) return null;
  return { zoneId, token };
}

type CfResponse<T> = { success: boolean; result: T; errors: { code: number; message: string }[] };
type CustomHostnameResult = { id: string; hostname: string; ssl: { status: string } };

export async function createCustomHostname(hostname: string): Promise<string | null> {
  const cfg = getCfConfig();
  if (!cfg) return null;

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
  });

  const data = (await res.json()) as CfResponse<CustomHostnameResult>;
  if (!data.success || !data.result?.id) return null;
  return data.result.id;
}

export async function deleteCustomHostname(hostnameId: string): Promise<void> {
  const cfg = getCfConfig();
  if (!cfg) return;

  await fetch(`${CF_API}/zones/${cfg.zoneId}/custom_hostnames/${hostnameId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${cfg.token}` },
  });
}
