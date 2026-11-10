-- ADMINISTRATOR-ONLY rollback of ONE Search Console import run. NEVER executed by the application, a deployment or a schedule.
-- Run manually in the SQL Editor (or psql) ONLY after explicit approval, as the role that administers seo_import_rollback (the role that ran 0005).
--
-- How DELETE stays away from the application connection:
--   * seo_import_rollback has NO usable members at rest (nobody can SET ROLE to it or inherit it; only the administrator's bare ADMIN OPTION exists),
--     so the application login cannot switch into it.
--   * This script grants it to the running admin INSIDE ONE TRANSACTION, uses it, revokes it, and checks it is gone BEFORE COMMIT.
--     Nobody else can observe the temporary membership (uncommitted), and if anything fails the whole transaction aborts: nothing deleted, nothing granted.
--   * Only rows carrying this run's syncRunId are deleted, only from the two search tables; every other row is proven byte-identical afterwards.
--
-- ONLY EDIT the run id on the line marked <<<. It is the UUID returned by the import start step (also in seo_gsc_sync_runs / seo_audit_log).
BEGIN;
GRANT seo_import_rollback TO CURRENT_USER WITH INHERIT FALSE, SET TRUE;
SET LOCAL ROLE seo_import_rollback;

DO $rollback$
DECLARE
  v_run    text := '00000000-0000-0000-0000-000000000000';   -- <<< EDIT: run id to roll back
  v_domain text := 'tapisglobalinternational.com';
  r        record;
  before_s text; after_s text; dp int; dd int;
  others   text := $q$SELECT (SELECT count(*) FROM seo_search_daily WHERE "syncRunId" IS DISTINCT FROM $1)||'/'||(SELECT count(*) FROM seo_search_performance WHERE "syncRunId" IS DISTINCT FROM $1)||'/'||
                    (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_search_daily t WHERE "syncRunId" IS DISTINCT FROM $1)||'/'||
                    (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_search_performance t WHERE "syncRunId" IS DISTINCT FROM $1)$q$;
BEGIN
  IF v_run !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' OR v_run = '00000000-0000-0000-0000-000000000000' THEN
    RAISE EXCEPTION 'rollback aborted: edit the run id on the <<< line';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('gsc-import:' || v_domain));            -- serialise with import steps
  SELECT id, "siteId", status INTO r FROM seo_gsc_sync_runs WHERE id = v_run AND kind = 'SEARCH_ANALYTICS' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'rollback aborted: run not found'; END IF;
  IF r.status = 'CANCELLED' THEN RAISE EXCEPTION 'rollback aborted: run is already CANCELLED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM seo_sites WHERE id = r."siteId" AND domain = v_domain) THEN RAISE EXCEPTION 'rollback aborted: run belongs to another site'; END IF;

  EXECUTE others INTO before_s USING v_run;
  DELETE FROM seo_search_performance WHERE "syncRunId" = v_run; GET DIAGNOSTICS dp = ROW_COUNT;
  DELETE FROM seo_search_daily       WHERE "syncRunId" = v_run; GET DIAGNOSTICS dd = ROW_COUNT;
  EXECUTE others INTO after_s USING v_run;
  IF after_s IS DISTINCT FROM before_s THEN RAISE EXCEPTION 'rollback aborted: rows belonging to other runs would change'; END IF;
  IF EXISTS (SELECT 1 FROM seo_search_daily WHERE "syncRunId" = v_run) OR EXISTS (SELECT 1 FROM seo_search_performance WHERE "syncRunId" = v_run) THEN RAISE EXCEPTION 'rollback aborted: rows remain'; END IF;

  UPDATE seo_gsc_sync_runs SET status = 'CANCELLED', "errorCode" = 'ROLLED_BACK', "finishedAt" = CURRENT_TIMESTAMP WHERE id = v_run;
  INSERT INTO seo_audit_log (id, "siteId", "actorType", actor, action, "entityType", "entityId", metadata)
    VALUES (gen_random_uuid()::text, r."siteId", 'ADMIN', 'admin-sql-rollback', 'gsc.import.rolled_back', 'seo_gsc_sync_runs', v_run, jsonb_build_object('deletedDaily', dd, 'deletedPerformance', dp));
  RAISE NOTICE 'rolled back run %: % daily rows and % detail rows deleted; all other rows unchanged', v_run, dd, dp;
END
$rollback$;

RESET ROLE;
REVOKE seo_import_rollback FROM CURRENT_USER;
DO $check$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid = 'seo_import_rollback'::regrole AND (set_option OR inherit_option)) THEN
    RAISE EXCEPTION 'rollback aborted: seo_import_rollback still has a usable member (SET or INHERIT); nothing is committed';
  END IF;
END
$check$;
COMMIT;
