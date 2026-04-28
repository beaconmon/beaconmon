// Inline type definitions — no @beaconmon/types import (CF Workers can't use Node.js workspace packages)

export type ProbeRegion = 'us-east' | 'us-west' | 'eu-west' | 'ap-southeast' | 'sa-east';

export const REGION_DO_LOCATION_HINTS: Record<ProbeRegion, DurableObjectLocationHint> = {
  'us-east': 'enam',
  'us-west': 'wnam',
  'eu-west': 'weur',
  'ap-southeast': 'apac',
  'sa-east': 'sam',
};

export interface Env {
  REGION_PROBE_SECRET: string;
  REGION_NAME: ProbeRegion;
  PROBE_DO: DurableObjectNamespace;
}

export interface ProbeRequest {
  monitorId: string;
  url: string;
  type: 'http' | 'keyword';
  timeoutMs: number;
  keyword?: string;
  keywordCondition?: 'present' | 'absent';
}

export interface ProbeResponse {
  success: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorType: 'timeout' | 'dns_error' | 'connection_refused' | 'non_2xx' | 'keyword_mismatch' | 'unknown' | null;
  errorMessage: string | null;
}
