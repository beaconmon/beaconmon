-- Alert idempotency hardening (M1.1).
--
-- Replaces the "check-then-insert" dedup that races under concurrent retries
-- with a unique-constraint backed claim-then-send pattern.
--
-- Schema additions:
--   * notifications.kind ('down' | 'up') — recovery alerts must not collide with
--     the originating downtime alert in the same 5-min bucket.
--   * notifications.sent_window_bucket — app-computed floor(sent_at, 5min).
--   * notifications.sent_at becomes nullable: NULL = claimed-but-not-yet-sent,
--     non-NULL = delivered. Default removed (worker must compute explicitly).
--
-- The new unique index (incident_id, channel_id, kind, sent_window_bucket)
-- is what actually prevents double-sends under concurrent execution.

-- 1. Enum type for notification kind
CREATE TYPE "NotificationKind" AS ENUM ('down', 'up');

-- 2. Add new columns (kind has a default for backfill, bucket is nullable until backfilled)
ALTER TABLE "notifications"
  ADD COLUMN "kind" "NotificationKind" NOT NULL DEFAULT 'down',
  ADD COLUMN "sent_window_bucket" TIMESTAMP(3);

-- 3. Backfill sent_window_bucket = floor(sent_at to nearest 5 minutes).
--    Uses date_trunc('hour', x) + a 5-minute snap of the minutes component.
UPDATE "notifications"
   SET "sent_window_bucket" =
     date_trunc('hour', "sent_at")
       + (FLOOR(EXTRACT(MINUTE FROM "sent_at")::int / 5.0) * 5) * interval '1 minute';

-- 4. Lock down sent_window_bucket
ALTER TABLE "notifications"
  ALTER COLUMN "sent_window_bucket" SET NOT NULL;

-- 5. sent_at becomes nullable (claim-then-send semantics)
ALTER TABLE "notifications"
  ALTER COLUMN "sent_at" DROP DEFAULT,
  ALTER COLUMN "sent_at" DROP NOT NULL;

-- 6. The unique constraint that actually prevents double-sends under concurrency
CREATE UNIQUE INDEX "notifications_idem_unique"
  ON "notifications" ("incident_id", "channel_id", "kind", "sent_window_bucket");
