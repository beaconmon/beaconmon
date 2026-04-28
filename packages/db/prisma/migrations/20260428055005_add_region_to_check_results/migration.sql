-- AlterTable: add region column to check_results
-- region is nullable; NULL = Railway-only check (SSL/TCP/domain)
-- ALTER TABLE on the partitioned parent propagates to all child partitions automatically in PostgreSQL.
ALTER TABLE "check_results" ADD COLUMN "region" TEXT;

-- Partial index for efficient per-region queries on the dashboard (Phase 2)
CREATE INDEX "check_results_monitor_region_time"
  ON "check_results" ("monitor_id", "region", "checked_at" DESC)
  WHERE "region" IS NOT NULL;
