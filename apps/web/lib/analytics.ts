import posthog from 'posthog-js';
import type { MonitorType, PlanTier } from '@beaconmon/types';

export const analytics = {
  identify(userId: string, props: { plan: PlanTier; teamId: string }) {
    posthog.identify(userId, props);
  },

  reset() {
    posthog.reset();
  },

  monitorCreated(props: { type: MonitorType; intervalSeconds: number }) {
    posthog.capture('monitor_created', props);
  },

  monitorDeleted(props: { type: MonitorType }) {
    posthog.capture('monitor_deleted', props);
  },

  alertChannelCreated(props: { channelType: string }) {
    posthog.capture('alert_channel_created', props);
  },

  statusPageCreated() {
    posthog.capture('status_page_created');
  },

  upgradeClicked(props: { plan: string; source: string }) {
    posthog.capture('upgrade_clicked', props);
  },

  userSignedUp(props: { plan: string | null; method: 'email' | 'social' | 'magic_link' }) {
    posthog.capture('user_signed_up', props);
  },

  userSignedIn(props: { method: 'email' | 'social' | 'magic_link' }) {
    posthog.capture('user_signed_in', props);
  },

  checkoutOpened(props: { plan: 'starter' | 'growth' | 'scale'; billing_period: 'monthly' | 'annual' }) {
    posthog.capture('checkout_opened', props);
  },

  signInFailed(props: { method: 'email' | 'magic_link'; error: string }) {
    posthog.capture('sign_in_failed', props);
  },

  signInSocialAttempted(props: { provider: 'google' | 'github' }) {
    posthog.capture('sign_in_social_attempted', props);
  },

  signUpFailed(props: { method: 'email' | 'magic_link'; error: string }) {
    posthog.capture('sign_up_failed', props);
  },

  signUpSocialAttempted(props: { provider: 'google' | 'github' }) {
    posthog.capture('sign_up_social_attempted', props);
  },

  signUpSocialFailed(props: { provider: 'google' | 'github' }) {
    posthog.capture('sign_up_social_failed', props);
  },

  magicLinkSent(props: { context: 'sign_in' | 'sign_up' }) {
    posthog.capture('magic_link_sent', props);
  },
};
