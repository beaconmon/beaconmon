import type { CheckErrorType } from '@beaconmon/types';

/**
 * Classify a raw error from undici / net / tls into a typed CheckErrorType.
 */
export function classifyError(err: unknown): {
  errorType: CheckErrorType;
  errorMessage: string;
} {
  if (!(err instanceof Error)) {
    return { errorType: 'unknown', errorMessage: String(err) };
  }

  const msg = err.message.toLowerCase();
  const code = (err as NodeJS.ErrnoException).code ?? '';

  if (
    msg.includes('connect etimedout') ||
    msg.includes('timeout') ||
    code === 'ETIMEDOUT' ||
    code === 'UND_ERR_CONNECT_TIMEOUT' ||
    code === 'UND_ERR_HEADERS_TIMEOUT' ||
    code === 'UND_ERR_BODY_TIMEOUT'
  ) {
    return { errorType: 'timeout', errorMessage: err.message };
  }

  if (
    code === 'ECONNREFUSED' ||
    msg.includes('connection refused') ||
    code === 'UND_ERR_SOCKET'
  ) {
    return { errorType: 'connection_refused', errorMessage: err.message };
  }

  if (
    code === 'CERT_HAS_EXPIRED' ||
    code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
    code === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
    msg.includes('ssl') ||
    msg.includes('certificate') ||
    msg.includes('tls')
  ) {
    return { errorType: 'ssl_error', errorMessage: err.message };
  }

  if (
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    msg.includes('dns') ||
    msg.includes('getaddrinfo')
  ) {
    return { errorType: 'dns_error', errorMessage: err.message };
  }

  return { errorType: 'unknown', errorMessage: err.message };
}
