import { z } from 'zod';

export const emailChannelConfigSchema = z.object({
  recipients: z.array(z.string().email()).min(1),
});

export const slackChannelConfigSchema = z.object({
  webhookUrl: z.string().url(),
});

export const webhookChannelConfigSchema = z.object({
  url: z.string().url(),
  secret: z.string().optional(),
});

const emailChannelSchema = z.object({
  type: z.literal('email'),
  name: z.string().min(1).max(100),
  config: emailChannelConfigSchema,
});

const slackChannelSchema = z.object({
  type: z.literal('slack'),
  name: z.string().min(1).max(100),
  config: slackChannelConfigSchema,
});

const webhookChannelSchema = z.object({
  type: z.literal('webhook'),
  name: z.string().min(1).max(100),
  config: webhookChannelConfigSchema,
});

export const createAlertChannelSchema = z.discriminatedUnion('type', [
  emailChannelSchema,
  slackChannelSchema,
  webhookChannelSchema,
]);

export type EmailChannelConfig = z.infer<typeof emailChannelConfigSchema>;
export type SlackChannelConfig = z.infer<typeof slackChannelConfigSchema>;
export type WebhookChannelConfig = z.infer<typeof webhookChannelConfigSchema>;
export type CreateAlertChannelInput = z.infer<typeof createAlertChannelSchema>;
