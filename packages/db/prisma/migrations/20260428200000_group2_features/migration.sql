-- Group 2 features migration
-- Escalation policies, anomaly detection, PDF report branding, incident acknowledgement

-- ─── Team: report branding columns ────────────────────────────────────────────
ALTER TABLE "teams"
  ADD COLUMN IF NOT EXISTS "report_logo_url"    TEXT,
  ADD COLUMN IF NOT EXISTS "report_brand_color" VARCHAR(7),
  ADD COLUMN IF NOT EXISTS "report_agency_name" TEXT;

-- ─── Monitor: escalation policy + anomaly detection ───────────────────────────
ALTER TABLE "monitors"
  ADD COLUMN IF NOT EXISTS "escalation_policy_id"       TEXT,
  ADD COLUMN IF NOT EXISTS "anomaly_detection_enabled"  BOOLEAN NOT NULL DEFAULT false;

-- ─── Incident: acknowledgement ────────────────────────────────────────────────
ALTER TABLE "incidents"
  ADD COLUMN IF NOT EXISTS "acknowledged_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "acknowledged_by" TEXT;

-- ─── Escalation policies ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "escalation_policies" (
  "id"         TEXT        NOT NULL,
  "team_id"    TEXT        NOT NULL,
  "name"       TEXT        NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "escalation_policies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "escalation_policies_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "escalation_steps" (
  "id"            TEXT    NOT NULL,
  "policy_id"     TEXT    NOT NULL,
  "step_order"    INTEGER NOT NULL,
  "delay_minutes" INTEGER NOT NULL,
  "channel_id"    TEXT    NOT NULL,

  CONSTRAINT "escalation_steps_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "escalation_steps_policy_id_step_order_key"
    UNIQUE ("policy_id", "step_order"),
  CONSTRAINT "escalation_steps_policy_id_fkey"
    FOREIGN KEY ("policy_id") REFERENCES "escalation_policies"("id") ON DELETE CASCADE,
  CONSTRAINT "escalation_steps_channel_id_fkey"
    FOREIGN KEY ("channel_id") REFERENCES "alert_channels"("id") ON DELETE CASCADE
);

-- FK: monitors.escalation_policy_id → escalation_policies.id
ALTER TABLE "monitors"
  ADD CONSTRAINT "monitors_escalation_policy_id_fkey"
    FOREIGN KEY ("escalation_policy_id") REFERENCES "escalation_policies"("id")
    ON DELETE SET NULL;

-- ─── Performance alerts (anomaly detection) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS "performance_alerts" (
  "id"              TEXT        NOT NULL,
  "team_id"         TEXT        NOT NULL,
  "monitor_id"      TEXT        NOT NULL,
  "checked_at"      TIMESTAMPTZ NOT NULL,
  "response_time_ms" INTEGER    NOT NULL,
  "mean_ms"         DOUBLE PRECISION NOT NULL,
  "std_dev_ms"      DOUBLE PRECISION NOT NULL,
  "z_score"         DOUBLE PRECISION NOT NULL,
  "notified_at"     TIMESTAMPTZ,
  "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "performance_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "performance_alerts_monitor_id_checked_at_idx"
  ON "performance_alerts" ("monitor_id", "checked_at" DESC);
