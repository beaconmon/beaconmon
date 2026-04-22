import { describe, it, expect } from 'vitest';
import { createAlertChannelSchema } from './alert-channels';

describe('createAlertChannelSchema', () => {
  it('accepts a valid email channel', () => {
    const result = createAlertChannelSchema.safeParse({
      type: 'email',
      name: 'Team Email',
      config: { address: 'alerts@example.com' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid slack channel', () => {
    const result = createAlertChannelSchema.safeParse({
      type: 'slack',
      name: 'Slack Alerts',
      config: { webhookUrl: 'https://hooks.slack.com/services/T000/B000/xxxx' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid webhook channel', () => {
    const result = createAlertChannelSchema.safeParse({
      type: 'webhook',
      name: 'My Webhook',
      config: { url: 'https://example.com/hook' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid type', () => {
    expect(
      createAlertChannelSchema.safeParse({
        type: 'sms',
        name: 'SMS',
        config: { number: '+1234567890' },
      }).success
    ).toBe(false);
  });

  it('rejects invalid email address in email channel', () => {
    expect(
      createAlertChannelSchema.safeParse({
        type: 'email',
        name: 'Bad Email',
        config: { address: 'not-an-email' },
      }).success
    ).toBe(false);
  });

  it('rejects invalid URL in slack channel', () => {
    expect(
      createAlertChannelSchema.safeParse({
        type: 'slack',
        name: 'Bad Slack',
        config: { webhookUrl: 'not-a-url' },
      }).success
    ).toBe(false);
  });

  it('rejects invalid URL in webhook channel', () => {
    expect(
      createAlertChannelSchema.safeParse({
        type: 'webhook',
        name: 'Bad Webhook',
        config: { url: 'not-a-url' },
      }).success
    ).toBe(false);
  });

  it('rejects email channel with missing config.address', () => {
    expect(
      createAlertChannelSchema.safeParse({
        type: 'email',
        name: 'Missing Config',
        config: {},
      }).success
    ).toBe(false);
  });

  it('rejects empty name', () => {
    expect(
      createAlertChannelSchema.safeParse({
        type: 'email',
        name: '',
        config: { address: 'ok@example.com' },
      }).success
    ).toBe(false);
  });
});
