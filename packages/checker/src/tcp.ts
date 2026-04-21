import * as net from 'node:net';
import type { CheckResult } from '@beaconmon/types';
import type { CheckInput } from './types.js';
import { classifyError } from './errors.js';

export async function runTcpCheck(job: CheckInput): Promise<CheckResult> {
  const checkedAt = new Date();
  const startedAt = Date.now();

  const port: number = job.port ?? 80;

  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(job.timeoutMs);

    socket.connect(port, new URL(job.url).hostname, () => {
      const responseTimeMs = Date.now() - startedAt;
      socket.destroy();
      resolve({
        monitorId: job.monitorId,
        checkedAt,
        success: true,
        statusCode: null,
        responseTimeMs,
        errorType: null,
        errorMessage: null,
        type: job.type,
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        monitorId: job.monitorId,
        checkedAt,
        success: false,
        statusCode: null,
        responseTimeMs: Date.now() - startedAt,
        errorType: 'timeout',
        errorMessage: `TCP connection timed out after ${job.timeoutMs}ms`,
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
