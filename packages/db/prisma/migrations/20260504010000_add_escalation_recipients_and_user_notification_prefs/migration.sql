-- Multi-recipient escalation steps + per-user notification preferences.
--   * AlertChannel.user_id → personal channels (e.g. a user's own email)
--   * escalation_step_recipients → join table replacing the single
--     escalation_steps.channel_id field; supports both direct channel and
--     user-target recipients per step
--   * user_notification_preferences → each (user, team) picks a primary
--     personal channel; null = fall back to account email at send time

-- ─── alert_channels: add personal-channel ownership ──────────────────────────
ALTER TABLE "alert_channels"
  ADD COLUMN IF NOT EXISTS "user_id" TEXT;

ALTER TABLE "alert_channels"
  ADD CONSTRAINT "alert_channels_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "alert_channels_team_id_user_id_idx"
  ON "alert_channels" ("team_id", "user_id");

-- ─── escalation_step_recipients ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "escalation_step_recipients" (
  "id" TEXT PRIMARY KEY,
  "step_id" TEXT NOT NULL,
  "channel_id" TEXT,
  "user_id" TEXT,
  "removed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "escalation_step_recipients_step_id_fkey"
    FOREIGN KEY ("step_id") REFERENCES "escalation_steps"("id") ON DELETE CASCADE,
  CONSTRAINT "escalation_step_recipients_channel_id_fkey"
    FOREIGN KEY ("channel_id") REFERENCES "alert_channels"("id") ON DELETE CASCADE,
  CONSTRAINT "escalation_step_recipients_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "escalation_step_recipients_target_check"
    CHECK (
      ("channel_id" IS NOT NULL AND "user_id" IS NULL)
      OR ("channel_id" IS NULL AND "user_id" IS NOT NULL)
      OR ("channel_id" IS NULL AND "user_id" IS NULL AND "removed_at" IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS "escalation_step_recipients_step_id_idx"
  ON "escalation_step_recipients" ("step_id");
CREATE INDEX IF NOT EXISTS "escalation_step_recipients_user_id_idx"
  ON "escalation_step_recipients" ("user_id");

-- Backfill: every existing step has exactly one channel — promote it to a row
-- in the new join table so the worker keeps firing for in-flight policies.
INSERT INTO "escalation_step_recipients" ("id", "step_id", "channel_id", "created_at")
SELECT
  'cl' || substr(md5(random()::text || clock_timestamp()::text), 1, 23),
  s."id",
  s."channel_id",
  CURRENT_TIMESTAMP
FROM "escalation_steps" s
WHERE s."channel_id" IS NOT NULL;

-- Drop the legacy single-channel field.
ALTER TABLE "escalation_steps"
  DROP CONSTRAINT IF EXISTS "escalation_steps_channel_id_fkey";
ALTER TABLE "escalation_steps"
  DROP COLUMN IF EXISTS "channel_id";

-- ─── user_notification_preferences ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "team_id" TEXT NOT NULL,
  "primary_channel_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_notification_prefs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "user_notification_prefs_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE,
  CONSTRAINT "user_notification_prefs_primary_channel_id_fkey"
    FOREIGN KEY ("primary_channel_id") REFERENCES "alert_channels"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_notification_prefs_user_id_team_id_key"
  ON "user_notification_preferences" ("user_id", "team_id");
