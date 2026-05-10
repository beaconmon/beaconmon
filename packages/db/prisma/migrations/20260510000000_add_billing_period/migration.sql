-- CreateEnum
CREATE TYPE "BillingPeriod" AS ENUM ('monthly', 'annual');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "billing_period" "BillingPeriod" NOT NULL DEFAULT 'monthly';
