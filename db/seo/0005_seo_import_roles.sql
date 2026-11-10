-- 0005: two dedicated, least-privilege roles for the one-time Search Console 90-day import.
-- PROPOSED, NOT APPLIED. Additive: creates 2 NOLOGIN roles, grants and RLS policies for them. It changes nothing for
-- seo_worker, postgres, anon, authenticated or any existing policy, table, column or row. No data is read or written.
--
--   seo_importer         import steps (start / daily / windows / finish / resume).  NO delete anywhere.  The only role the application may ever hold.
--   seo_import_rollback  rollback of ONE run by syncRunId only.  The ONLY role with DELETE, and only on the two search tables.
--                        It is NEVER granted to the application login. It is used only by the manual administrator procedure
--                        db/seo/admin_rollback_import_run.sql, which grants it inside one transaction and revokes it before COMMIT.
--
-- Neither role has any privilege on seo_oauth_states, seo_sitemap_status, seo_ga4_*, seo_recommendations, seo_keywords,
-- seo_crawl_*, seo_technical_issues, seo_agent_runs, seo_approval_requests or any other table. No INSERT/UPDATE/DELETE on seo_sites or
-- seo_oauth_connections. The oauth ciphertext is readable only because the import must refresh an access token (same as the dry-run).
-- Membership (step 6) is a SEPARATE live role change that needs its own approval; without it the importer cannot SET ROLE.
BEGIN;

DO $$
BEGIN
  IF to_regclass('public.seo_search_performance') IS NULL OR to_regclass('public.seo_gsc_sync_runs') IS NULL THEN
    RAISE EXCEPTION '0005 aborted: SEO tables missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='seo_search_performance' AND column_name='syncRunId') THEN
    RAISE EXCEPTION '0005 aborted: migration 0004 (syncRunId) is not applied';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('seo_importer','seo_import_rollback')) THEN
    RAISE EXCEPTION '0005 aborted: a role named seo_importer / seo_import_rollback already exists';
  END IF;
END $$;

-- 1. Roles: no login, no inherit, no superuser / createdb / createrole / replication / bypassrls.
CREATE ROLE seo_importer        NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE seo_import_rollback NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT USAGE ON SCHEMA public TO seo_importer, seo_import_rollback;

-- 2. Site + connection: exactly one site and one GSC connection, read-only, only the columns the import reads.
GRANT SELECT ("id","domain") ON public.seo_sites TO seo_importer, seo_import_rollback;
CREATE POLICY seo_importer_site_read ON public.seo_sites FOR SELECT TO seo_importer, seo_import_rollback
  USING ("domain" = 'tapisglobalinternational.com');

GRANT SELECT ("siteId","provider","state","propertyUrl","revokedAt","refreshTokenCipher","refreshTokenIv","refreshTokenTag","keyVersion")
  ON public.seo_oauth_connections TO seo_importer;
