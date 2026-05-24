# Plan: Scheduler task extraction

## Problem

`apps/workers/scheduler.ts` (~955 lines) contains 9 embedded concerns inline alongside the core `scheduleChecks` function. Each concern is 20-80 lines of async logic with no interface separating it from the others. Adding or changing one concern requires reading and reasoning about the whole file.

## Goal

Extract each housekeeping concern behind a `SchedulerTask` interface so `scheduler.ts` becomes a registry loop (~80 lines) plus the `scheduleChecks` direct call. Each concern lives in its own file, independently readable and testable.

---

## Interface

```typescript
interface SchedulerTask {
  name: string;
  runIntervalMs: number;
  runOnStartup: boolean;
  run(): Promise<void>;
}
```

- Tasks with time-of-day or Redis dedup guards keep that logic inside `run()` and return early when conditions are not met.
- No `shouldRun()` method on the interface. The registry tracks `lastRun` per task via a `Map<string, number>`.

---

## File layout

```
apps/workers/
  scheduler.ts                          # ~80 lines after refactor
  tasks/
    index.ts                            # exports: const tasks: SchedulerTask[]
    partition-purge.ts
    retention-cleanup.ts
    content-snapshot-retention.ts
    deploy-expiry.ts
    uptime-compute.ts
    slo-burn.ts
    intelligence-digest.ts
    past-due-downgrade.ts
    trial-reminders.ts
```

---

## Task registry

| File | `name` | `runIntervalMs` | `runOnStartup` |
|---|---|---|---|
| `partition-purge.ts` | `partition-purge` | 24h | true |
| `retention-cleanup.ts` | `retention-cleanup` | 24h | true |
| `content-snapshot-retention.ts` | `content-snapshot-retention` | 24h | true |
| `deploy-expiry.ts` | `deploy-expiry` | 5m | true |
| `uptime-compute.ts` | `uptime-compute` | 5m | true |
| `slo-burn.ts` | `slo-burn` | 1m | false |
| `intelligence-digest.ts` | `intelligence-digest` | 60s | false |
| `past-due-downgrade.ts` | `past-due-downgrade` | 24h | true |
| `trial-reminders.ts` | `trial-reminders` | 24h | true |

---

## Dependencies

Each task file imports singletons directly, consistent with how workers already work:

```typescript
import { prisma } from '@beaconmon/db';
import { logger } from '../lib/logger.js';
import { connection } from '../lib/redis.js'; // shared module
```

No factory functions or context threading.

---

## Registry loop shape

```typescript
const lastRun = new Map<string, number>();

// Startup: run flagged tasks sequentially, then start the interval
for (const task of tasks.filter(t => t.runOnStartup)) {
  await task.run();
  lastRun.set(task.name, Date.now());
}

setInterval(() => {
  if (!running) return;

  void scheduleChecks(); // always, every tick — owns Sentry check-in + heartbeat

  for (const task of tasks) {
    if (Date.now() - (lastRun.get(task.name) ?? 0) >= task.runIntervalMs) {
      lastRun.set(task.name, Date.now());
      void task.run().catch((err) => {
        logger.error({ service: 'scheduler', task: task.name, err }, 'Unhandled task error');
        Sentry.captureException(err);
      });
    }
  }
}, 10_000);

await scheduleChecks(); // run immediately after startup tasks
lastRun.set('uptime-compute', Date.now()); // prevent double-run of 5-min tasks
```

---

## Error handling

Two layers:

1. **Task-level `try/catch`** (kept): each task wraps its body in try/catch with context-rich logging (`teamId`, `monitorId`, etc.) and `Sentry.captureException`.
2. **Registry-level `.catch()`** (new): safety net for any unhandled rejection that escapes the task's own catch. Logs task name and captures to Sentry.

---

## `scheduleChecks` stays a direct call

`scheduleChecks` is not a registered task. It runs unconditionally on every tick and owns:
- The Sentry cron check-in (`in_progress` / `ok` / `error`) that wraps the full tick
- The `scheduler:last_run` Redis key read by `/api/health`
- The heartbeat key (`worker:heartbeat:scheduler`)

Making it a task would require leaking those meta-concerns into the task interface or the registry. It stays as a direct call.

---

## Behavior changes (intentional)

- **`evaluateSloBurnRates` first run:** currently fires within 10s of startup (because `lastSloBurnCheck = 0`). With `runOnStartup: false` and `runIntervalMs: 60s`, first run is at 60s after startup. Acceptable.
- **`expireStaleDeployEvents` redundant daily call removed:** it appeared in both the 5-minute block and the 24-hour retention block. The daily call was unintentional. Dropping it. The 5-minute task is already a tighter safety net.

---

## Build sequence

1. Create `apps/workers/tasks/` directory and `types.ts` with the `SchedulerTask` interface.
2. Extract each function into its own task file, one at a time, in this order (daily tasks first since they are simplest):
   - `partition-purge.ts`
   - `retention-cleanup.ts`
   - `content-snapshot-retention.ts`
   - `past-due-downgrade.ts`
   - `trial-reminders.ts`
   - `deploy-expiry.ts`
   - `uptime-compute.ts`
   - `slo-burn.ts`
   - `intelligence-digest.ts`
3. Create `tasks/index.ts` barrel exporting `tasks: SchedulerTask[]`.
4. Rewrite `scheduler.ts` to use the registry loop. Remove all extracted functions and their `lastX` timestamp variables and interval constants.
5. Typecheck: `pnpm --filter @beaconmon/workers typecheck` (or equivalent).
6. Smoke test: `pnpm smoke-test`.
