import { logger } from './lib/logger.js';
import { prisma } from '@beaconmon/db';
import {
  monitorRepository,
  incidentRepository,
  statusPageWorkerRepository,
  type MonitorForCheck,
} from '@beaconmon/db';
import { evaluateCheckResult, CONSECUTIVE_FAILURES_THRESHOLD } from '@beaconmon/checker';
import { warmStatusPageCache } from '@beaconmon/status-pages';
import type { Queue } from 'bullmq';
import type { AlertJob, EscalationStepJob } from '@beaconmon/queue';
import type { Redis } from 'ioredis';
import type { CheckContext } from './process-expiry-check.js';

async function enqueueEscalationSteps(
  incidentId: string,
  monitorId: string,
  teamId: string,
  policyId: string,
  escalationQueue: Queue<EscalationStepJob>
): Promise<void> {
  const policy = await prisma.escalationPolicy.findUnique({
    where: { id: policyId },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  });
  if (!policy || policy.steps.length === 0) return;

  for (const step of policy.steps) {
    const delayMs = step.delayMinutes * 60_000;
    await escalationQueue.add(
      `escalation:${incidentId}:step${step.stepOrder}`,
      { incidentId, monitorId, policyId, teamId, stepIndex: step.stepOrder },
      {
        jobId: `escalation-${incidentId}-step${step.stepOrder}`,
        delay: delayMs,
      }
    );
  }
  logger.info(
    { service: 'check-worker', incidentId, policyId, steps: policy.steps.length },
    'Escalation steps enqueued'
  );
}

/**
 * Resolve which escalation policy applies for this monitor's incident:
 *   1. monitor.escalationPolicyId — explicit per-monitor policy
 *   2. team.defaultEscalationPolicyId — team-level fallback
 *   3. null — caller falls back to broadcast-all
 */
async function resolveEscalationPolicyId(
  monitorEscalationPolicyId: string | null,
  teamId: string
): Promise<string | null> {
  if (monitorEscalationPolicyId) return monitorEscalationPolicyId;
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { defaultEscalationPolicyId: true },
  });
  return team?.defaultEscalationPolicyId ?? null;
}

async function dispatchDownAlert(params: {
  incidentId: string;
  monitorId: string;
  teamId: string;
  monitorEscalationPolicyId: string | null;
  alertQueue: Queue<AlertJob>;
  escalationQueue?: Queue<EscalationStepJob>;
}): Promise<void> {
  const { incidentId, monitorId, teamId, monitorEscalationPolicyId, alertQueue, escalationQueue } =
    params;

  const policyId = escalationQueue
    ? await resolveEscalationPolicyId(monitorEscalationPolicyId, teamId)
    : null;

  if (policyId && escalationQueue) {
    await enqueueEscalationSteps(incidentId, monitorId, teamId, policyId, escalationQueue);
    return;
  }

  await alertQueue.add(
    `alert:down:${monitorId}`,
    { incidentId, monitorId, teamId, type: 'down' },
    { jobId: `alert-down-${incidentId}` }
  );
}

export async function processIncidentCheck(
  ctx: CheckContext,
  alertQueue: Queue<AlertJob>,
  redis?: Redis,
  escalationQueue?: Queue<EscalationStepJob>
): Promise<void> {
  const { monitorId, monitor, result } = ctx;
  const service = 'check-worker';

  if (!monitor) return;

  const evaluation = evaluateCheckResult(
    result.success,
    monitor.currentStatus,
    monitor.consecutiveFailures
  );

  // Update monitor state first — if this fails, skip incident management
  // to prevent stale consecutiveFailures from triggering duplicate incidents
  try {
    await monitorRepository.updateAfterCheck(monitorId, {
      currentStatus: evaluation.status,
      consecutiveFailures: evaluation.consecutiveFailures,
      lastCheckedAt: result.checkedAt,
    });
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to update monitor after check, skipping incident management');
    return;
  }

  if (evaluation.becameDown) {
    try {
      const incident = await incidentRepository.create({
        monitorId,
        teamId: monitor.teamId,
        startedAt: result.checkedAt,
      });

      await dispatchDownAlert({
        incidentId: incident.id,
        monitorId,
        teamId: monitor.teamId,
        monitorEscalationPolicyId: monitor.escalationPolicyId ?? null,
        alertQueue,
        escalationQueue,
      });

      logger.info(
        { service, monitorId, incidentId: incident.id },
        'Incident created, alert enqueued'
      );
    } catch (err) {
      logger.error(
        { service, monitorId, err },
        'Failed to create incident or enqueue down alert'
      );
    }
  }

  if (evaluation.becameUp) {
    try {
      const openIncident = await incidentRepository.findOpenByMonitorId(monitorId);
      if (openIncident) {
        const resolved = await incidentRepository.resolve(openIncident.id, {
          resolvedAt: result.checkedAt,
          resolutionType: 'automatic',
        });
        const durationMs =
          resolved.resolvedAt && resolved.startedAt
            ? resolved.resolvedAt.getTime() - resolved.startedAt.getTime()
            : undefined;
        await alertQueue.add(
          `alert:up:${monitorId}`,
          {
            incidentId: resolved.id,
            monitorId,
            teamId: monitor.teamId,
            type: 'up',
            durationMs,
          },
          { jobId: `alert-up-${resolved.id}` }
        );
        logger.info(
          { service, monitorId, incidentId: resolved.id, durationMs },
          'Incident resolved, recovery alert enqueued'
        );
      } else {
        logger.warn(
          { service, monitorId },
          'Recovery: no open incident found, skipping alert'
        );
      }
    } catch (err) {
      logger.error(
        { service, monitorId, err },
        'Failed to resolve incident or enqueue up alert'
      );
    }
  }

  // Warm status page cache on any status transition
  if ((evaluation.becameDown || evaluation.becameUp) && redis) {
    try {
      const slugs = await statusPageWorkerRepository.findStatusPageSlugsForMonitor(monitorId);
      for (const slug of slugs) {
        await warmStatusPageCache(slug, { redis });
      }
    } catch (err) {
      logger.warn({ service, monitorId, err }, 'Failed to warm status page cache');
    }
  }
}

