-- Add FK constraints to performance_alerts (omitted from the original CREATE TABLE)
ALTER TABLE "performance_alerts" ADD CONSTRAINT "performance_alerts_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "performance_alerts" ADD CONSTRAINT "performance_alerts_monitor_id_fkey"
  FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
