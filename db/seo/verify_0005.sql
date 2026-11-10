-- READ-ONLY verification for 0005. Changes nothing. Expected results are in the comments.
-- 1. Roles: both exist, NOLOGIN / NOINHERIT / no superuser / no bypassrls / no createrole.  Expect 2 rows, all flags f.
SELECT rolname, rolcanlogin, rolinherit, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolreplication FROM pg_roles WHERE rolname IN ('seo_importer','seo_import_rollback') ORDER BY 1;
-- 2. Table privileges.  Expect: importer SELECT,INSERT on the 4 data tables (no UPDATE/DELETE on search tables); rollback DELETE only on the two search tables; rollback SELECT on seo_import_rollback_authorisation; nothing else.
SELECT grantee, table_name, string_agg(DISTINCT privilege_type, ',' ORDER BY privilege_type) AS table_privs FROM information_schema.role_table_grants
 WHERE grantee IN ('seo_importer','seo_import_rollback') AND table_schema='public' GROUP BY 1,2 ORDER BY 1,2;
-- 3. Column privileges (sites: id,domain; oauth: 9 importer-only columns; runs UPDATE: importer 6 columns, rollback 3 columns).
SELECT grantee, table_name, string_agg(column_name||':'||privilege_type, ',' ORDER BY column_name) AS column_privs FROM information_schema.column_privileges
 WHERE grantee IN ('seo_importer','seo_import_rollback') AND table_schema='public' GROUP BY 1,2 ORDER BY 1,2;
-- 4. Policies.  Expect exactly 20 rows (see the policy names in 0005).
SELECT tablename, policyname, cmd, roles::text FROM pg_policies WHERE schemaname='public' AND ('seo_importer' = ANY(roles) OR 'seo_import_rollback' = ANY(roles)) ORDER BY 1,2;
SELECT 'policies_for_the_two_roles (must be 20)' AS check, count(*) AS n FROM pg_policies WHERE schemaname='public' AND ('seo_importer' = ANY(roles) OR 'seo_import_rollback' = ANY(roles));
-- 5. Authorisation table: RLS on, no access for PUBLIC / anon / authenticated / seo_worker / seo_importer.  Expect rls t; the only grantee row is seo_import_rollback SELECT (owner excluded).
SELECT relname, relrowsecurity AS rls_enabled FROM pg_class WHERE oid = 'public.seo_import_rollback_authorisation'::regclass;
-- 5a. HARD check: the named roles (and PUBLIC, grantee oid 0) hold NO privilege at all on the authorisation table (aclexplode also covers TRUNCATE/REFERENCES/TRIGGER/MAINTAIN). Expect 0 for each row.
SELECT 'authorisation_table_privileges_held_by_' || g.label || ' (must be 0)' AS check, count(a.*) AS n
  FROM (VALUES ('PUBLIC',0::oid),('service_role',to_regrole('service_role')::oid),('anon',to_regrole('anon')::oid),('authenticated',to_regrole('authenticated')::oid),
               ('seo_importer',to_regrole('seo_importer')::oid),('seo_worker',to_regrole('seo_worker')::oid)) AS g(label, oid)
  LEFT JOIN LATERAL (SELECT x.* FROM pg_class c, aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) x
                      WHERE c.oid='public.seo_import_rollback_authorisation'::regclass AND x.grantee = g.oid AND g.oid IS NOT NULL) a ON true
 GROUP BY g.label ORDER BY 1;
-- 5c. INFORMATIONAL only (never a failure): every grantee on the table other than the owner. Expect only seo_import_rollback SELECT. Unrelated Supabase default privileges on OTHER tables are not examined here.
SELECT 'authorisation_table_other_grantees (info)' AS check, pg_get_userbyid(x.grantee) AS grantee, x.privilege_type
  FROM pg_class c, aclexplode(c.relacl) x WHERE c.oid='public.seo_import_rollback_authorisation'::regclass AND x.grantee <> c.relowner ORDER BY 2,3;
SELECT 'authorisation_rows_left_behind (informational; each is inert outside the transaction that created it)' AS check, count(*) AS n FROM public.seo_import_rollback_authorisation;
-- 5b. The single-active-run index (the only change to an existing table).  Expect 1 row.
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND indexname='seo_gsc_sync_runs_import_single_active_uq';
-- 6. Memberships: seo_import_rollback must have NO usable members at rest; the creating admin should hold ADMIN OPTION (needed by admin_rollback_import_run.sql).
SELECT r.rolname AS role, m.rolname AS member, a.admin_option, a.inherit_option, a.set_option, g.rolname AS granted_by
  FROM pg_auth_members a JOIN pg_roles r ON r.oid=a.roleid JOIN pg_roles m ON m.oid=a.member JOIN pg_roles g ON g.oid=a.grantor
 WHERE r.rolname IN ('seo_importer','seo_import_rollback') ORDER BY 1,2;
SELECT 'rollback_role_usable_members_at_rest (must be 0)' AS check, count(*) AS n FROM pg_auth_members WHERE roleid='seo_import_rollback'::regrole AND (set_option OR inherit_option);
