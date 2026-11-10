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
-- 5. Authorisation table: RLS on; ACL must be exactly owner + seo_import_rollback SELECT (no grant option); any other table or column ACL is a FAIL (see 5a).
SELECT relname, relrowsecurity AS rls_enabled FROM pg_class WHERE oid = 'public.seo_import_rollback_authorisation'::regclass;
-- 5a. HARD CHECKS (read-only; each row ends in PASS or FAIL; any FAIL means: do not proceed). All use aclexplode(coalesce(relacl, acldefault('r', owner))), so a NULL ACL is read as "owner only",
--      every PostgreSQL 17 table privilege type is covered (SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN) and PUBLIC is grantee 0.
--      Allowed ACL on public.seo_import_rollback_authorisation: (1) the owner, any privilege; (2) seo_import_rollback with SELECT only and WITHOUT grant option. EVERYTHING else is unexpected, whoever the role is.
--      The owner is expected to be `postgres` in the target project; it is checked against the owner of seo_sites (the project's actual administrator) and against the Supabase API roles / import roles.
WITH t AS (SELECT c.oid, c.relowner, c.relrowsecurity, coalesce(c.relacl, acldefault('r', c.relowner)) AS acl FROM pg_class c WHERE c.oid = 'public.seo_import_rollback_authorisation'::regclass),
a AS (SELECT x.grantee, x.privilege_type, x.is_grantable, t.relowner FROM t, aclexplode(t.acl) x),
unexpected AS (SELECT * FROM a WHERE grantee <> relowner
                 AND NOT coalesce(grantee = to_regrole('seo_import_rollback')::oid AND privilege_type = 'SELECT' AND NOT is_grantable, false)),
colacl AS (SELECT count(*) AS n FROM pg_attribute at, t WHERE at.attrelid = t.oid AND at.attnum > 0 AND NOT at.attisdropped AND at.attacl IS NOT NULL),
rb AS (SELECT count(*) FILTER (WHERE privilege_type = 'SELECT' AND NOT is_grantable) AS good, count(*) AS total FROM a WHERE grantee = to_regrole('seo_import_rollback')::oid),
own AS (SELECT pg_get_userbyid(t.relowner) AS owner,
               (t.relowner = (SELECT relowner FROM pg_class WHERE oid = to_regclass('public.seo_sites'))
                AND pg_get_userbyid(t.relowner) NOT IN ('seo_importer','seo_import_rollback','anon','authenticated','service_role','seo_worker','PUBLIC')) AS ok FROM t),
chk AS (
  SELECT 1 AS ord, 'authorisation_table_unexpected_acl_entries (must be 0)' AS name, (SELECT count(*) FROM unexpected)::text AS value, (SELECT count(*) FROM unexpected) = 0 AS ok
  UNION ALL SELECT 2, 'authorisation_table_column_level_acl_entries (must be 0)', (SELECT n FROM colacl)::text, (SELECT n FROM colacl) = 0
  UNION ALL SELECT 3, 'seo_import_rollback_privileges_on_authorisation (must be exactly SELECT, no grant option)', (SELECT good||' ok / '||total||' total' FROM rb), (SELECT good = 1 AND total = 1 FROM rb)
  UNION ALL SELECT 4, 'authorisation_table_owner (the project administrator; expected postgres in the target project)', (SELECT owner FROM own), (SELECT ok FROM own)
  UNION ALL SELECT 5, 'authorisation_table_row_level_security_enabled (must be true)', (SELECT relrowsecurity::text FROM t), (SELECT relrowsecurity FROM t)
  UNION ALL SELECT 6, 'authorisation_table_privileges_held_by_' || g.label || ' (must be 0)',
         (SELECT count(*) FROM a WHERE a.grantee = g.oid AND g.oid IS NOT NULL)::text, (SELECT count(*) FROM a WHERE a.grantee = g.oid AND g.oid IS NOT NULL) = 0
    FROM (VALUES ('PUBLIC',0::oid),('service_role',to_regrole('service_role')::oid),('anon',to_regrole('anon')::oid),('authenticated',to_regrole('authenticated')::oid),
                 ('seo_importer',to_regrole('seo_importer')::oid),('seo_worker',to_regrole('seo_worker')::oid)) AS g(label, oid))
SELECT name AS check, value, CASE WHEN ok IS TRUE THEN 'PASS' ELSE 'FAIL' END AS result FROM chk
UNION ALL SELECT 'AUTHORISATION_TABLE_ACL_OVERALL (every check above must be PASS)', count(*) FILTER (WHERE ok IS NOT TRUE)::text || ' failing', CASE WHEN count(*) FILTER (WHERE ok IS NOT TRUE) = 0 THEN 'PASS' ELSE 'FAIL' END FROM chk
ORDER BY 1;
-- 5c. DIAGNOSTIC INFO ONLY (not itself a pass/fail): every unexpected table-level grantee and privilege, plus any column-level ACL entry. Expect the single row 'none'.
WITH t AS (SELECT c.oid, c.relowner, coalesce(c.relacl, acldefault('r', c.relowner)) AS acl FROM pg_class c WHERE c.oid = 'public.seo_import_rollback_authorisation'::regclass)
SELECT 'INFO unexpected_authorisation_acl' AS check, coalesce(string_agg(d, '; ' ORDER BY d), 'none') AS detail FROM (
  SELECT 'table: ' || CASE WHEN x.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END || ' ' || x.privilege_type || CASE WHEN x.is_grantable THEN ' WITH GRANT OPTION' ELSE '' END AS d
    FROM t, aclexplode(t.acl) x WHERE x.grantee <> t.relowner AND NOT coalesce(x.grantee = to_regrole('seo_import_rollback')::oid AND x.privilege_type = 'SELECT' AND NOT x.is_grantable, false)
  UNION ALL
  SELECT 'column ' || at.attname || ': ' || CASE WHEN x.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(x.grantee) END || ' ' || x.privilege_type
    FROM t, pg_attribute at, aclexplode(at.attacl) x WHERE at.attrelid = t.oid AND at.attnum > 0 AND NOT at.attisdropped AND at.attacl IS NOT NULL) z;
-- 5d. INFO: server version (MAINTAIN is a PostgreSQL 17 privilege; the checks above are type-agnostic, so it is covered on 16 and 17 alike).
SELECT 'INFO server_version' AS check, current_setting('server_version') AS detail;
SELECT 'authorisation_rows_left_behind (informational; each is inert outside the transaction that created it)' AS check, count(*) AS n FROM public.seo_import_rollback_authorisation;
-- 5b. The single-active-run index (the only change to an existing table).  Expect 1 row.
SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND indexname='seo_gsc_sync_runs_import_single_active_uq';
-- 6. Memberships: seo_import_rollback must have NO usable members at rest; the creating admin should hold ADMIN OPTION (needed by admin_rollback_import_run.sql).
SELECT r.rolname AS role, m.rolname AS member, a.admin_option, a.inherit_option, a.set_option, g.rolname AS granted_by
  FROM pg_auth_members a JOIN pg_roles r ON r.oid=a.roleid JOIN pg_roles m ON m.oid=a.member JOIN pg_roles g ON g.oid=a.grantor
 WHERE r.rolname IN ('seo_importer','seo_import_rollback') ORDER BY 1,2;
SELECT 'rollback_role_usable_members_at_rest (must be 0)' AS check, count(*) AS n FROM pg_auth_members WHERE roleid='seo_import_rollback'::regrole AND (set_option OR inherit_option);
