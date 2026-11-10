-- 0004: link Search Console data rows to the sync run that wrote them.
-- Additive only: two nullable columns, two foreign keys, two indexes.
-- No data is read, written or changed. RLS, grants and policies are untouched
-- (the seo_worker grants on both tables are table-level, so they cover the new column).
-- Transactional: all statements apply together or not at all.
BEGIN;

-- Guard: refuse to run if the target tables already hold rows, or the link target is missing.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "seo_search_daily") OR EXISTS (SELECT 1 FROM "seo_search_performance") THEN
    RAISE EXCEPTION '0004 aborted: seo_search_daily / seo_search_performance are not empty';
  END IF;
  IF to_regclass('public.seo_gsc_sync_runs') IS NULL THEN
    RAISE EXCEPTION '0004 aborted: seo_gsc_sync_runs (migration 0003) is missing';
  END IF;
END $$;

ALTER TABLE "seo_search_daily"       ADD COLUMN "syncRunId" TEXT;
ALTER TABLE "seo_search_performance" ADD COLUMN "syncRunId" TEXT;

ALTER TABLE "seo_search_daily"
  ADD CONSTRAINT "seo_search_daily_syncRunId_fkey"
  FOREIGN KEY ("syncRunId") REFERENCES "seo_gsc_sync_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "seo_search_performance"
  ADD CONSTRAINT "seo_search_performance_syncRunId_fkey"
  FOREIGN KEY ("syncRunId") REFERENCES "seo_gsc_sync_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "seo_search_daily_syncRunId_idx"       ON "seo_search_daily"("syncRunId");
CREATE INDEX "seo_search_performance_syncRunId_idx" ON "seo_search_performance"("syncRunId");

COMMIT;
