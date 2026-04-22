import type { AlertPayload, ChannelSender } from './types.js';
import { env } from '../env.js';

export const smsSender: ChannelSender = async (_config: unknown, _payload: AlertPayload) => {
  if (!env.FEATURE_SMS_ALERTS) {
    throw new Error('SMS alerts are not enabled. Set FEATURE_SMS_ALERTS=true to enable.');
  }

  // Twilio integration is tier 2 (Business plan only) — not yet implemented.
  throw new Error('SMS alerts not yet implemented');
};
