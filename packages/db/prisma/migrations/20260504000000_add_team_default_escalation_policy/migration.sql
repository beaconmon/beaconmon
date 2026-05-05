-- Team-level default escalation policy used as fallback when a monitor
-- has no escalation policy assigned. NULL means "broadcast to all channels".

ALTER TABLE "teams"
  ADD COLUMN IF NOT EXISTS "default_escalation_policy_id" TEXT;

ALTER TABLE "teams"
  ADD CONSTRAINT "teams_default_escalation_policy_id_fkey"
  FOREIGN KEY ("default_escalation_policy_id")
  REFERENCES "escalation_policies"("id")
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "teams_default_escalation_policy_id_idx"
  ON "teams" ("default_escalation_policy_id");