CREATE POLICY seo_importer_conn_read ON public.seo_oauth_connections FOR SELECT TO seo_importer
  USING ("provider" = 'GSC' AND "propertyUrl" = 'sc-domain:tapisglobalinternational.com'
         AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'));

-- 3. Sync runs. Importer: insert RUNNING runs, update bookkeeping columns only (never kind/range/site/trigger/startedAt).
GRANT SELECT, INSERT ON public.seo_gsc_sync_runs TO seo_importer;
GRANT UPDATE ("status","rowsFetched","rowsWritten","errorCode","errorMessage","finishedAt") ON public.seo_gsc_sync_runs TO seo_importer;
CREATE POLICY seo_importer_runs_select ON public.seo_gsc_sync_runs FOR SELECT TO seo_importer, seo_import_rollback
  USING ("kind" = 'SEARCH_ANALYTICS');
CREATE POLICY seo_importer_runs_insert ON public.seo_gsc_sync_runs FOR INSERT TO seo_importer
  WITH CHECK ("kind" = 'SEARCH_ANALYTICS' AND "trigger" = 'MANUAL' AND "status" = 'RUNNING'
              AND "rangeStart" = DATE '2026-08-11' AND "rangeEnd" = DATE '2026-11-08' AND "rowsFetched" = 0 AND "rowsWritten" = 0
              AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'));
CREATE POLICY seo_importer_runs_update ON public.seo_gsc_sync_runs FOR UPDATE TO seo_importer
  USING ("kind" = 'SEARCH_ANALYTICS' AND "status" IN ('RUNNING','PARTIAL'))
  WITH CHECK ("kind" = 'SEARCH_ANALYTICS' AND "status" IN ('RUNNING','SUCCEEDED','PARTIAL','FAILED'));
-- Rollback role: can only flip a run to CANCELLED (never RUNNING/SUCCEEDED), nothing else.
GRANT SELECT ON public.seo_gsc_sync_runs TO seo_import_rollback;
GRANT UPDATE ("status","errorCode","finishedAt") ON public.seo_gsc_sync_runs TO seo_import_rollback;
CREATE POLICY seo_rollback_runs_update ON public.seo_gsc_sync_runs FOR UPDATE TO seo_import_rollback
  USING ("kind" = 'SEARCH_ANALYTICS' AND "status" IN ('RUNNING','PARTIAL','SUCCEEDED','FAILED','CANCELLED'))
  WITH CHECK ("kind" = 'SEARCH_ANALYTICS' AND "status" = 'CANCELLED');

-- 4. Search tables. Importer: SELECT + INSERT only (insert-only import; no UPDATE, no DELETE) and every inserted row must name a run.
GRANT SELECT, INSERT ON public.seo_search_daily, public.seo_search_performance TO seo_importer;
GRANT SELECT, DELETE ON public.seo_search_daily, public.seo_search_performance TO seo_import_rollback;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['seo_search_daily','seo_search_performance']
  LOOP
    EXECUTE format('CREATE POLICY seo_importer_select ON public.%I FOR SELECT TO seo_importer, seo_import_rollback USING (true)', t);
    EXECUTE format($p$CREATE POLICY seo_importer_insert ON public.%I FOR INSERT TO seo_importer
      WITH CHECK ("syncRunId" IS NOT NULL AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'))$p$, t);
    EXECUTE format('CREATE POLICY seo_rollback_delete ON public.%I FOR DELETE TO seo_import_rollback USING ("syncRunId" IS NOT NULL)', t);
  END LOOP;
END $$;

-- 5. Audit log: append-only, import events only.
GRANT SELECT, INSERT ON public.seo_audit_log TO seo_importer, seo_import_rollback;
CREATE POLICY seo_importer_audit_select ON public.seo_audit_log FOR SELECT TO seo_importer, seo_import_rollback
  USING ("entityType" = 'seo_gsc_sync_runs' AND "action" LIKE 'gsc.import.%');
CREATE POLICY seo_importer_audit_insert ON public.seo_audit_log FOR INSERT TO seo_importer
  WITH CHECK ("entityType" = 'seo_gsc_sync_runs' AND "action" IN ('gsc.import.started','gsc.import.finished','gsc.import.resumed'));
CREATE POLICY seo_rollback_audit_insert ON public.seo_audit_log FOR INSERT TO seo_import_rollback
  WITH CHECK ("entityType" = 'seo_gsc_sync_runs' AND "action" = 'gsc.import.rolled_back');

COMMIT;

-- 6. SEPARATE LIVE ROLE CHANGE (own approval; NOT part of the transaction above). The importer connects with its OWN dedicated login, created by the manual administrator script
--    db/seo/admin_create_import_login.sql (login seo_import_app, member of seo_importer ONLY, WITH INHERIT FALSE, SET TRUE; no password in the file). Nothing is granted to the existing
--    SEO application login or to `postgres`. seo_import_rollback must have NO members after this migration (verify_0005.sql checks this) and is never granted to any application login.
--    INHERIT FALSE: the login holds no privileges unless the app explicitly runs SET LOCAL ROLE seo_importer inside a transaction.