// ─── Multi-region incident check ──────────────────────────────────────────────

interface RegionProbeResult {
  region: string;
  success: boolean;
}

interface MultiRegionCheckContext {
  monitorId: string;
  type: string;
  monitor: MonitorForCheck;
  checkedAt: Date;
}

/**
 * Evaluate multi-region probe results and manage incidents accordingly.
 *
 * Incident logic:
 * - 0 failures  → all regions pass → treat as success, recover if currently down
 * - 1 failure   → transient single-region blip → no state change (noise reduction)
 * - ≥2 failures → confirmed outage → create incident on first occurrence
 *
 * Uses evaluateCheckResult() to stay consistent with single-region incident logic.
 * Pre-sets consecutiveFailures to THRESHOLD-1 so evaluateCheckResult fires becameDown
 * immediately on the first confirmed multi-region failure (no extra cycle needed).
 */
export async function processMultiRegionIncidentCheck(
  ctx: MultiRegionCheckContext,
  probeResults: RegionProbeResult[],
  alertQueue: Queue<AlertJob>,
  redis?: Redis,
  escalationQueue?: Queue<EscalationStepJob>
): Promise<void> {
  const { monitorId, monitor, checkedAt } = ctx;
  const service = 'check-worker';
  const failCount = probeResults.filter((r) => !r.success).length;

  if (failCount === 1) {
    // Single-region blip — transient, no state change
    logger.info(
      { service, monitorId, failCount, totalRegions: probeResults.length },
      'Single-region failure — transient, no incident created'
    );
    // Still update lastCheckedAt so the monitor does not appear stale
    try {
      await monitorRepository.updateAfterCheck(monitorId, {
        currentStatus: monitor.currentStatus,
        consecutiveFailures: monitor.consecutiveFailures,
        lastCheckedAt: checkedAt,
      });
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Failed to update lastCheckedAt for transient single-region failure');
    }
    return;
  }

  // ≥2 regions failed → confirmed outage; 0 → all pass
  const isSuccess = failCount === 0;

  // When confirmed down: pre-set prevConsecutive = THRESHOLD-1 so evaluateCheckResult
  // fires becameDown immediately on this cycle rather than requiring a second cycle.
  const prevConsecutive = isSuccess
    ? monitor.consecutiveFailures
    : CONSECUTIVE_FAILURES_THRESHOLD - 1;

  const evaluation = evaluateCheckResult(isSuccess, monitor.currentStatus, prevConsecutive);

  try {
    await monitorRepository.updateAfterCheck(monitorId, {
      currentStatus: evaluation.status,
      consecutiveFailures: evaluation.consecutiveFailures,
      lastCheckedAt: checkedAt,
    });
  } catch (err) {
    logger.error({ service, monitorId, err }, 'Failed to update monitor after multi-region check');
    return;
  }

  if (evaluation.becameDown) {
    try {
      const incident = await incidentRepository.create({
        monitorId,
        teamId: monitor.teamId,
        startedAt: checkedAt,
      });

      await dispatchDownAlert({
        incidentId: incident.id,
        monitorId,
        teamId: monitor.teamId,
        monitorEscalationPolicyId: monitor.escalationPolicyId ?? null,
        alertQueue,
        escalationQueue,
      });

      logger.info(
        { service, monitorId, incidentId: incident.id, failCount, totalRegions: probeResults.length },
        'Multi-region incident created, alert enqueued'
      );
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Failed to create multi-region incident or enqueue alert');
    }
  }

  if (evaluation.becameUp) {
    try {
      const openIncident = await incidentRepository.findOpenByMonitorId(monitorId);
      if (openIncident) {
        const resolved = await incidentRepository.resolve(openIncident.id, {
          resolvedAt: checkedAt,
          resolutionType: 'automatic',
        });
        const durationMs =
          resolved.resolvedAt && resolved.startedAt
            ? resolved.resolvedAt.getTime() - resolved.startedAt.getTime()
            : undefined;
        await alertQueue.add(
          `alert:up:${monitorId}`,
          {
            incidentId: resolved.id,
            monitorId,
            teamId: monitor.teamId,
            type: 'up',
            durationMs,
          },
          { jobId: `alert-up-${resolved.id}` }
        );
        logger.info(
          { service, monitorId, incidentId: resolved.id, durationMs },
          'Multi-region recovery, incident resolved and alert enqueued'
        );
      } else {
        logger.warn({ service, monitorId }, 'Multi-region recovery: no open incident found');
      }
    } catch (err) {
      logger.error({ service, monitorId, err }, 'Failed to resolve multi-region incident or enqueue alert');
    }
  }

  // Warm status page cache on any status transition
  if ((evaluation.becameDown || evaluation.becameUp) && redis) {
    try {
      const slugs = await statusPageWorkerRepository.findStatusPageSlugsForMonitor(monitorId);
      for (const slug of slugs) {
        await warmStatusPageCache(slug, { redis });
      }
    } catch (err) {
      logger.warn({ service, monitorId, err }, 'Failed to warm status page cache after multi-region check');
    }
  }
}
