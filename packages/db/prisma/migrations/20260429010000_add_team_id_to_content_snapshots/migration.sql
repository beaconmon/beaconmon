-- Add team_id to content_snapshots for direct tenant isolation
ALTER TABLE "content_snapshots"
  ADD COLUMN IF NOT EXISTS "team_id" TEXT;

-- Backfill from the parent monitor
UPDATE "content_snapshots" cs
  SET "team_id" = m."team_id"
  FROM "monitors" m
  WHERE cs."monitor_id" = m."id";

ALTER TABLE "content_snapshots"
  ALTER COLUMN "team_id" SET NOT NULL;

ALTER TABLE "content_snapshots"
  ADD CONSTRAINT "content_snapshots_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;
