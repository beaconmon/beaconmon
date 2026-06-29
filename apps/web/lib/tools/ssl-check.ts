import 'server-only';
import tls from 'node:tls';

const SSL_TIMEOUT_MS = 8_000;

export interface SslCheckResult {
  /** Cert chain is trusted by Node's root store and not yet expired. */
  valid: boolean;
  /** Certificate expiry as an ISO timestamp. */
  expiresAt: string;
  /** Whole days from now until expiry. Negative once expired. */
  daysRemaining: number;
  /** Issuing organization, e.g. "Let's Encrypt". */
  issuer: string;
  /** Subject common name on the certificate. */
  commonName: string;
}

/**
 * Open a TLS connection on port 443 and read the leaf certificate.
 *
 * rejectUnauthorized is false so we can still inspect an expired or
 * self-signed cert rather than aborting the handshake; trust is reported
 * separately via socket.authorized in the `valid` flag. Returns null when the
 * host does not complete a TLS handshake at all (no HTTPS, DNS failure, etc).
 */
export async function checkSslCertificate(domain: string): Promise<SslCheckResult | null> {
  return new Promise((resolve) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;

    const finish = (val: SslCheckResult | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      resolve(val);
    };

    const socket = tls.connect(
      {
        host: domain,
        port: 443,
        servername: domain,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || !cert.valid_to) {
          finish(null);
          return;
        }

        let expiresAt: string;
        let daysRemaining: number;
        try {
          const expiry = new Date(cert.valid_to);
          expiresAt = expiry.toISOString();
          daysRemaining = Math.floor((expiry.getTime() - Date.now()) / 86_400_000);
        } catch {
          finish(null);
          return;
        }

        const issuerObj = cert.issuer as Record<string, string> | undefined;
        const subjectObj = cert.subject as Record<string, string> | undefined;
        const issuer = issuerObj?.O || issuerObj?.CN || 'Unknown';
        const commonName = subjectObj?.CN || domain;

        finish({
          valid: socket.authorized === true && daysRemaining > 0,
          expiresAt,
          daysRemaining,
          issuer,
          commonName,
        });
      },
    );

    timer = setTimeout(() => finish(null), SSL_TIMEOUT_MS);
    socket.setTimeout(SSL_TIMEOUT_MS - 1_000);
    socket.on('error', () => finish(null));
    socket.on('timeout', () => finish(null));
  });
}
