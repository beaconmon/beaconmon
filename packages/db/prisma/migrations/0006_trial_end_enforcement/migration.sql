ALTER TABLE "monitors" ADD COLUMN "is_competitor" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "monitors" ADD COLUMN "paused_reason" TEXT;
ALTER TABLE "monitors" ADD COLUMN "paused_at" TIMESTAMP(3);
ALTER TABLE "teams" ADD COLUMN "trial_end_processed_at" TIMESTAMP(3);

CREATE INDEX "monitors_paused_reason_idx" ON "monitors"("paused_reason") WHERE "paused_reason" IS NOT NULL;
