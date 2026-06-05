ALTER TABLE "competitor_events"
    ADD COLUMN "significance" TEXT;

CREATE INDEX "competitor_events_team_id_significance_detected_at_idx"
    ON "competitor_events" ("team_id", "significance", "detected_at" DESC);
