import 'server-only';
import { runHttpCheck, checkSsl, followRedirectChain, type SslInfo } from './uptime-check';

export interface BfcmCheckItem {
  pass: boolean;
  score: number;
  maxScore: 20;
  label: string;
  detail: string;
  fix: string | null;
}

export interface BfcmChecks {
  uptime: BfcmCheckItem;
  ssl: BfcmCheckItem;
  speed: BfcmCheckItem;
  redirects: BfcmCheckItem;
  monitoring: BfcmCheckItem;
}

export interface BfcmResult {
  ok: true;
  domain: string;
  score: number;
  grade: string;
  checks: BfcmChecks;
}

export function gradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function buildSslCheck(ssl: SslInfo | null): BfcmCheckItem {
  if (!ssl) {
    return {
      pass: false, score: 0, maxScore: 20,
      label: 'SSL certificate valid',
      detail: 'SSL certificate could not be verified',
      fix: 'Ensure your SSL certificate is valid and properly configured.',
    };
  }
  const SSL_FIX = 'Your SSL cert expires within 30 days. Shopify managed domains renew automatically, but custom domain certs may need manual renewal.';
  if (!ssl.valid || ssl.daysRemaining < 8) {
    return {
      pass: false, score: 0, maxScore: 20,
      label: 'SSL certificate valid',
      detail: ssl.valid ? `Expires in ${ssl.daysRemaining} days (critical, renew immediately)` : 'SSL certificate is invalid or expired',
      fix: SSL_FIX,
    };
  }
  if (ssl.daysRemaining < 30) {
    return {
      pass: false, score: 10, maxScore: 20,
      label: 'SSL certificate valid',
      detail: `Expires in ${ssl.daysRemaining} days (renew before BFCM)`,
      fix: SSL_FIX,
    };
  }
  return {
    pass: true, score: 20, maxScore: 20,
    label: 'SSL certificate valid',
    detail: `Expires in ${ssl.daysRemaining} days`,
    fix: null,
  };
}

function buildSpeedCheck(responseMs: number | null): BfcmCheckItem {
  const SPEED_FIX = 'Response times above 1,500ms under normal load often become timeouts under peak BFCM traffic. Check for unused Shopify apps slowing down your theme.';
  if (responseMs === null) {
    return { pass: false, score: 0, maxScore: 20, label: 'Response time', detail: 'Response time could not be measured', fix: SPEED_FIX };
  }
  if (responseMs < 800) {
    return { pass: true, score: 20, maxScore: 20, label: 'Response time', detail: `${responseMs}ms (fast)`, fix: null };
  }
  if (responseMs <= 1500) {
    return {
      pass: false, score: 10, maxScore: 20,
      label: 'Response time',
      detail: `${responseMs.toLocaleString()}ms (above 800ms threshold)`,
      fix: SPEED_FIX,
    };
  }
  return {
    pass: false, score: 0, maxScore: 20,
    label: 'Response time',
    detail: `${responseMs.toLocaleString()}ms (above 1,500ms threshold for peak traffic)`,
    fix: SPEED_FIX,
  };
}

function buildRedirectCheck(hops: number, hasLoop: boolean): BfcmCheckItem {
  const REDIRECT_FIX = 'Redirect chains slow down load time and confuse crawlers. Ensure www redirects correctly to your canonical domain with a single hop.';
  if (hasLoop || hops >= 5) {
    return {
      pass: false, score: 0, maxScore: 20,
      label: 'Redirect chain clean',
      detail: hasLoop ? 'Redirect loop detected' : `${hops}+ redirect hops (too many)`,
      fix: REDIRECT_FIX,
    };
  }
  if (hops >= 3) {
    return {
      pass: false, score: 10, maxScore: 20,
      label: 'Redirect chain clean',
      detail: `${hops} redirect hops (above recommended limit)`,
      fix: REDIRECT_FIX,
    };
  }
  return {
    pass: true, score: 20, maxScore: 20,
    label: 'Redirect chain clean',
    detail: hops === 0 ? 'No redirects' : `${hops} redirect${hops === 1 ? '' : 's'}, no loops`,
    fix: null,
  };
}

export async function runBfcmCheck(domain: string): Promise<BfcmResult> {
  const [{ httpStatus, responseMs }, ssl, redirects] = await Promise.all([
    runHttpCheck(domain),
    checkSsl(domain),
    followRedirectChain(`http://${domain}/`),
  ]);

  const isUp = httpStatus !== null && httpStatus >= 200 && httpStatus < 400;

  const uptimeCheck: BfcmCheckItem = {
    pass: isUp,
    score: isUp ? 20 : 0,
    maxScore: 20,
    label: 'Store is responding',
    detail: isUp
      ? `Responded in ${responseMs}ms (HTTP ${httpStatus})`
      : httpStatus !== null
      ? `Store returned HTTP ${httpStatus}`
      : 'Store did not respond within the timeout',
    fix: isUp ? null : 'Confirm your store domain is correct and check shopifystatus.com if the platform itself may be having issues.',
  };

  const sslCheck = buildSslCheck(ssl);
  const speedCheck = buildSpeedCheck(isUp ? responseMs : null);
  const redirectsCheck = buildRedirectCheck(redirects.hops, redirects.hasLoop);

  const monitoringCheck: BfcmCheckItem = {
    pass: false,
    score: 0,
    maxScore: 20,
    label: 'Uptime monitoring active',
    detail: 'No monitoring detected. You would not know your store went down during BFCM until a customer told you.',
    fix: 'Set up uptime monitoring before BFCM. Beaconmon checks every minute and alerts via email or Slack.',
  };

  const score = uptimeCheck.score + sslCheck.score + speedCheck.score + redirectsCheck.score + monitoringCheck.score;

  return {
    ok: true,
    domain,
    score,
    grade: gradeFromScore(score),
    checks: { uptime: uptimeCheck, ssl: sslCheck, speed: speedCheck, redirects: redirectsCheck, monitoring: monitoringCheck },
  };
}
