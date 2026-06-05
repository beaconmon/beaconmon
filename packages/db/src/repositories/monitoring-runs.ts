import { prisma } from '../index.js';

interface RunInput {
  teamId: string;
  jobType: string;
  jobId: string;
  startedAt: Date;
  finishedAt: Date;
  errorMessage?: string;
}

export const monitoringRunWorkerRepository = {
  async recordSuccess(run: Omit<RunInput, 'errorMessage'>): Promise<void> {
    await prisma.monitoringRun.create({
      data: { ...run, status: 'success' },
    });
  },

  async recordFailure(run: RunInput): Promise<void> {
    await prisma.monitoringRun.create({
      data: { ...run, status: 'failed' },
    });
  },
};
