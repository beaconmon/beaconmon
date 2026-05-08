import dns from 'node:dns/promises';
import { logger } from '@/lib/logger';
export { DNS_PROVIDER_INFO } from './dns-provider-info';

const PROVIDERS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /\.ns\.cloudflare\.com$/, name: 'cloudflare' },
  { pattern: /\.domaincontrol\.com$/, name: 'godaddy' },
  { pattern: /registrar-servers\.com$/, name: 'namecheap' },
  { pattern: /ns-cloud-\w+\.googledomains\.com$/, name: 'squarespace' },
  { pattern: /\.awsdns-\d+\.(com|net|org|co\.uk)$/, name: 'route53' },
  { pattern: /\.porkbun\.com$/, name: 'porkbun' },
];

const DNS_TIMEOUT_MS = 5_000;

function apexDomain(domain: string): string {
  const parts = domain.split('.');
  return parts.slice(-2).join('.');
}

export async function detectDnsProvider(domain: string): Promise<string | null> {
  try {
    const apex = apexDomain(domain);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('DNS timeout')), DNS_TIMEOUT_MS)
    );
    const nameservers = await Promise.race([dns.resolveNs(apex), timeout]);
    for (const ns of nameservers) {
      for (const provider of PROVIDERS) {
        if (provider.pattern.test(ns)) return provider.name;
      }
    }
    return null;
  } catch (err) {
    logger.warn({ service: 'web', domain, err }, 'detectDnsProvider failed');
    return null;
  }
}

