import * as url from 'node:url';
import whoiser from 'whoiser';
import type { CheckResult } from '@beaconmon/types';
import type { CheckInput } from './types.js';

export interface DomainCheckDetail {
  daysRemaining: number;
  registrar: string;
}

const EXPIRY_FIELDS = ['Expiry Date', 'Registry Expiry Date', 'Expiration Date', 'expires'];

function findExpiryDate(whoisData: Record<string, unknown>): Date | null {
  for (const field of EXPIRY_FIELDS) {
    const val = whoisData[field];
    if (typeof val === 'string' && val) {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
      const parsed = new Date(val[0]);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
}

function findRegistrar(whoisData: Record<string, unknown>): string {
  const registrar = whoisData['Registrar'];
  if (typeof registrar === 'string') return registrar;
  if (Array.isArray(registrar) && typeof registrar[0] === 'string') return registrar[0];
  return '';
}

export async function runDomainCheck(
  job: CheckInput
): Promise<CheckResult & { domainDetail?: DomainCheckDetail }> {
  const checkedAt = new Date();
  const startedAt = Date.now();

  let hostname: string;
  try {
    const parsed = new url.URL(job.url);
    hostname = parsed.hostname;
  } catch {
    return {
      monitorId: job.monitorId,
      checkedAt,
      success: false,
      statusCode: null,
      responseTimeMs: Date.now() - startedAt,
      errorType: 'unknown',
      errorMessage: `Invalid URL: ${job.url}`,
      type: job.type,
    };
  }

  try {
    let timer: ReturnType<typeof setTimeout>;
    const result = await Promise.race([
      whoiser(hostname, { follow: 1 }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('WHOIS timeout')), job.timeoutMs);
      }),
    ]);
    clearTimeout(timer!);

    const responseTimeMs = Date.now() - startedAt;

    // whoiser returns an object keyed by whois server; find the first result with data
    const whoisEntries = Object.values(result as Record<string, unknown>);
    let expiryDate: Date | null = null;
    let registrar = '';

    for (const entry of whoisEntries) {
      if (entry && typeof entry === 'object') {
        const data = entry as Record<string, unknown>;
        const found = findExpiryDate(data);
        if (found) {
          expiryDate = found;
          registrar = findRegistrar(data);
          break;
        }
      }
    }

    if (!expiryDate) {
      return {
        monitorId: job.monitorId,
        checkedAt,
        success: false,
        statusCode: null,
        responseTimeMs,
        errorType: 'unknown',
        errorMessage: 'Could not determine domain expiry date from WHOIS data',
        type: job.type,
      };
    }

    const daysRemaining = Math.floor(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      monitorId: job.monitorId,
      checkedAt,
      success: daysRemaining > 0,
      statusCode: null,
      responseTimeMs,
      errorType: daysRemaining <= 0 ? 'unknown' : null,
      errorMessage: daysRemaining <= 0 ? 'Domain has expired' : null,
      type: job.type,
      domainDetail: { daysRemaining, registrar },
    };
  } catch (err) {
    return {
      monitorId: job.monitorId,
      checkedAt,
      success: false,
      statusCode: null,
      responseTimeMs: Date.now() - startedAt,
      errorType: 'unknown',
      errorMessage: err instanceof Error ? err.message : 'WHOIS lookup failed',
      type: job.type,
    };
  }
}
