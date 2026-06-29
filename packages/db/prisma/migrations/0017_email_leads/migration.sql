-- Email Leads: one row per unique (email, tool) pair submitted via the free
-- calculator lead capture forms. email_sent tracks whether the follow-up email
-- was dispatched so re-submissions don't trigger duplicates.

CREATE TABLE "email_leads" (
    "id"         UUID        NOT NULL DEFAULT gen_random_uuid(),
    "email"      TEXT        NOT NULL,
    "tool"       TEXT        NOT NULL,
    "result"     TEXT,
    "inputs"     JSONB,
    "email_sent" BOOLEAN     NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "email_leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_leads_email_tool_key" ON "email_leads"("email", "tool");
CREATE INDEX "email_leads_created_at_idx" ON "email_leads"("created_at");
