import type { MonitorStatus } from '@beaconmon/types';

const CONSECUTIVE_FAILURES_THRESHOLD = 2;

export interface EvaluationResult {
  status: MonitorStatus;
  consecutiveFailures: number;
  /** True when the monitor just transitioned to down (alert should fire) */
  becameDown: boolean;
  /** True when the monitor just transitioned to up (recovery alert should fire) */
  becameUp: boolean;
}

/**
 * Evaluate whether a monitor should change status based on the latest check.
 *
 * Rule (architecture rule #7): A monitor transitions to `down` only after
 * 2 consecutive failures. Single failures do not trigger an incident.
 *
 * @param success        Whether the latest check passed
 * @param prevStatus     The monitor's current status before this check
 * @param prevConsecutive The monitor's current consecutiveFailures count
 */
export function evaluateCheckResult(
  success: boolean,
  prevStatus: MonitorStatus,
  prevConsecutive: number
): EvaluationResult {
  if (success) {
    const wasDown = prevStatus === 'down';
    return {
      status: 'up',
      consecutiveFailures: 0,
      becameDown: false,
      becameUp: wasDown,
    };
  }

  const newConsecutive = prevConsecutive + 1;
  const shouldGoDown = newConsecutive >= CONSECUTIVE_FAILURES_THRESHOLD;
  const wasAlreadyDown = prevStatus === 'down';

  return {
    status: shouldGoDown ? 'down' : prevStatus,
    consecutiveFailures: newConsecutive,
    becameDown: shouldGoDown && !wasAlreadyDown,
    becameUp: false,
  };
}
