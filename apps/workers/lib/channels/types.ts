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
  type: 'down' | 'up' | 'slow';
  durationMs?: number; // ms duration for 'up' (recovery); response time ms for 'slow' (anomaly)
  note?: string; // contextual note appended to alert body (e.g. Shopify outage correlation)
}

export type ChannelSender = (config: unknown, payload: AlertPayload) => Promise<void>;
