export const REGIONS = ['us-east', 'us-west', 'eu-west', 'ap-southeast', 'sa-east'] as const;
export type ProbeRegion = (typeof REGIONS)[number];

/** Maps region → Cloudflare Durable Object location hint */
export const REGION_DO_LOCATION_HINTS: Record<ProbeRegion, string> = {
  'us-east': 'enam',
  'us-west': 'wnam',
  'eu-west': 'weur',
  'ap-southeast': 'apac',
  'sa-east': 'sam',
};

/** Maps region → env var name holding that CF Worker URL */
export const REGION_ENV_VAR: Record<ProbeRegion, string> = {
  'us-east': 'CF_PROBE_URL_US_EAST',
  'us-west': 'CF_PROBE_URL_US_WEST',
  'eu-west': 'CF_PROBE_URL_EU_WEST',
  'ap-southeast': 'CF_PROBE_URL_AP_SOUTHEAST',
  'sa-east': 'CF_PROBE_URL_SA_EAST',
};
