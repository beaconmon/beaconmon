-- Add FK constraints to performance_alerts if not already present.
-- The original CREATE TABLE in 20260428200000 already included these on some
-- database instances, so guard with existence checks to keep deploy idempotent.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'performance_alerts_team_id_fkey'
  ) THEN
    ALTER TABLE "performance_alerts" ADD CONSTRAINT "performance_alerts_team_id_fkey"
      FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'performance_alerts_monitor_id_fkey'
  ) THEN
    ALTER TABLE "performance_alerts" ADD CONSTRAINT "performance_alerts_monitor_id_fkey"
      FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
