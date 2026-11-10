-- READ-ONLY verification for 0005. Expected: both roles exist NOLOGIN/NOINHERIT/no bypassrls; the importer has no DELETE/UPDATE on search tables,
-- only the rollback role has DELETE (two tables); neither role has anything outside the 6 tables listed.
SELECT rolname, rolcanlogin, rolinherit, rolsuper, rolbypassrls FROM pg_roles WHERE rolname IN ('seo_importer','seo_import_rollback') ORDER BY 1;
SELECT grantee, table_name, string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type) AS table_privs FROM information_schema.role_table_grants
 WHERE grantee IN ('seo_importer','seo_import_rollback') AND table_schema='public' GROUP BY 1,2 ORDER BY 1,2;
SELECT grantee, table_name, string_agg(column_name||':'||privilege_type, ',' ORDER BY column_name) AS column_privs FROM information_schema.column_privileges
 WHERE grantee IN ('seo_importer','seo_import_rollback') AND table_schema='public' GROUP BY 1,2 ORDER BY 1,2;
SELECT tablename, policyname, cmd, roles::text FROM pg_policies WHERE schemaname='public' AND ('seo_importer' = ANY(roles) OR 'seo_import_rollback' = ANY(roles)) ORDER BY 1,2;   -- expected: 15 rows
-- Memberships: seo_import_rollback must have NO members at rest; the creating admin should hold ADMIN OPTION (needed by admin_rollback_import_run.sql).
SELECT r.rolname AS role, m.rolname AS member, a.admin_option, a.inherit_option, a.set_option, g.rolname AS granted_by
  FROM pg_auth_members a JOIN pg_roles r ON r.oid=a.roleid JOIN pg_roles m ON m.oid=a.member JOIN pg_roles g ON g.oid=a.grantor
 WHERE r.rolname IN ('seo_importer','seo_import_rollback') ORDER BY 1,2;
SELECT 'rollback_role_usable_members_at_rest (must be 0)' AS check, count(*) AS n FROM pg_auth_members WHERE roleid='seo_import_rollback'::regrole AND (set_option OR inherit_option);
