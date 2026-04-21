export type AlertChannelType = 'email' | 'slack' | 'webhook' | 'sms';

export interface AlertChannel {
  id: string;
  teamId: string;
  name: string;
  type: AlertChannelType;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  teamId: string;
  incidentId: string;
  channelId: string;
  sentAt: Date;
  createdAt: Date;
}
