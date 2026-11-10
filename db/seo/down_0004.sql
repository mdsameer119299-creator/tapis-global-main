-- Rollback for 0004. Never auto-run. Removes ONLY the syncRunId indexes, FK constraints and columns.
-- Aborts if any row already carries a syncRunId (rows must be handled deliberately first).
BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "seo_search_daily" WHERE "syncRunId" IS NOT NULL)
     OR EXISTS (SELECT 1 FROM "seo_search_performance" WHERE "syncRunId" IS NOT NULL) THEN
    RAISE EXCEPTION 'down_0004 aborted: rows with a syncRunId exist; remove or detach them deliberately first';
  END IF;
END $$;

DROP INDEX IF EXISTS "seo_search_daily_syncRunId_idx";
DROP INDEX IF EXISTS "seo_search_performance_syncRunId_idx";
ALTER TABLE "seo_search_daily"       DROP CONSTRAINT IF EXISTS "seo_search_daily_syncRunId_fkey";
ALTER TABLE "seo_search_performance" DROP CONSTRAINT IF EXISTS "seo_search_performance_syncRunId_fkey";
ALTER TABLE "seo_search_daily"       DROP COLUMN IF EXISTS "syncRunId";
ALTER TABLE "seo_search_performance" DROP COLUMN IF EXISTS "syncRunId";

COMMIT;
