-- ADMINISTRATOR-ONLY, MANUAL. NOT part of any migration. NOT APPLIED. Never run by the deployment or the application.
-- Creates the dedicated LOGIN used by the one-time Search Console import (SEO_IMPORT_DATABASE_URL, Preview only).
-- Prerequisite: migration 0005 applied (roles seo_importer and seo_import_rollback exist) and `postgres` holds ADMIN OPTION on seo_importer (see verify_0005.sql).
--
-- The login:  seo_import_app  - LOGIN, NOSUPERUSER, NOBYPASSRLS, NOCREATEROLE, NOCREATEDB, NOREPLICATION, NOINHERIT, connection limit 3.
-- Membership: seo_importer ONLY (WITH INHERIT FALSE, SET TRUE). It is NOT a member of seo_import_rollback, seo_worker or postgres, and holds no ADMIN OPTION on anything.
-- It owns nothing and has no privileges of its own: it can only `SET LOCAL ROLE seo_importer`, whose privileges are the reviewed column-level grants and RLS policies of 0005.
--
-- NO PASSWORD IS IN THIS FILE. After this script, the password is set by the administrator OUTSIDE chat (Supabase dashboard: Database > Roles > seo_import_app > reset password,
-- or ALTER ROLE seo_import_app PASSWORD '<typed by you>' in the SQL editor) and pasted straight into the Preview-only Vercel variable SEO_IMPORT_DATABASE_URL.
-- Connection-string shape (no scheme or secrets written here): user `seo_import_app.<project-ref>` on the Supabase pooler (transaction mode, port 6543; SET LOCAL ROLE and advisory xact locks are
-- transaction-scoped, so they are safe there), or user `seo_import_app` on the direct database host. The pooler user form must end with the approved project ref.
-- Undo: db/seo/down_import_login.sql.
BEGIN;

DO $guard$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seo_importer') OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seo_import_rollback') THEN
    RAISE EXCEPTION 'migration 0005 has not been applied (roles missing); aborting';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seo_import_app') THEN
    RAISE EXCEPTION 'role seo_import_app already exists; aborting (run down_import_login.sql first if you intend to recreate it)';
  END IF;
END
$guard$;

CREATE ROLE seo_import_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT CONNECTION LIMIT 3;
GRANT seo_importer TO seo_import_app WITH INHERIT FALSE, SET TRUE;
-- Bounded sessions: a stuck import statement cannot hold locks for long.
ALTER ROLE seo_import_app SET statement_timeout = '25s';
ALTER ROLE seo_import_app SET idle_in_transaction_session_timeout = '30s';

-- Post-conditions: abort (rolling everything back) unless the login is exactly what was reviewed.
DO $check$
DECLARE bad text;
BEGIN
  SELECT string_agg(rolname, ',') INTO bad FROM pg_roles
   WHERE rolname = 'seo_import_app' AND (rolsuper OR rolbypassrls OR rolcreaterole OR rolcreatedb OR rolreplication OR rolinherit OR NOT rolcanlogin);
  IF bad IS NOT NULL THEN RAISE EXCEPTION 'unexpected attributes on seo_import_app'; END IF;
  IF EXISTS (SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.roleid JOIN pg_roles u ON u.oid = m.member
              WHERE u.rolname = 'seo_import_app' AND r.rolname <> 'seo_importer') THEN RAISE EXCEPTION 'seo_import_app has a membership other than seo_importer'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.roleid JOIN pg_roles u ON u.oid = m.member
                  WHERE u.rolname = 'seo_import_app' AND r.rolname = 'seo_importer' AND m.set_option AND NOT m.inherit_option AND NOT m.admin_option) THEN RAISE EXCEPTION 'seo_importer membership of seo_import_app is not (SET TRUE, INHERIT FALSE, no ADMIN)'; END IF;
  IF pg_has_role('seo_import_app', 'seo_import_rollback', 'MEMBER') OR pg_has_role('seo_import_app', 'seo_worker', 'MEMBER') OR pg_has_role('seo_import_app', 'postgres', 'MEMBER') THEN RAISE EXCEPTION 'seo_import_app can reach a forbidden role'; END IF;
END
$check$;

COMMIT;
