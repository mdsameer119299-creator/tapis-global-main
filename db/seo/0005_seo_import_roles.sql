-- 0005: two dedicated, least-privilege roles for the one-time Search Console 90-day import, with database-enforced row scope.
-- PROPOSED, NOT APPLIED. Additive: creates 2 NOLOGIN roles, ONE new table (the rollback authorisation, see 2), ONE partial unique index on seo_gsc_sync_runs (see 4), grants and RLS policies.
-- It changes nothing for seo_worker, postgres, anon, authenticated or any existing policy, table, column or row. No data is read or written.
--
--   seo_importer         import steps (start / daily / windows / finish / resume).  NO delete anywhere.  The only role the application may ever hold.
--                        Database-enforced scope: approved site, approved date range (2026-08-11..2026-11-08), rows only under an approved RUNNING import run of that same site.
--   seo_import_rollback  rollback of ONE run.  The ONLY role with DELETE, only on the two search tables, and ONLY on rows of the run that the administrator
--                        authorised IN THE CURRENT TRANSACTION (table seo_import_rollback_authorisation, see 2).  It is NEVER granted to the application login.
--
-- Neither role has any privilege on seo_oauth_states, seo_sitemap_status, seo_ga4_*, seo_recommendations, seo_keywords,
-- seo_crawl_*, seo_technical_issues, seo_agent_runs, seo_approval_requests or any other table. No INSERT/UPDATE/DELETE on seo_sites or
-- seo_oauth_connections. The oauth ciphertext is readable only because the import must refresh an access token (same as the dry-run).
-- Membership of seo_importer (step 7) is a SEPARATE live role change that needs its own approval; without it nobody can SET ROLE to it.
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
  IF to_regclass('public.seo_import_rollback_authorisation') IS NOT NULL THEN
    RAISE EXCEPTION '0005 aborted: table seo_import_rollback_authorisation already exists';
  END IF;
  IF to_regclass('public.seo_gsc_sync_runs_import_single_active_uq') IS NOT NULL THEN
    RAISE EXCEPTION '0005 aborted: index seo_gsc_sync_runs_import_single_active_uq already exists';
  END IF;
END $$;

-- 1. Roles: no login, no inherit, no superuser / createdb / createrole / replication / bypassrls.
CREATE ROLE seo_importer        NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
CREATE ROLE seo_import_rollback NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT USAGE ON SCHEMA public TO seo_importer, seo_import_rollback;

-- 2. Rollback authorisation: a row here authorises rollback of ONE run, and ONLY inside the transaction that inserted it.
--    Only the table owner / administrator can insert (seo_import_rollback has SELECT only). The rollback policies below accept a run id only if it appears in a row
--    whose xmin equals the CURRENT top-level transaction id, so a row left behind by an earlier transaction authorises nothing, and the rollback role cannot create,
--    change or delete a row (no INSERT / UPDATE / DELETE privilege) and therefore cannot change the target.
CREATE TABLE public.seo_import_rollback_authorisation (
  "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "runId"        TEXT        NOT NULL,
  "authorisedBy" TEXT        NOT NULL DEFAULT session_user,
  "authorisedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "seo_import_rollback_authorisation_pkey" PRIMARY KEY ("id")
);
ALTER TABLE public.seo_import_rollback_authorisation ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.seo_import_rollback_authorisation FROM PUBLIC;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')          THEN EXECUTE 'REVOKE ALL ON public.seo_import_rollback_authorisation FROM anon'; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN EXECUTE 'REVOKE ALL ON public.seo_import_rollback_authorisation FROM authenticated'; END IF;
END $$;
GRANT SELECT ON public.seo_import_rollback_authorisation TO seo_import_rollback;
CREATE POLICY seo_rollback_auth_select ON public.seo_import_rollback_authorisation FOR SELECT TO seo_import_rollback
  USING (xmin::text = (pg_current_xact_id()::xid)::text);

-- 3. Site + connection: exactly one site and one GSC connection, read-only, only the columns the import reads.
GRANT SELECT ("id","domain") ON public.seo_sites TO seo_importer, seo_import_rollback;
CREATE POLICY seo_importer_site_read ON public.seo_sites FOR SELECT TO seo_importer, seo_import_rollback
  USING ("domain" = 'tapisglobalinternational.com');

GRANT SELECT ("siteId","provider","state","propertyUrl","revokedAt","refreshTokenCipher","refreshTokenIv","refreshTokenTag","keyVersion")
  ON public.seo_oauth_connections TO seo_importer;
