-- Remove old competitor flags from monitors
ALTER TABLE "monitors" DROP COLUMN IF EXISTS "instant_alerts";
ALTER TABLE "monitors" DROP COLUMN IF EXISTS "is_competitor";

-- Make monitor_id nullable and add competitor_page_id on content_snapshots
ALTER TABLE "content_snapshots" ALTER COLUMN "monitor_id" DROP NOT NULL;
ALTER TABLE "content_snapshots" ADD COLUMN IF NOT EXISTS "competitor_page_id" TEXT;

-- CreateTable competitors
CREATE TABLE "competitors" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable competitor_pages
CREATE TABLE "competitor_pages" (
    "id" TEXT NOT NULL,
    "competitor_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "selector" TEXT,
    "interval_seconds" INTEGER NOT NULL DEFAULT 3600,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_snapshot_hash" TEXT,
    "last_checked_at" TIMESTAMP(3),
    "next_check_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable competitor_products
CREATE TABLE "competitor_products" (
    "id" TEXT NOT NULL,
    "competitor_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "shopify_product_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "sku" TEXT,
    "gtin" TEXT,
    "vendor" TEXT,
    "product_type" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "variants" JSONB NOT NULL DEFAULT '[]',
    "current_price" DECIMAL(10,2),
    "compare_at_price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable competitor_events
CREATE TABLE "competitor_events" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "competitor_id" TEXT NOT NULL,
    "product_id" TEXT,
    "page_id" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "detected_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitor_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable competitor_decisions
CREATE TABLE "competitor_decisions" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "note" TEXT,
    "decided_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable competitor_notification_channels
CREATE TABLE "competitor_notification_channels" (
    "id" TEXT NOT NULL,
    "competitor_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "competitor_notification_channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competitor_products_competitor_id_shopify_product_id_key" ON "competitor_products"("competitor_id", "shopify_product_id");

-- CreateIndex
CREATE INDEX "competitor_events_team_id_detected_at_idx" ON "competitor_events"("team_id", "detected_at" DESC);

-- CreateIndex
CREATE INDEX "competitor_events_competitor_id_detected_at_idx" ON "competitor_events"("competitor_id", "detected_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "competitor_decisions_event_id_key" ON "competitor_decisions"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "competitor_notification_channels_competitor_id_channel_id_key" ON "competitor_notification_channels"("competitor_id", "channel_id");

-- CreateIndex
CREATE INDEX "content_snapshots_competitor_page_id_captured_at_idx" ON "content_snapshots"("competitor_page_id", "captured_at" DESC);

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_pages" ADD CONSTRAINT "competitor_pages_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_products" ADD CONSTRAINT "competitor_products_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_events" ADD CONSTRAINT "competitor_events_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_events" ADD CONSTRAINT "competitor_events_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "competitor_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_decisions" ADD CONSTRAINT "competitor_decisions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "competitor_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_notification_channels" ADD CONSTRAINT "competitor_notification_channels_competitor_id_fkey" FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_notification_channels" ADD CONSTRAINT "competitor_notification_channels_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "alert_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_snapshots" ADD CONSTRAINT "content_snapshots_competitor_page_id_fkey" FOREIGN KEY ("competitor_page_id") REFERENCES "competitor_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
