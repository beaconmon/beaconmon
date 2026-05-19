-- AddColumn: AI analysis fields on content_snapshots
ALTER TABLE "content_snapshots"
  ADD COLUMN "classification"  TEXT,
  ADD COLUMN "ai_model"        TEXT,
  ADD COLUMN "ai_analyzed_at"  TIMESTAMP(3);
