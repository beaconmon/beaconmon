-- AddColumn: anomaly_detection_enabled on monitors
ALTER TABLE "monitors" ADD COLUMN IF NOT EXISTS "anomaly_detection_enabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: performance_alerts (table may already exist from earlier migration)
CREATE TABLE IF NOT EXISTS "performance_alerts" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL,
    "response_time_ms" INTEGER NOT NULL,
    "mean_ms" DOUBLE PRECISION NOT NULL,
    "std_dev_ms" DOUBLE PRECISION NOT NULL,
    "z_score" DOUBLE PRECISION NOT NULL,
    "notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "performance_alerts_monitor_id_checked_at_idx" ON "performance_alerts"("monitor_id", "checked_at" DESC);
