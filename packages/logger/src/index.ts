import pino from 'pino';

export type Logger = pino.Logger;

export function createLogger(service: string): Logger {
  return pino({
    name: service,
    level: process.env['LOG_LEVEL'] ?? 'info',
    ...(process.env['NODE_ENV'] === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
  });
}

// Convenience default — each app/worker should call createLogger with its own name
export const logger = createLogger('beaconmon');
