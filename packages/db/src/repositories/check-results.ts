import { prisma } from '../index.js';
import type { CheckResult } from '@beaconmon/types';

export const checkResultRepository = {
  async create(result: CheckResult): Promise<void> {
    await prisma.checkResult.create({
      data: {
        monitorId: result.monitorId,
        checkedAt: result.checkedAt,
        success: result.success,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        errorType: result.errorType,
        errorMessage: result.errorMessage,
      },
    });
  },
};
