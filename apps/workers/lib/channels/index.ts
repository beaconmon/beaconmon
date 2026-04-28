import { emailSender } from './email.js';
import { slackSender } from './slack.js';
import { webhookSender } from './webhook.js';
import { smsSender } from './sms.js';
import { discordSender } from './discord.js';
import type { ChannelSender } from './types.js';

export function getChannelSender(type: string): ChannelSender {
  switch (type) {
    case 'email':
      return emailSender;
    case 'slack':
      return slackSender;
    case 'webhook':
      return webhookSender;
    case 'sms':
      return smsSender;
    case 'discord':
      return discordSender;
    default:
      throw new Error(`Unknown alert channel type: ${type}`);
  }
}

export { emailSender, slackSender, webhookSender, smsSender, discordSender };
export type { ChannelSender, AlertPayload } from './types.js';
