-- Monitor tags (M3.2).
--
-- User-defined free-form tags for filtering and organizing monitors. GIN
-- index supports efficient ?tag= filtering once teams have many monitors.

ALTER TABLE "monitors"
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "monitors_tags_gin" ON "monitors" USING GIN ("tags");
