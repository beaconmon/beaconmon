-- CreateIndex: partial index for heartbeat token lookups
-- Must be a separate migration because PostgreSQL requires new enum values to
-- be committed before they can be referenced in the same transaction.
CREATE INDEX "monitors_heartbeat_token" ON "monitors" ((config->>'token')) WHERE type = 'heartbeat';
