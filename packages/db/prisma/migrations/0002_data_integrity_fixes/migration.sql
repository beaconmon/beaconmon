-- Fix 1: ON DELETE SET NULL on escalation_step_recipients.user_id conflicts with
-- the table CHECK constraint. The check allows both nulls only when removed_at IS
-- NOT NULL, but active recipients have removed_at IS NULL, so a user deletion
-- would set user_id = NULL on an active row and violate the constraint, blocking
-- the delete entirely. CASCADE removes the recipient row instead.
ALTER TABLE "escalation_step_recipients"
    DROP CONSTRAINT "escalation_step_recipients_user_id_fkey";

ALTER TABLE "escalation_step_recipients"
    ADD CONSTRAINT "escalation_step_recipients_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fix 2: Enforce at the DB level that both the competitor and the alert channel
-- linked in competitor_notification_channels belong to the same team as the row
-- itself. Application code already validates this, but a direct SQL insert would
-- bypass it. A trigger provides the DB-level guarantee.
CREATE OR REPLACE FUNCTION check_competitor_notification_channel_tenant()
RETURNS TRIGGER AS $$
DECLARE
  competitor_team TEXT;
  channel_team    TEXT;
BEGIN
  SELECT team_id INTO competitor_team FROM competitors WHERE id = NEW.competitor_id;
  SELECT team_id INTO channel_team    FROM alert_channels WHERE id = NEW.channel_id;

  IF competitor_team IS DISTINCT FROM NEW.team_id THEN
    RAISE EXCEPTION
      'tenant mismatch: competitor % belongs to team %, row has team_id %',
      NEW.competitor_id, competitor_team, NEW.team_id;
  END IF;

  IF channel_team IS DISTINCT FROM NEW.team_id THEN
    RAISE EXCEPTION
      'tenant mismatch: channel % belongs to team %, row has team_id %',
      NEW.channel_id, channel_team, NEW.team_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER competitor_notification_channel_tenant_check
BEFORE INSERT OR UPDATE ON "competitor_notification_channels"
FOR EACH ROW EXECUTE FUNCTION check_competitor_notification_channel_tenant();
