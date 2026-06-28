-- Tool Reports: one row per free 7-day competitor intelligence report requested
-- via /tools/competitor-intelligence-report. initial_snapshot stores the Shopify
-- catalog state captured at request time so the report job can diff it against
-- the live catalog when report_due_at arrives.

CREATE TABLE "tool_reports" (
    "id"               UUID NOT NULL DEFAULT gen_random_uuid(),
    "email"            TEXT NOT NULL,
    "domain"           TEXT NOT NULL,
    "requested_at"     TIMESTAMPTZ NOT NULL DEFAULT now(),
    "report_due_at"    TIMESTAMPTZ NOT NULL,
    "status"           TEXT NOT NULL DEFAULT 'pending',
    "sent_at"          TIMESTAMPTZ,
    "initial_snapshot" JSONB,

    CONSTRAINT "tool_reports_pkey" PRIMARY KEY ("id")
);

-- One active report per email+domain. Once status moves to 'sent' or 'failed'
-- the unique constraint no longer blocks, so the user can request a fresh one.
CREATE UNIQUE INDEX "tool_reports_email_domain_status_key" ON "tool_reports"("email", "domain", "status");

-- Efficient scan for pending reports past their due date.
CREATE INDEX "tool_reports_status_due_idx" ON "tool_reports"("status", "report_due_at");
