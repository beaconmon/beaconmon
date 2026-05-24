-- Drop the unique constraint on (monitor_id, content_hash) which prevented
-- detecting content reversions (A -> B -> A). Concurrent worker dedup is now
-- handled by a short-TTL Redis SET NX in the content worker instead.
-- Column additions are guarded with IF NOT EXISTS for environments where they
-- were applied manually outside of a prior migration.
ALTER TABLE "content_snapshots" ADD COLUMN IF NOT EXISTS "content_hash" TEXT;
ALTER TABLE "content_snapshots" ADD COLUMN IF NOT EXISTS "ai_confidence" DOUBLE PRECISION;
DROP INDEX IF EXISTS "content_snapshots_monitor_id_content_hash_key";
