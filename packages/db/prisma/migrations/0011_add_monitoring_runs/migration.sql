-- CreateTable: monitoring_runs (worker reliability tracking)
CREATE TABLE "monitoring_runs" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "job_type" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3) NOT NULL,
    "error_message" TEXT,

    CONSTRAINT "monitoring_runs_pkey" PRIMARY KEY ("id")
);

-- Foreign key
ALTER TABLE "monitoring_runs" ADD CONSTRAINT "monitoring_runs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "monitoring_runs_team_id_finished_at_idx" ON "monitoring_runs"("team_id", "finished_at" DESC);
CREATE INDEX "monitoring_runs_finished_at_idx" ON "monitoring_runs"("finished_at");
