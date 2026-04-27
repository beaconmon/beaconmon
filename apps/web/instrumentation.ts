import { logger } from '@/lib/logger';

export async function register() {
  if (process.env['NEXT_RUNTIME'] === 'nodejs') {
    try {
      const { seedCustomDomains } = await import('./lib/seed-custom-domains');
      await seedCustomDomains();
    } catch (err) {
      logger.error({ service: 'instrumentation', err }, 'Failed to seed custom domains');
    }
  }
}
