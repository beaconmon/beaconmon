-- Chrome extension auth surface.
--   1. owner_email on shopify_installs: lets the extension adopt an existing
--      Shopify-provisioned team when the same owner signs in via magic-link.
--   2. extension_tokens: long-lived, revocable bearer tokens (hash only) issued
--      to an extension install after sign-in; resolve to one user + one team.

ALTER TABLE "shopify_installs" ADD COLUMN "owner_email" TEXT;

CREATE TABLE "extension_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "last_used_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extension_tokens_pkey" PRIMARY KEY ("id")
);

-- The hash is the lookup key on every authenticated request, so it must be unique.
ALTER TABLE "extension_tokens" ADD CONSTRAINT "extension_tokens_token_hash_key" UNIQUE ("token_hash");

CREATE INDEX "extension_tokens_user_id_idx" ON "extension_tokens"("user_id");
CREATE INDEX "extension_tokens_team_id_idx" ON "extension_tokens"("team_id");

ALTER TABLE "extension_tokens" ADD CONSTRAINT "extension_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "extension_tokens" ADD CONSTRAINT "extension_tokens_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
