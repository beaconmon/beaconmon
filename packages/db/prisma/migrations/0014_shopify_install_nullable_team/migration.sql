-- Allow shopify_installs rows to exist before their Team is provisioned.
-- storeSession() persists the offline access token (shop + token) during the
-- OAuth/token-exchange flow, which runs BEFORE the afterAuth provisioning hook
-- creates the Team and backfills team_id. The unique constraint and FK remain
-- valid for a nullable column (Postgres permits multiple NULLs in a UNIQUE).
ALTER TABLE "shopify_installs" ALTER COLUMN "team_id" DROP NOT NULL;
