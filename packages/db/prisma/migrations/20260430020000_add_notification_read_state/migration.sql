-- Notification feed read state (M3.1).
--
-- Tracks the last time each (team, user) viewed the in-app notification panel.
-- The unread badge count is computed as: events newer than last_seen_at across
-- the aggregated feed (incidents, expiry alerts, deploy events, snapshot
-- changes). One row per (team, user) — upserted on read.

CREATE TABLE "notification_read_state" (
  "id" TEXT NOT NULL,
  "team_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "last_seen_at" TIMESTAMP(3) NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notification_read_state_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "notification_read_state_team_id_user_id_key"
  ON "notification_read_state"("team_id", "user_id");

ALTER TABLE "notification_read_state"
  ADD CONSTRAINT "notification_read_state_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notification_read_state"
  ADD CONSTRAINT "notification_read_state_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
