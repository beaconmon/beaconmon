import * as tls from 'node:tls';
import * as url from 'node:url';
import type { CheckResult } from '@beaconmon/types';
import type { CheckInput } from './types.js';
import { classifyError } from './errors.js';

export interface SslCheckDetail {
  daysRemaining: number;
  validFrom: string;
  validTo: string;
  issuer: string;
  subject: string;
}

function getString(val: string | string[] | undefined): string {
  if (!val) return '';
  return Array.isArray(val) ? val[0] ?? '' : val;
}

export async function runSslCheck(
  job: CheckInput
): Promise<CheckResult & { sslDetail?: SslCheckDetail }> {
  const checkedAt = new Date();
  const startedAt = Date.now();

  const parsed = new url.URL(job.url);
  const hostname = parsed.hostname;
  const port = parsed.port ? parseInt(parsed.port, 10) : 443;

  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port, servername: hostname },
      () => {
        const responseTimeMs = Date.now() - startedAt;
        const cert = socket.getPeerCertificate();
        socket.destroy();

        if (!cert || !cert.valid_to) {
          resolve({
            monitorId: job.monitorId,
            checkedAt,
            success: false,
            statusCode: null,
            responseTimeMs,
            errorType: 'ssl_error',
            errorMessage: 'No certificate returned',
            type: job.type,
          });
          return;
        }

        const validTo = new Date(cert.valid_to);
        const daysRemaining = Math.floor(
          (validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        resolve({
          monitorId: job.monitorId,
          checkedAt,
          success: daysRemaining > 0,
          statusCode: null,
          responseTimeMs,
          errorType: daysRemaining <= 0 ? 'ssl_error' : null,
          errorMessage:
            daysRemaining <= 0 ? 'Certificate has expired' : null,
          type: job.type,
          sslDetail: {
            daysRemaining,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            issuer: getString(cert.issuer?.CN),
            subject: getString(cert.subject?.CN),
          },
        });
      }
    );

    socket.setTimeout(job.timeoutMs, () => {
      socket.destroy();
      resolve({
        monitorId: job.monitorId,
        checkedAt,
        success: false,
        statusCode: null,
        responseTimeMs: Date.now() - startedAt,
        errorType: 'timeout',
        errorMessage: `SSL check timed out after ${job.timeoutMs}ms`,
        type: job.type,
      });
    });

    socket.on('error', (err) => {
      const { errorType, errorMessage } = classifyError(err);
      resolve({
        monitorId: job.monitorId,
        checkedAt,
        success: false,
        statusCode: null,
        responseTimeMs: Date.now() - startedAt,
        errorType,
        errorMessage,
        type: job.type,
      });
    });
  });
}
