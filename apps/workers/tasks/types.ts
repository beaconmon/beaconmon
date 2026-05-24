export interface SchedulerTask {
  name: string;
  runIntervalMs: number;
  runOnStartup: boolean;
  run(): Promise<void>;
}
