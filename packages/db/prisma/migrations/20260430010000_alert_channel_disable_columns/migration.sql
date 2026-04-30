-- Soft-disable columns for alert channels (M1.2).
--
-- A user can already toggle `is_active` to pause a channel. These two columns
-- are for SYSTEM-driven disables (currently: plan downgrade left surplus
-- channels above the new tier's `alertChannels` cap). The alert/escalation
-- workers must skip channels where disabled_at IS NOT NULL.

ALTER TABLE "alert_channels"
  ADD COLUMN "disabled_at" TIMESTAMP(3),
  ADD COLUMN "disabled_reason" TEXT;
