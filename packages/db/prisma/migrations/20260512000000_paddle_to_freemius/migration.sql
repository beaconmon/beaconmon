-- Cutover from Paddle to Freemius.
-- Pre-launch: no real subscription data exists, so a column rename is safe.

ALTER TABLE "subscriptions"
  DROP CONSTRAINT IF EXISTS "subscriptions_paddle_customer_id_key";

ALTER TABLE "subscriptions"
  DROP CONSTRAINT IF EXISTS "subscriptions_paddle_subscription_id_key";

ALTER TABLE "subscriptions"
  RENAME COLUMN "paddle_customer_id" TO "freemius_user_id";

ALTER TABLE "subscriptions"
  RENAME COLUMN "paddle_subscription_id" TO "freemius_subscription_id";

CREATE UNIQUE INDEX "subscriptions_freemius_user_id_key"
  ON "subscriptions" ("freemius_user_id");

CREATE UNIQUE INDEX "subscriptions_freemius_subscription_id_key"
  ON "subscriptions" ("freemius_subscription_id");
