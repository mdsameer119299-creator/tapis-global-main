-- Reverts 0005. Never auto-run. Removes only the two import roles, the rollback-authorisation table, the one partial unique index, their grants and their policies. Touches no other role, table, column or row.
-- If the dedicated login exists, run down_import_login.sql FIRST. Deleting the authorisation table also deletes its (inert) history of past rollback authorisations.
BEGIN;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies
            WHERE schemaname='public' AND tablename <> 'seo_import_rollback_authorisation' AND roles && ARRAY['seo_importer','seo_import_rollback']::name[]
              AND policyname IN
    ('seo_importer_site_read','seo_importer_conn_read','seo_importer_runs_select','seo_importer_runs_insert','seo_importer_runs_update','seo_rollback_runs_select','seo_rollback_runs_update',
     'seo_importer_select','seo_importer_insert','seo_rollback_select','seo_rollback_delete','seo_importer_audit_select','seo_importer_audit_insert','seo_rollback_audit_select','seo_rollback_audit_insert')
  LOOP EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename); END LOOP;
END $$;
DROP TABLE IF EXISTS public.seo_import_rollback_authorisation;   -- its policy goes with it
DROP INDEX IF EXISTS public.seo_gsc_sync_runs_import_single_active_uq;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM seo_importer, seo_import_rollback;
REVOKE ALL ON SCHEMA public FROM seo_importer, seo_import_rollback;
DROP ROLE seo_importer; DROP ROLE seo_import_rollback;
COMMIT;
