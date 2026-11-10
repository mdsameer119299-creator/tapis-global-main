-- READ-ONLY verification for 0005. Expected: both roles exist NOLOGIN/NOINHERIT/no bypassrls; the importer has no DELETE/UPDATE on search tables,
-- only the rollback role has DELETE (two tables); neither role has anything outside the 6 tables listed.
SELECT rolname, rolcanlogin, rolinherit, rolsuper, rolbypassrls FROM pg_roles WHERE rolname IN ('seo_importer','seo_import_rollback') ORDER BY 1;
SELECT grantee, table_name, string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type) AS table_privs FROM information_schema.role_table_grants
 WHERE grantee IN ('seo_importer','seo_import_rollback') AND table_schema='public' GROUP BY 1,2 ORDER BY 1,2;
SELECT grantee, table_name, string_agg(column_name||':'||privilege_type, ',' ORDER BY column_name) AS column_privs FROM information_schema.column_privileges
 WHERE grantee IN ('seo_importer','seo_import_rollback') AND table_schema='public' GROUP BY 1,2 ORDER BY 1,2;
SELECT tablename, policyname, cmd, roles::text FROM pg_policies WHERE schemaname='public' AND 'seo_importer' = ANY(roles) OR 'seo_import_rollback' = ANY(roles) ORDER BY 1,2;
