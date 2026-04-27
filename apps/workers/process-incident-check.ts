import { logger } from './lib/logger.js';
import {
  monitorRepository,
  incidentRepository,
  statusPageWorkerRepository,
} from '@beaconmon/db';
import { evaluateCheckResult } from '@beaconmon/checker';
import { warmStatusPageCache } from '@beaconmon/status-pages';
import type { Queue } from 'bullmq';
import type { AlertJob } from '@beaconmon/queue';
import type { Redis } from 'ioredis';
import type { CheckContext } from './process-expiry-check.js';

export async function processIncidentCheck(
  ctx: CheckContext,
  alertQueue: Queue<AlertJob>,
  redis?: Redis
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
      await alertQueue.add(
        `alert:down:${monitorId}`,
        {
          incidentId: incident.id,
          monitorId,
          teamId: monitor.teamId,
          type: 'down',
        },
        { jobId: `alert:down:${incident.id}` }
      );
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
          { jobId: `alert:up:${resolved.id}` }
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
