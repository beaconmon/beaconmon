-- Add digest_prefs JSONB column to teams for intelligence digest settings.
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "digest_prefs" JSONB;
