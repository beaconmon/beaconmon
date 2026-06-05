ALTER TABLE "competitors"
    ADD COLUMN "discovery_state" TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN "discovery_synced_at" TIMESTAMP(3),
    ADD COLUMN "discovery_error" TEXT;

-- Backfill existing rows
UPDATE "competitors" SET "discovery_state" = 'ready' WHERE "platform" = 'shopify';
UPDATE "competitors" SET "discovery_state" = 'not_applicable' WHERE "platform" != 'shopify';
