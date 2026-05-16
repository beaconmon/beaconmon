-- AddColumn: instant_alerts on monitors
ALTER TABLE "monitors" ADD COLUMN "instant_alerts" BOOLEAN NOT NULL DEFAULT false;
