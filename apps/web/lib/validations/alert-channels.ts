import { z } from 'zod';

const emailChannelSchema = z.object({
  type: z.literal('email'),
  name: z.string().min(1).max(100),
  config: z.object({
    address: z.string().email(),
  }),
});

const slackChannelSchema = z.object({
  type: z.literal('slack'),
  name: z.string().min(1).max(100),
  config: z.object({
    webhookUrl: z.string().url(),
  }),
});

const webhookChannelSchema = z.object({
  type: z.literal('webhook'),
  name: z.string().min(1).max(100),
  config: z.object({
    url: z.string().url(),
  }),
});

export const createAlertChannelSchema = z.discriminatedUnion('type', [
  emailChannelSchema,
  slackChannelSchema,
  webhookChannelSchema,
]);

export type CreateAlertChannelInput = z.infer<typeof createAlertChannelSchema>;
