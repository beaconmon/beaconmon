-- AlterTable: competitor_products gains source tracking and a generalized external id.
-- RENAME (not drop/add) preserves existing rows.
ALTER TABLE "competitor_products" RENAME COLUMN "shopify_product_id" TO "external_id";
ALTER TABLE "competitor_products" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'shopify_feed';
ALTER TABLE "competitor_products" ADD COLUMN "source_url" TEXT;

-- Replace the unique key (competitor_id, shopify_product_id) with (competitor_id, source, external_id)
DROP INDEX "competitor_products_competitor_id_shopify_product_id_key";
CREATE UNIQUE INDEX "competitor_products_competitor_id_source_external_id_key" ON "competitor_products"("competitor_id", "source", "external_id");

-- AlterTable: competitors gain data tier, sitemap url, and tracked product urls
ALTER TABLE "competitors" ADD COLUMN "data_tier" TEXT NOT NULL DEFAULT 'limited';
ALTER TABLE "competitors" ADD COLUMN "sitemap_url" TEXT;
ALTER TABLE "competitors" ADD COLUMN "tracked_product_urls" JSONB NOT NULL DEFAULT '[]';

-- Backfill: existing Shopify competitors are full catalog
UPDATE "competitors" SET "data_tier" = 'full_catalog' WHERE "platform" = 'shopify';
