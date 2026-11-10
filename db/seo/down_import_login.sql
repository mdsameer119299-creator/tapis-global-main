-- ADMINISTRATOR-ONLY, MANUAL. NOT APPLIED. Removes the dedicated import login created by admin_create_import_login.sql. Does not touch 0005, any table, any other role, or any data.
-- Also remove (or blank) the Preview variable SEO_IMPORT_DATABASE_URL in Vercel; the importer then refuses with "not configured". Safe to run twice.
BEGIN;
DO $down$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seo_import_app') THEN
    RAISE NOTICE 'seo_import_app does not exist; nothing to do';
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seo_import_app' AND (rolsuper OR rolbypassrls)) THEN RAISE EXCEPTION 'unexpected: seo_import_app is privileged; refusing'; END IF;
  EXECUTE 'REVOKE seo_importer FROM seo_import_app';
  EXECUTE 'DROP ROLE seo_import_app';   -- fails (and rolls back) if it owns objects or holds privileges; it should own nothing
END
$down$;
COMMIT;
