import { Redis } from 'ioredis';
import { env } from './env.js';
import {
  createCheckQueue,
  createContentCheckQueue,
  createSloBurnQueue,
  createIntelligenceDigestQueue,
} from '@beaconmon/queue';

export const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
export const checkQueue = createCheckQueue(connection);
export const contentQueue = createContentCheckQueue(connection);
export const sloBurnQueue = createSloBurnQueue(connection);
export const intelligenceDigestQueue = createIntelligenceDigestQueue(connection);
