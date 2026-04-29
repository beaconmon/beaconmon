-- AlterTable
ALTER TABLE "monitors" ADD COLUMN IF NOT EXISTS "is_competitor" BOOLEAN NOT NULL DEFAULT false;
