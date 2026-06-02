-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "MonitorType"         AS ENUM ('http', 'ssl', 'domain', 'tcp', 'keyword', 'content', 'heartbeat');
CREATE TYPE "MonitorStatus"       AS ENUM ('up', 'down', 'paused');
CREATE TYPE "KeywordCondition"    AS ENUM ('present', 'absent');
CREATE TYPE "TeamRole"            AS ENUM ('owner', 'admin', 'viewer');
CREATE TYPE "PlanTier"            AS ENUM ('free', 'starter', 'growth', 'scale');
CREATE TYPE "SubscriptionStatus"  AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
CREATE TYPE "BillingPeriod"       AS ENUM ('monthly', 'annual');
CREATE TYPE "ResolutionType"      AS ENUM ('automatic', 'manual');
CREATE TYPE "AlertChannelType"    AS ENUM ('email', 'slack', 'webhook', 'sms', 'discord');
CREATE TYPE "ExpiryAlertType"     AS ENUM ('ssl', 'domain');
CREATE TYPE "NotificationKind"    AS ENUM ('down', 'up');

-- ─── Teams ────────────────────────────────────────────────────────────────────

CREATE TABLE "teams" (
    "id"                            TEXT        NOT NULL,
    "name"                          TEXT        NOT NULL,
    "plan"                          "PlanTier"  NOT NULL DEFAULT 'free',
    "trial_ends_at"                 TIMESTAMPTZ,
    "created_at"                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "report_logo_url"               TEXT,
    "report_brand_color"            TEXT,
    "report_agency_name"            TEXT,
    "default_escalation_policy_id"  TEXT,
    "digest_prefs"                  JSONB,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- ─── Users ────────────────────────────────────────────────────────────────────

CREATE TABLE "users" (
    "id"                TEXT        NOT NULL,
    "name"              TEXT        NOT NULL,
    "email"             TEXT        NOT NULL,
    "email_verified"    BOOLEAN     NOT NULL DEFAULT false,
    "image"             TEXT,
    "last_login_method" TEXT,
    "created_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- ─── Sessions (Better Auth) ───────────────────────────────────────────────────

CREATE TABLE "sessions" (
    "id"          TEXT        NOT NULL,
    "user_id"     TEXT        NOT NULL,
    "token"       TEXT        NOT NULL,
    "expires_at"  TIMESTAMPTZ NOT NULL,
    "ip_address"  TEXT,
    "user_agent"  TEXT,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- ─── Accounts (Better Auth) ───────────────────────────────────────────────────

CREATE TABLE "accounts" (
    "id"                        TEXT        NOT NULL,
    "user_id"                   TEXT        NOT NULL,
    "account_id"                TEXT        NOT NULL,
    "provider_id"               TEXT        NOT NULL,
    "access_token"              TEXT,
    "refresh_token"             TEXT,
    "id_token"                  TEXT,
    "access_token_expires_at"   TIMESTAMPTZ,
    "refresh_token_expires_at"  TIMESTAMPTZ,
    "scope"                     TEXT,
    "password"                  TEXT,
    "created_at"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "accounts_provider_id_account_id_key" ON "accounts"("provider_id", "account_id");

-- ─── Verifications (Better Auth) ──────────────────────────────────────────────

CREATE TABLE "verifications" (
    "id"          TEXT        NOT NULL,
    "identifier"  TEXT        NOT NULL,
    "value"       TEXT        NOT NULL,
    "expires_at"  TIMESTAMPTZ NOT NULL,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- ─── Team Members ─────────────────────────────────────────────────────────────

CREATE TABLE "team_members" (
    "id"          TEXT        NOT NULL,
    "team_id"     TEXT        NOT NULL,
    "user_id"     TEXT        NOT NULL,
    "role"        "TeamRole"  NOT NULL DEFAULT 'viewer',
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- ─── Team Invitations ─────────────────────────────────────────────────────────

CREATE TABLE "team_invitations" (
    "id"          TEXT        NOT NULL,
    "team_id"     TEXT        NOT NULL,
    "email"       TEXT        NOT NULL,
    "role"        "TeamRole"  NOT NULL DEFAULT 'viewer',
    "token"       TEXT        NOT NULL,
    "expires_at"  TIMESTAMPTZ NOT NULL,
    "accepted_at" TIMESTAMPTZ,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "team_invitations_token_key" ON "team_invitations"("token");

-- ─── Subscriptions ────────────────────────────────────────────────────────────

CREATE TABLE "subscriptions" (
    "id"                        TEXT                    NOT NULL,
    "team_id"                   TEXT                    NOT NULL,
    "freemius_user_id"          TEXT                    NOT NULL,
    "freemius_subscription_id"  TEXT,
    "plan"                      "PlanTier"              NOT NULL DEFAULT 'free',
    "status"                    "SubscriptionStatus"    NOT NULL DEFAULT 'trialing',
    "billing_period"            "BillingPeriod"         NOT NULL DEFAULT 'monthly',
    "trial_ends_at"             TIMESTAMPTZ,
    "current_period_end"        TIMESTAMPTZ,
    "created_at"                TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    "updated_at"                TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscriptions_team_id_key"                   ON "subscriptions"("team_id");
CREATE UNIQUE INDEX "subscriptions_freemius_user_id_key"          ON "subscriptions"("freemius_user_id");
CREATE UNIQUE INDEX "subscriptions_freemius_subscription_id_key"  ON "subscriptions"("freemius_subscription_id");

-- ─── Escalation Policies (before monitors — monitors.escalation_policy_id refs this) ──

CREATE TABLE "escalation_policies" (
    "id"          TEXT        NOT NULL,
    "team_id"     TEXT        NOT NULL,
    "name"        TEXT        NOT NULL,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "escalation_policies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "escalation_steps" (
    "id"            TEXT    NOT NULL,
    "policy_id"     TEXT    NOT NULL,
    "step_order"    INTEGER NOT NULL,
    "delay_minutes" INTEGER NOT NULL,
    CONSTRAINT "escalation_steps_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "escalation_steps_policy_id_step_order_key" UNIQUE ("policy_id", "step_order")
);

CREATE TABLE "escalation_step_recipients" (
    "id"          TEXT        NOT NULL,
    "step_id"     TEXT        NOT NULL,
    "channel_id"  TEXT,
    "user_id"     TEXT,
    "removed_at"  TIMESTAMPTZ,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "escalation_step_recipients_pkey" PRIMARY KEY ("id"),
    -- Exactly one of channel_id or user_id must be set; both-null only when removed_at marks a tombstone.
    CONSTRAINT "escalation_step_recipients_target_check" CHECK (
        ("channel_id" IS NOT NULL AND "user_id" IS NULL)
        OR ("channel_id" IS NULL AND "user_id" IS NOT NULL)
        OR ("channel_id" IS NULL AND "user_id" IS NULL AND "removed_at" IS NOT NULL)
    )
);
CREATE INDEX "escalation_step_recipients_step_id_idx" ON "escalation_step_recipients"("step_id");
CREATE INDEX "escalation_step_recipients_user_id_idx" ON "escalation_step_recipients"("user_id");

-- ─── Monitors ─────────────────────────────────────────────────────────────────

CREATE TABLE "monitors" (
    "id"                            TEXT              NOT NULL,
    "team_id"                       TEXT              NOT NULL,
    "name"                          TEXT              NOT NULL,
    "url"                           TEXT              NOT NULL,
    "type"                          "MonitorType"     NOT NULL,
    "is_active"                     BOOLEAN           NOT NULL DEFAULT true,
    "current_status"                "MonitorStatus"   NOT NULL DEFAULT 'up',
    "interval_seconds"              INTEGER           NOT NULL DEFAULT 300,
    "timeout_ms"                    INTEGER           NOT NULL DEFAULT 30000,
    "next_check_at"                 TIMESTAMPTZ,
    "last_checked_at"               TIMESTAMPTZ,
    "consecutive_failures"          INTEGER           NOT NULL DEFAULT 0,
    "response_time_threshold_ms"    INTEGER,
    "keyword"                       TEXT,
    "keyword_condition"             "KeywordCondition",
    "content_snapshot"              TEXT,
    "content_last_changed_at"       TIMESTAMPTZ,
    "last_heartbeat_at"             TIMESTAMPTZ,
    "escalation_policy_id"          TEXT,
    "anomaly_detection_enabled"     BOOLEAN           NOT NULL DEFAULT false,
    "slo_target"                    DECIMAL(6,4),
    "slo_window_days"               INTEGER,
    "slo_burn_rate_fast_threshold"  DOUBLE PRECISION,
    "slo_burn_rate_slow_threshold"  DOUBLE PRECISION,
    "config"                        JSONB             NOT NULL DEFAULT '{}',
    "tags"                          TEXT[]            NOT NULL DEFAULT ARRAY[]::TEXT[],
    "deleted_at"                    TIMESTAMPTZ,
    "created_at"                    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    "updated_at"                    TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    CONSTRAINT "monitors_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "monitors_next_check"      ON "monitors"("next_check_at") WHERE "is_active" = true;
CREATE INDEX "monitors_tags_gin"        ON "monitors" USING GIN ("tags");
CREATE INDEX "monitors_heartbeat_token" ON "monitors" ((config->>'token')) WHERE type = 'heartbeat';

-- ─── Check Results (partitioned by month on checked_at) ───────────────────────
-- Prisma cannot model partitioned tables natively. The CheckResult model in
-- schema.prisma exists for type generation only; this DDL is authoritative.
-- Partition management (create next month, drop >365d old) must be built into
-- the scheduler worker — it does not yet exist as of 2026-06-02.

CREATE TABLE "check_results" (
    "id"                TEXT        NOT NULL,
    "monitor_id"        TEXT        NOT NULL,
    "checked_at"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "success"           BOOLEAN     NOT NULL,
    "status_code"       INTEGER,
    "response_time_ms"  INTEGER,
    "error_type"        TEXT,
    "error_message"     TEXT,
    "region"            TEXT,       -- NULL = Railway-only check (SSL/TCP/domain)
    "maintenance"       BOOLEAN     NOT NULL DEFAULT false,
    CONSTRAINT "check_results_pkey" PRIMARY KEY ("id", "checked_at")
) PARTITION BY RANGE ("checked_at");

-- Seed partitions: current month + 6 forward months.
-- Add new partitions before each month boundary; missing partition = insert failure.
CREATE TABLE "check_results_2026_06" PARTITION OF "check_results" FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE "check_results_2026_07" PARTITION OF "check_results" FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE "check_results_2026_08" PARTITION OF "check_results" FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE "check_results_2026_09" PARTITION OF "check_results" FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE "check_results_2026_10" PARTITION OF "check_results" FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE "check_results_2026_11" PARTITION OF "check_results" FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE "check_results_2026_12" PARTITION OF "check_results" FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Always query with monitor_id + checked_at range; never scan the full parent.
CREATE INDEX "check_results_monitor_time"        ON "check_results" ("monitor_id", "checked_at" DESC);
CREATE INDEX "check_results_monitor_region_time" ON "check_results" ("monitor_id", "region", "checked_at" DESC)
    WHERE "region" IS NOT NULL;

-- ─── Incidents ────────────────────────────────────────────────────────────────

CREATE TABLE "incidents" (
    "id"                TEXT              NOT NULL,
    "team_id"           TEXT              NOT NULL,
    "monitor_id"        TEXT              NOT NULL,
    "started_at"        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    "resolved_at"       TIMESTAMPTZ,
    "resolution_type"   "ResolutionType",
    "acknowledged_at"   TIMESTAMPTZ,
    "acknowledged_by"   TEXT,
    "created_at"        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    "updated_at"        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "incidents_team_id_started_at_idx" ON "incidents"("team_id", "started_at" DESC);

-- ─── Expiry Alerts ────────────────────────────────────────────────────────────

CREATE TABLE "expiry_alerts" (
    "id"              TEXT              NOT NULL,
    "team_id"         TEXT              NOT NULL,
    "monitor_id"      TEXT              NOT NULL,
    "type"            "ExpiryAlertType" NOT NULL,
    "days_remaining"  INTEGER           NOT NULL,
    "threshold"       INTEGER           NOT NULL,
    "sent_at"         TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    "created_at"      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    CONSTRAINT "expiry_alerts_pkey" PRIMARY KEY ("id")
);

-- ─── Alert Channels ───────────────────────────────────────────────────────────

CREATE TABLE "alert_channels" (
    "id"              TEXT                NOT NULL,
    "team_id"         TEXT                NOT NULL,
    "user_id"         TEXT,
    "name"            TEXT                NOT NULL,
    "type"            "AlertChannelType"  NOT NULL,
    "config"          JSONB               NOT NULL DEFAULT '{}',
    "is_active"       BOOLEAN             NOT NULL DEFAULT true,
    "disabled_at"     TIMESTAMPTZ,
    "disabled_reason" TEXT,
    "created_at"      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    "updated_at"      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    CONSTRAINT "alert_channels_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "alert_channels_team_id_user_id_idx" ON "alert_channels"("team_id", "user_id");

-- ─── Notifications (idempotency log) ─────────────────────────────────────────
-- Claim-then-send: NULL sent_at = claimed, non-NULL = delivered.
-- The unique index is what prevents double-sends under concurrent retries.

CREATE TABLE "notifications" (
    "id"                  TEXT                NOT NULL,
    "team_id"             TEXT                NOT NULL,
    "incident_id"         TEXT                NOT NULL,
    "channel_id"          TEXT                NOT NULL,
    "kind"                "NotificationKind"  NOT NULL DEFAULT 'down',
    "sent_window_bucket"  TIMESTAMPTZ         NOT NULL,
    "sent_at"             TIMESTAMPTZ,
    "created_at"          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notifications_idem_unique"
    ON "notifications"("incident_id", "channel_id", "kind", "sent_window_bucket");
CREATE INDEX "notifications_incident_channel_sent_idx"
    ON "notifications"("incident_id", "channel_id", "sent_at" DESC);

-- ─── Status Pages ─────────────────────────────────────────────────────────────

CREATE TABLE "status_pages" (
    "id"                      TEXT        NOT NULL,
    "team_id"                 TEXT        NOT NULL,
    "name"                    TEXT        NOT NULL,
    "slug"                    TEXT        NOT NULL,
    "custom_domain"           TEXT,
    "custom_domain_verified"  BOOLEAN     NOT NULL DEFAULT false,
    "detected_dns_provider"   TEXT,
    "cloudflare_hostname_id"  TEXT,
    "is_public"               BOOLEAN     NOT NULL DEFAULT true,
    "created_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "status_pages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "status_pages_slug_key"      ON "status_pages"("slug");
CREATE UNIQUE INDEX "status_pages_custom_domain" ON "status_pages"("custom_domain") WHERE "custom_domain" IS NOT NULL;

CREATE TABLE "status_page_monitors" (
    "id"              TEXT    NOT NULL,
    "status_page_id"  TEXT    NOT NULL,
    "monitor_id"      TEXT    NOT NULL,
    "display_order"   INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "status_page_monitors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "status_page_monitors_status_page_id_monitor_id_key"
    ON "status_page_monitors"("status_page_id", "monitor_id");

-- ─── Maintenance Windows ──────────────────────────────────────────────────────

CREATE TABLE "maintenance_windows" (
    "id"          TEXT        NOT NULL,
    "team_id"     TEXT        NOT NULL,
    "starts_at"   TIMESTAMPTZ NOT NULL,
    "ends_at"     TIMESTAMPTZ NOT NULL,
    "reason"      TEXT,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "maintenance_windows_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "maintenance_windows_team_id_ends_at_idx" ON "maintenance_windows"("team_id", "ends_at" DESC);

CREATE TABLE "maintenance_window_monitors" (
    "id"          TEXT NOT NULL,
    "window_id"   TEXT NOT NULL,
    "monitor_id"  TEXT NOT NULL,
    CONSTRAINT "maintenance_window_monitors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "maintenance_window_monitors_window_id_monitor_id_key"
    ON "maintenance_window_monitors"("window_id", "monitor_id");

-- ─── Notification Read State ──────────────────────────────────────────────────

CREATE TABLE "notification_read_state" (
    "id"            TEXT        NOT NULL,
    "team_id"       TEXT        NOT NULL,
    "user_id"       TEXT        NOT NULL,
    "last_seen_at"  TIMESTAMPTZ NOT NULL,
    "updated_at"    TIMESTAMPTZ NOT NULL,
    CONSTRAINT "notification_read_state_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "notification_read_state_team_id_user_id_key"
    ON "notification_read_state"("team_id", "user_id");

-- ─── User Notification Preferences ───────────────────────────────────────────

CREATE TABLE "user_notification_preferences" (
    "id"                  TEXT        NOT NULL,
    "user_id"             TEXT        NOT NULL,
    "team_id"             TEXT        NOT NULL,
    "primary_channel_id"  TEXT,
    "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "user_notification_preferences_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "user_notification_prefs_user_id_team_id_key"
    ON "user_notification_preferences"("user_id", "team_id");

-- ─── Performance Alerts ───────────────────────────────────────────────────────

CREATE TABLE "performance_alerts" (
    "id"                TEXT             NOT NULL,
    "team_id"           TEXT             NOT NULL,
    "monitor_id"        TEXT             NOT NULL,
    "checked_at"        TIMESTAMPTZ      NOT NULL,
    "response_time_ms"  INTEGER          NOT NULL,
    "mean_ms"           DOUBLE PRECISION NOT NULL,
    "std_dev_ms"        DOUBLE PRECISION NOT NULL,
    "z_score"           DOUBLE PRECISION NOT NULL,
    "notified_at"       TIMESTAMPTZ,
    "created_at"        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    CONSTRAINT "performance_alerts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "performance_alerts_monitor_id_checked_at_idx"
    ON "performance_alerts"("monitor_id", "checked_at" DESC);

-- ─── Deploy Events ────────────────────────────────────────────────────────────

CREATE TABLE "deploy_events" (
    "id"              TEXT        NOT NULL,
    "monitor_id"      TEXT        NOT NULL,
    "team_id"         TEXT        NOT NULL,
    "started_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ended_at"        TIMESTAMPTZ,
    "commit_sha"      TEXT,
    "description"     TEXT,
    "suppress_alerts" BOOLEAN     NOT NULL DEFAULT true,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "deploy_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "deploy_events_monitor_id_started_at_idx"
    ON "deploy_events"("monitor_id", "started_at" DESC);

-- ─── Processed Webhook Events ─────────────────────────────────────────────────

CREATE TABLE "processed_webhook_events" (
    "id"            TEXT        NOT NULL,
    "type"          TEXT        NOT NULL,
    "processed_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "processed_webhook_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "processed_webhook_events_processed_at_idx"
    ON "processed_webhook_events"("processed_at");

-- ─── Competitor Intelligence ──────────────────────────────────────────────────

CREATE TABLE "competitors" (
    "id"          TEXT        NOT NULL,
    "team_id"     TEXT        NOT NULL,
    "name"        TEXT        NOT NULL,
    "domain"      TEXT        NOT NULL,
    "platform"    TEXT        NOT NULL,
    "is_active"   BOOLEAN     NOT NULL DEFAULT true,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "competitor_pages" (
    "id"                  TEXT        NOT NULL,
    "competitor_id"       TEXT        NOT NULL,
    "team_id"             TEXT        NOT NULL,
    "label"               TEXT        NOT NULL,
    "url"                 TEXT        NOT NULL,
    "selector"            TEXT,
    "interval_seconds"    INTEGER     NOT NULL DEFAULT 3600,
    "is_active"           BOOLEAN     NOT NULL DEFAULT true,
    "last_snapshot_hash"  TEXT,
    "last_checked_at"     TIMESTAMPTZ,
    "next_check_at"       TIMESTAMPTZ,
    "created_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "competitor_pages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "competitor_products" (
    "id"                  TEXT            NOT NULL,
    "competitor_id"       TEXT            NOT NULL,
    "team_id"             TEXT            NOT NULL,
    "shopify_product_id"  TEXT            NOT NULL,
    "title"               TEXT            NOT NULL,
    "handle"              TEXT            NOT NULL,
    "sku"                 TEXT,
    "gtin"                TEXT,
    "vendor"              TEXT,
    "product_type"        TEXT,
    "is_available"        BOOLEAN         NOT NULL DEFAULT true,
    "variants"            JSONB           NOT NULL DEFAULT '[]',
    "current_price"       DECIMAL(10,2),
    "compare_at_price"    DECIMAL(10,2),
    "currency"            TEXT            NOT NULL DEFAULT 'USD',
    "last_seen_at"        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "created_at"          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    "updated_at"          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT "competitor_products_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "competitor_products_competitor_id_shopify_product_id_key"
    ON "competitor_products"("competitor_id", "shopify_product_id");

CREATE TABLE "competitor_events" (
    "id"              TEXT        NOT NULL,
    "team_id"         TEXT        NOT NULL,
    "competitor_id"   TEXT        NOT NULL,
    "product_id"      TEXT,
    "page_id"         TEXT,
    "type"            TEXT        NOT NULL,
    "payload"         JSONB       NOT NULL DEFAULT '{}',
    "detected_at"     TIMESTAMPTZ NOT NULL,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "competitor_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "competitor_events_team_id_detected_at_idx"
    ON "competitor_events"("team_id", "detected_at" DESC);
CREATE INDEX "competitor_events_competitor_id_detected_at_idx"
    ON "competitor_events"("competitor_id", "detected_at" DESC);

CREATE TABLE "competitor_decisions" (
    "id"          TEXT        NOT NULL,
    "team_id"     TEXT        NOT NULL,
    "event_id"    TEXT        NOT NULL,
    "response"    TEXT        NOT NULL,
    "note"        TEXT,
    "decided_by"  TEXT        NOT NULL,
    "created_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "competitor_decisions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "competitor_decisions_event_id_key" ON "competitor_decisions"("event_id");

CREATE TABLE "competitor_notification_channels" (
    "id"              TEXT        NOT NULL,
    "competitor_id"   TEXT        NOT NULL,
    "channel_id"      TEXT        NOT NULL,
    "created_at"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "competitor_notification_channels_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "competitor_notification_channels_competitor_id_channel_id_key"
    ON "competitor_notification_channels"("competitor_id", "channel_id");

-- ─── Content Snapshots ────────────────────────────────────────────────────────
-- Exactly one of monitor_id or competitor_page_id must be set.

CREATE TABLE "content_snapshots" (
    "id"                  TEXT        NOT NULL,
    "monitor_id"          TEXT,
    "competitor_page_id"  TEXT,
    "team_id"             TEXT        NOT NULL,
    "content"             TEXT        NOT NULL,
    "content_hash"        TEXT,
    "captured_at"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "diff_summary"        TEXT,
    "classification"      TEXT,
    "ai_confidence"       DOUBLE PRECISION,
    "ai_model"            TEXT,
    "ai_analyzed_at"      TIMESTAMPTZ,
    CONSTRAINT "content_snapshots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "content_snapshots_source_check" CHECK (
        ("monitor_id" IS NOT NULL AND "competitor_page_id" IS NULL)
        OR ("monitor_id" IS NULL AND "competitor_page_id" IS NOT NULL)
    )
);
CREATE INDEX "content_snapshots_monitor_id_captured_at_idx"
    ON "content_snapshots"("monitor_id", "captured_at" DESC);
CREATE INDEX "content_snapshots_competitor_page_id_captured_at_idx"
    ON "content_snapshots"("competitor_page_id", "captured_at" DESC);

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────

-- Auth
ALTER TABLE "sessions"
    ADD CONSTRAINT "sessions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts"
    ADD CONSTRAINT "accounts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Team membership
ALTER TABLE "team_members"
    ADD CONSTRAINT "team_members_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_members"
    ADD CONSTRAINT "team_members_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_invitations"
    ADD CONSTRAINT "team_invitations_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions"
    ADD CONSTRAINT "subscriptions_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Teams self-ref (must come after escalation_policies is created above)
ALTER TABLE "teams"
    ADD CONSTRAINT "teams_default_escalation_policy_id_fkey"
    FOREIGN KEY ("default_escalation_policy_id") REFERENCES "escalation_policies"("id") ON DELETE SET NULL;
CREATE INDEX "teams_default_escalation_policy_id_idx" ON "teams"("default_escalation_policy_id");

-- Escalation
ALTER TABLE "escalation_policies"
    ADD CONSTRAINT "escalation_policies_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "escalation_steps"
    ADD CONSTRAINT "escalation_steps_policy_id_fkey"
    FOREIGN KEY ("policy_id") REFERENCES "escalation_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "escalation_step_recipients"
    ADD CONSTRAINT "escalation_step_recipients_step_id_fkey"
    FOREIGN KEY ("step_id") REFERENCES "escalation_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "escalation_step_recipients"
    ADD CONSTRAINT "escalation_step_recipients_channel_id_fkey"
    FOREIGN KEY ("channel_id") REFERENCES "alert_channels"("id") ON DELETE CASCADE;
ALTER TABLE "escalation_step_recipients"
    ADD CONSTRAINT "escalation_step_recipients_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Monitors
ALTER TABLE "monitors"
    ADD CONSTRAINT "monitors_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "monitors"
    ADD CONSTRAINT "monitors_escalation_policy_id_fkey"
    FOREIGN KEY ("escalation_policy_id") REFERENCES "escalation_policies"("id") ON DELETE SET NULL;

-- Check results (FK on partition parent propagates to all child partitions)
ALTER TABLE "check_results"
    ADD CONSTRAINT "check_results_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Incidents
ALTER TABLE "incidents"
    ADD CONSTRAINT "incidents_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incidents"
    ADD CONSTRAINT "incidents_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Expiry alerts
ALTER TABLE "expiry_alerts"
    ADD CONSTRAINT "expiry_alerts_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "expiry_alerts"
    ADD CONSTRAINT "expiry_alerts_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Alert channels
ALTER TABLE "alert_channels"
    ADD CONSTRAINT "alert_channels_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alert_channels"
    ADD CONSTRAINT "alert_channels_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Notifications
ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_incident_id_fkey"
    FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_channel_id_fkey"
    FOREIGN KEY ("channel_id") REFERENCES "alert_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Status pages
ALTER TABLE "status_pages"
    ADD CONSTRAINT "status_pages_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "status_page_monitors"
    ADD CONSTRAINT "status_page_monitors_status_page_id_fkey"
    FOREIGN KEY ("status_page_id") REFERENCES "status_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "status_page_monitors"
    ADD CONSTRAINT "status_page_monitors_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Maintenance windows
ALTER TABLE "maintenance_windows"
    ADD CONSTRAINT "maintenance_windows_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "maintenance_window_monitors"
    ADD CONSTRAINT "maintenance_window_monitors_window_id_fkey"
    FOREIGN KEY ("window_id") REFERENCES "maintenance_windows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "maintenance_window_monitors"
    ADD CONSTRAINT "maintenance_window_monitors_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notification read state
ALTER TABLE "notification_read_state"
    ADD CONSTRAINT "notification_read_state_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_read_state"
    ADD CONSTRAINT "notification_read_state_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- User notification preferences
ALTER TABLE "user_notification_preferences"
    ADD CONSTRAINT "user_notification_prefs_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "user_notification_preferences"
    ADD CONSTRAINT "user_notification_prefs_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;
ALTER TABLE "user_notification_preferences"
    ADD CONSTRAINT "user_notification_prefs_primary_channel_id_fkey"
    FOREIGN KEY ("primary_channel_id") REFERENCES "alert_channels"("id") ON DELETE SET NULL;

-- Performance alerts
ALTER TABLE "performance_alerts"
    ADD CONSTRAINT "performance_alerts_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "performance_alerts"
    ADD CONSTRAINT "performance_alerts_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Deploy events
ALTER TABLE "deploy_events"
    ADD CONSTRAINT "deploy_events_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deploy_events"
    ADD CONSTRAINT "deploy_events_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Content snapshots
ALTER TABLE "content_snapshots"
    ADD CONSTRAINT "content_snapshots_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_snapshots"
    ADD CONSTRAINT "content_snapshots_monitor_id_fkey"
    FOREIGN KEY ("monitor_id") REFERENCES "monitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_snapshots"
    ADD CONSTRAINT "content_snapshots_competitor_page_id_fkey"
    FOREIGN KEY ("competitor_page_id") REFERENCES "competitor_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Competitor intelligence
ALTER TABLE "competitors"
    ADD CONSTRAINT "competitors_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_pages"
    ADD CONSTRAINT "competitor_pages_competitor_id_fkey"
    FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_pages"
    ADD CONSTRAINT "competitor_pages_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_products"
    ADD CONSTRAINT "competitor_products_competitor_id_fkey"
    FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_products"
    ADD CONSTRAINT "competitor_products_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_events"
    ADD CONSTRAINT "competitor_events_competitor_id_fkey"
    FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_events"
    ADD CONSTRAINT "competitor_events_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_events"
    ADD CONSTRAINT "competitor_events_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "competitor_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "competitor_events"
    ADD CONSTRAINT "competitor_events_page_id_fkey"
    FOREIGN KEY ("page_id") REFERENCES "competitor_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "competitor_decisions"
    ADD CONSTRAINT "competitor_decisions_event_id_fkey"
    FOREIGN KEY ("event_id") REFERENCES "competitor_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_decisions"
    ADD CONSTRAINT "competitor_decisions_team_id_fkey"
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_notification_channels"
    ADD CONSTRAINT "competitor_notification_channels_competitor_id_fkey"
    FOREIGN KEY ("competitor_id") REFERENCES "competitors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "competitor_notification_channels"
    ADD CONSTRAINT "competitor_notification_channels_channel_id_fkey"
    FOREIGN KEY ("channel_id") REFERENCES "alert_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
