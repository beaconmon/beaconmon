export const ANOMALY_MIN_SAMPLES = 30;
export const ANOMALY_Z_THRESHOLD = 3.0;
export const ANOMALY_COOLDOWN_MINUTES = 30;
export const ANOMALY_WINDOW_HOURS = 24;

export interface AnomalyResult {
  zScore: number;
  mean: number;
  stdDev: number;
}

/**
 * Z-score anomaly detection. Returns null when there is not enough data,
 * all samples are identical, or the current value is within normal range.
 */
export function detectAnomaly(samples: number[], currentValue: number): AnomalyResult | null {
  if (samples.length < ANOMALY_MIN_SAMPLES) return null;

  const n = samples.length;
  const mean = samples.reduce((a, b) => a + b, 0) / n;
  const variance = samples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return null;

  const zScore = (currentValue - mean) / stdDev;
  if (zScore <= ANOMALY_Z_THRESHOLD) return null;

  return { zScore, mean, stdDev };
}
