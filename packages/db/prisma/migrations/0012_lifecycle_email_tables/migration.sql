-- CreateTable: lifecycle_email_sends (dedup tracking for lifecycle emails)
CREATE TABLE "lifecycle_email_sends" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "email_type" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dedup_key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifecycle_email_sends_pkey" PRIMARY KEY ("id")
);

-- CreateTable: email_unsubscribes (per-team per-category unsubscribe tracking)
CREATE TABLE "email_unsubscribes" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unsubscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_unsubscribes_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
ALTER TABLE "lifecycle_email_sends" ADD CONSTRAINT "lifecycle_email_sends_dedup_key_key" UNIQUE ("dedup_key");
ALTER TABLE "email_unsubscribes" ADD CONSTRAINT "email_unsubscribes_team_id_category_key" UNIQUE ("team_id", "category");

-- Foreign keys
ALTER TABLE "lifecycle_email_sends" ADD CONSTRAINT "lifecycle_email_sends_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "email_unsubscribes" ADD CONSTRAINT "email_unsubscribes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "lifecycle_email_sends_team_id_sent_at_idx" ON "lifecycle_email_sends"("team_id", "sent_at" DESC);
