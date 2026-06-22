-- CreateTable: shopify_installs (one row per Shopify storefront that installs the embedded app)
-- Doubles as the app's SessionStorage backend (shop -> access token) and links a
-- myshopify domain to its provisioned Team. Soft-deleted via uninstalled_at on uninstall.
CREATE TABLE "shopify_installs" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "competitor_intent" JSONB NOT NULL DEFAULT '[]',
    "installed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uninstalled_at" TIMESTAMP(3),

    CONSTRAINT "shopify_installs_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
ALTER TABLE "shopify_installs" ADD CONSTRAINT "shopify_installs_shop_key" UNIQUE ("shop");
ALTER TABLE "shopify_installs" ADD CONSTRAINT "shopify_installs_team_id_key" UNIQUE ("team_id");

-- Foreign keys
ALTER TABLE "shopify_installs" ADD CONSTRAINT "shopify_installs_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
