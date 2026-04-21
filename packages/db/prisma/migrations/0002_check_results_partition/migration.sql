-- Migration: Replace plain check_results table with a partitioned version.
-- Prisma created a plain table in 0001_init. We drop it and recreate it as
-- a range-partitioned table on checked_at. This is outside what Prisma can
-- model natively — from here on, partition management is done in the scheduler.

-- Drop the plain table created by Prisma's generated migration
DROP TABLE IF EXISTS "check_results";

-- ─── Partitioned parent table ─────────────────────────────────────────────────
CREATE TABLE "check_results" (
    "id"              TEXT        NOT NULL,
    "monitor_id"      TEXT        NOT NULL,
    "checked_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "success"         BOOLEAN     NOT NULL,
    "status_code"     INTEGER,
    "response_time_ms" INTEGER,
    "error_type"      TEXT,
    "error_message"   TEXT,
    CONSTRAINT "check_results_pkey" PRIMARY KEY ("id", "checked_at")
) PARTITION BY RANGE ("checked_at");

-- Foreign key on the partition parent (PG 12+)
ALTER TABLE "check_results"
    ADD CONSTRAINT "check_results_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Dashboard query index (always use this — never scan without time range) ──
CREATE INDEX "check_results_monitor_time" ON "check_results" ("monitor_id", "checked_at" DESC);

-- ─── Seed partitions: current month + 2 forward ───────────────────────────────
-- The scheduler creates new partitions nightly and drops partitions > 365 days old.

CREATE TABLE "check_results_2026_04" PARTITION OF "check_results"
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE "check_results_2026_05" PARTITION OF "check_results"
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE "check_results_2026_06" PARTITION OF "check_results"
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
