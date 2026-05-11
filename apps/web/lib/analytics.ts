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
};
