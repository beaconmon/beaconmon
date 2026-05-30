-- AlterEnum: add discord alert channel type
ALTER TYPE "AlertChannelType" ADD VALUE 'discord';

-- AlterEnum: add heartbeat monitor type
ALTER TYPE "MonitorType" ADD VALUE 'heartbeat';

-- AlterTable monitors: add last_heartbeat_at for heartbeat monitors
ALTER TABLE "monitors" ADD COLUMN "last_heartbeat_at" TIMESTAMPTZ;

-- AlterTable check_results: flag results that occurred during a maintenance window
-- Adding to the partition parent propagates to all child partitions automatically.
ALTER TABLE "check_results" ADD COLUMN "maintenance" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: maintenance_windows
CREATE TABLE "maintenance_windows" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT "maintenance_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable: maintenance_window_monitors (empty rows = applies to all team monitors)
CREATE TABLE "maintenance_window_monitors" (
    "id" TEXT NOT NULL,
    "window_id" TEXT NOT NULL,
    "monitor_id" TEXT NOT NULL,

    CONSTRAINT "maintenance_window_monitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "maintenance_windows_team_id_ends_at_idx" ON "maintenance_windows"("team_id", "ends_at" DESC);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "maintenance_window_monitors_window_id_monitor_id_key" ON "maintenance_window_monitors"("window_id", "monitor_id");

-- AddForeignKey
ALTER TABLE "maintenance_windows" ADD CONSTRAINT "maintenance_windows_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_window_monitors" ADD CONSTRAINT "maintenance_window_monitors_window_id_fkey" FOREIGN KEY ("window_id") REFERENCES "maintenance_windows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_window_monitors" ADD CONSTRAINT "maintenance_window_monitors_monitor_id_fkey" FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
