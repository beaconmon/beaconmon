-- Add a generic settings JSON column to shopify_installs for per-install
-- preferences that do not warrant dedicated columns (e.g. avgHourlyRevenue).
ALTER TABLE "shopify_installs" ADD COLUMN "settings" JSONB NOT NULL DEFAULT '{}';
