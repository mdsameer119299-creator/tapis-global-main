-- Reverts 0005. Never auto-run. Removes only the two import roles, their grants and their policies.
BEGIN;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname='public' AND policyname IN
    ('seo_importer_site_read','seo_importer_conn_read','seo_importer_runs_select','seo_importer_runs_insert','seo_importer_runs_update','seo_rollback_runs_update',
     'seo_importer_select','seo_importer_insert','seo_rollback_delete','seo_importer_audit_select','seo_importer_audit_insert','seo_rollback_audit_insert')
  LOOP EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename); END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM seo_importer, seo_import_rollback;
REVOKE ALL ON SCHEMA public FROM seo_importer, seo_import_rollback;
DROP ROLE seo_importer; DROP ROLE seo_import_rollback;
COMMIT;
