-- Rename plan tier enum values: pro→growth, business→scale, add starter
ALTER TYPE "PlanTier" RENAME VALUE 'pro' TO 'growth';
ALTER TYPE "PlanTier" RENAME VALUE 'business' TO 'scale';
ALTER TYPE "PlanTier" ADD VALUE 'starter';
