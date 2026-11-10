-- READ-ONLY checks for the dedicated import login. Expected values are in the comments. Changes nothing.
SELECT rolname, rolcanlogin, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolreplication, rolinherit, rolconnlimit, rolconfig
  FROM pg_roles WHERE rolname = 'seo_import_app';                       -- login t; everything else f; rolinherit f; connlimit 3; config statement_timeout + idle_in_transaction_session_timeout
SELECT r.rolname AS role_granted, m.set_option, m.inherit_option, m.admin_option
  FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.roleid JOIN pg_roles u ON u.oid = m.member
 WHERE u.rolname = 'seo_import_app';                                    -- exactly one row: seo_importer | t | f | f
SELECT pg_has_role('seo_import_app','seo_import_rollback','MEMBER') AS in_rollback,
       pg_has_role('seo_import_app','seo_worker','MEMBER')          AS in_worker,
       pg_has_role('seo_import_app','postgres','MEMBER')            AS in_postgres;   -- f | f | f
SELECT count(*) AS memberships_of_rollback_role_usable_by_anyone
  FROM pg_auth_members m WHERE m.roleid = 'seo_import_rollback'::regrole AND (m.set_option OR m.inherit_option);   -- 0
SELECT count(*) AS objects_owned_by_login FROM pg_class c WHERE c.relowner = 'seo_import_app'::regrole;               -- 0