CREATE POLICY seo_importer_conn_read ON public.seo_oauth_connections FOR SELECT TO seo_importer
  USING ("provider" = 'GSC' AND "propertyUrl" = 'sc-domain:tapisglobalinternational.com'
         AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'));

-- 4. Sync runs.
--    Importer: sees only the approved site's SEARCH_ANALYTICS runs; may INSERT a RUNNING MANUAL run for the exact approved range; may UPDATE bookkeeping columns of ITS kind of
--    run only (approved site, MANUAL, exact range). "THE approved run" is unambiguous because a partial unique index (below) allows at most ONE QUEUED/RUNNING/PARTIAL/SUCCEEDED run
--    for that site and range at a time (a policy cannot express this: PostgreSQL rejects a policy that reads its own table). It is race-proof, unlike a policy check.
--    This is the only change to an existing table: one new index, no column, constraint, row or privilege change; it fails (and aborts the migration) if a conflicting run already exists.
CREATE UNIQUE INDEX seo_gsc_sync_runs_import_single_active_uq ON public.seo_gsc_sync_runs ("siteId")
  WHERE "kind" = 'SEARCH_ANALYTICS' AND "trigger" = 'MANUAL' AND "rangeStart" = DATE '2026-08-11' AND "rangeEnd" = DATE '2026-11-08'
    AND "status" IN ('QUEUED','RUNNING','PARTIAL','SUCCEEDED');
GRANT SELECT, INSERT ON public.seo_gsc_sync_runs TO seo_importer;
GRANT UPDATE ("status","rowsFetched","rowsWritten","errorCode","errorMessage","finishedAt") ON public.seo_gsc_sync_runs TO seo_importer;
CREATE POLICY seo_importer_runs_select ON public.seo_gsc_sync_runs FOR SELECT TO seo_importer
  USING ("kind" = 'SEARCH_ANALYTICS' AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'));
CREATE POLICY seo_importer_runs_insert ON public.seo_gsc_sync_runs FOR INSERT TO seo_importer
  WITH CHECK ("kind" = 'SEARCH_ANALYTICS' AND "trigger" = 'MANUAL' AND "status" = 'RUNNING'
              AND "rangeStart" = DATE '2026-08-11' AND "rangeEnd" = DATE '2026-11-08' AND "rowsFetched" = 0 AND "rowsWritten" = 0
              AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'));
CREATE POLICY seo_importer_runs_update ON public.seo_gsc_sync_runs FOR UPDATE TO seo_importer
  USING ("kind" = 'SEARCH_ANALYTICS' AND "trigger" = 'MANUAL' AND "rangeStart" = DATE '2026-08-11' AND "rangeEnd" = DATE '2026-11-08'
         AND "status" IN ('RUNNING','PARTIAL')
         AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'))
  WITH CHECK ("kind" = 'SEARCH_ANALYTICS' AND "trigger" = 'MANUAL' AND "rangeStart" = DATE '2026-08-11' AND "rangeEnd" = DATE '2026-11-08'
              AND "status" IN ('RUNNING','SUCCEEDED','PARTIAL','FAILED')
              AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'));
--    Rollback role: sees and may cancel ONLY the run authorised in this transaction (never RUNNING/SUCCEEDED; only status/errorCode/finishedAt).
GRANT SELECT ON public.seo_gsc_sync_runs TO seo_import_rollback;
GRANT UPDATE ("status","errorCode","finishedAt") ON public.seo_gsc_sync_runs TO seo_import_rollback;
CREATE POLICY seo_rollback_runs_select ON public.seo_gsc_sync_runs FOR SELECT TO seo_import_rollback
  USING ("kind" = 'SEARCH_ANALYTICS' AND "id" IN (SELECT "runId" FROM public.seo_import_rollback_authorisation));
CREATE POLICY seo_rollback_runs_update ON public.seo_gsc_sync_runs FOR UPDATE TO seo_import_rollback
  USING ("kind" = 'SEARCH_ANALYTICS' AND "status" IN ('RUNNING','PARTIAL','SUCCEEDED','FAILED','CANCELLED')
         AND "id" IN (SELECT "runId" FROM public.seo_import_rollback_authorisation)
         AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'))
  WITH CHECK ("kind" = 'SEARCH_ANALYTICS' AND "status" = 'CANCELLED'
              AND "id" IN (SELECT "runId" FROM public.seo_import_rollback_authorisation)
              AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'));

-- 5. Search tables.
--    Importer: SELECT only the approved site's rows (needed for the empty-table guard, conflict classification and resume) and INSERT only rows that are
--    (a) dated inside the approved range, (b) for the approved site, (c) attached to an EXISTING run of that SAME site that is the approved import run:
--    SEARCH_ANALYTICS, MANUAL, RUNNING, exact approved range. No UPDATE, no DELETE.
--    Rollback: SELECT and DELETE only rows of the run authorised in this transaction (approved site).
GRANT SELECT, INSERT ON public.seo_search_daily, public.seo_search_performance TO seo_importer;
GRANT SELECT, DELETE ON public.seo_search_daily, public.seo_search_performance TO seo_import_rollback;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['seo_search_daily','seo_search_performance']
  LOOP
    EXECUTE format($p$CREATE POLICY seo_importer_select ON public.%1$I FOR SELECT TO seo_importer
      USING ("siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'))$p$, t);
    EXECUTE format($p$CREATE POLICY seo_importer_insert ON public.%1$I FOR INSERT TO seo_importer
      WITH CHECK ("date" BETWEEN DATE '2026-08-11' AND DATE '2026-11-08'
                  AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com')
                  AND "syncRunId" IS NOT NULL
                  AND EXISTS (SELECT 1 FROM public.seo_gsc_sync_runs r
                               WHERE r."id" = public.%1$I."syncRunId" AND r."siteId" = public.%1$I."siteId"
                                 AND r."kind" = 'SEARCH_ANALYTICS' AND r."trigger" = 'MANUAL' AND r."status" = 'RUNNING'
                                 AND r."rangeStart" = DATE '2026-08-11' AND r."rangeEnd" = DATE '2026-11-08'))$p$, t);
    EXECUTE format($p$CREATE POLICY seo_rollback_select ON public.%1$I FOR SELECT TO seo_import_rollback
      USING ("syncRunId" IN (SELECT "runId" FROM public.seo_import_rollback_authorisation)
             AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'))$p$, t);
    EXECUTE format($p$CREATE POLICY seo_rollback_delete ON public.%1$I FOR DELETE TO seo_import_rollback
      USING ("syncRunId" IN (SELECT "runId" FROM public.seo_import_rollback_authorisation)
             AND "siteId" IN (SELECT "id" FROM public.seo_sites WHERE "domain" = 'tapisglobalinternational.com'))$p$, t);
  END LOOP;
END $$;

-- 6. Audit log: append-only, import events only; the rollback role sees and writes only the entry of the run authorised in this transaction.
GRANT SELECT, INSERT ON public.seo_audit_log TO seo_importer, seo_import_rollback;
CREATE POLICY seo_importer_audit_select ON public.seo_audit_log FOR SELECT TO seo_importer
  USING ("entityType" = 'seo_gsc_sync_runs' AND "action" LIKE 'gsc.import.%');
CREATE POLICY seo_importer_audit_insert ON public.seo_audit_log FOR INSERT TO seo_importer
  WITH CHECK ("entityType" = 'seo_gsc_sync_runs' AND "action" IN ('gsc.import.started','gsc.import.finished','gsc.import.resumed'));
CREATE POLICY seo_rollback_audit_select ON public.seo_audit_log FOR SELECT TO seo_import_rollback
  USING ("entityType" = 'seo_gsc_sync_runs' AND "entityId" IN (SELECT "runId" FROM public.seo_import_rollback_authorisation));
CREATE POLICY seo_rollback_audit_insert ON public.seo_audit_log FOR INSERT TO seo_import_rollback
  WITH CHECK ("entityType" = 'seo_gsc_sync_runs' AND "action" = 'gsc.import.rolled_back'
              AND "entityId" IN (SELECT "runId" FROM public.seo_import_rollback_authorisation));

COMMIT;

-- 7. SEPARATE LIVE ROLE CHANGE (own approval; NOT part of the transaction above). The importer connects with its OWN dedicated login, created by the manual administrator script
--    db/seo/admin_create_import_login.sql (login seo_import_app, member of seo_importer ONLY, WITH INHERIT FALSE, SET TRUE; no password in the file). Nothing is granted to the existing
--    SEO application login or to `postgres`. seo_import_rollback must have NO members after this migration (verify_0005.sql checks this) and is never granted to any application login.
--    INHERIT FALSE: the login holds no privileges unless the app explicitly runs SET LOCAL ROLE seo_importer inside a transaction.
