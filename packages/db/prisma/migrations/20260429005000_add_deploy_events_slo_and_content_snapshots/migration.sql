-- Add deploy_events, content_snapshots, and SLO columns on monitors.
--
-- These were introduced in PR #15 (deploy-aware monitoring, SLO tracking,
-- content snapshots) in `schema.prisma` but the corresponding CREATE TABLE
-- migration was never generated. Adding here so the follow-on migration
-- (20260429010000_add_team_id_to_content_snapshots) has a table to alter.

-- AlterTable monitors: add SLO / error budget columns
ALTER TABLE "monitors"
  ADD COLUMN "slo_target" DECIMAL(6,4),
  ADD COLUMN "slo_window_days" INTEGER,
  ADD COLUMN "slo_burn_rate_fast_threshold" DOUBLE PRECISION,
  ADD COLUMN "slo_burn_rate_slow_threshold" DOUBLE PRECISION;

-- CreateTable: deploy_events
CREATE TABLE "deploy_events" (
    "id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ended_at" TIMESTAMPTZ,
    "commit_sha" TEXT,
    "description" TEXT,
    "suppress_alerts" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "deploy_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "deploy_events_monitor_id_started_at_idx"
  ON "deploy_events" ("monitor_id", "started_at" DESC);

ALTER TABLE "deploy_events"
  ADD CONSTRAINT "deploy_events_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "deploy_events"
  ADD CONSTRAINT "deploy_events_monitor_id_fkey"
  FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: content_snapshots
-- Note: team_id is intentionally NOT added here. The next migration
-- (20260429010000_add_team_id_to_content_snapshots) adds it, backfills,
-- and locks it to NOT NULL. Keeping the migrations split preserves the
-- original intent — no need to rewrite history.
CREATE TABLE "content_snapshots" (
    "id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "captured_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "diff_summary" TEXT,

    CONSTRAINT "content_snapshots_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_snapshots_monitor_id_captured_at_idx"
  ON "content_snapshots" ("monitor_id", "captured_at" DESC);

ALTER TABLE "content_snapshots"
  ADD CONSTRAINT "content_snapshots_monitor_id_fkey"
  FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
