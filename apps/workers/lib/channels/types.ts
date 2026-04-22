export interface AlertPayload {
  monitor: {
    id: string;
    name: string;
    url: string;
  };
  incident: {
    id: string;
    startedAt: Date;
  };
  type: 'down' | 'up';
  durationMs?: number;
}

export type ChannelSender = (config: unknown, payload: AlertPayload) => Promise<void>;
