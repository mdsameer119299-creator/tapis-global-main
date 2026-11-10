-- ADMINISTRATOR-ONLY rollback of ONE Search Console import run. NEVER executed by the application, a deployment or a schedule.
-- Run manually in the SQL Editor (or psql) ONLY after explicit approval, as the role that administers seo_import_rollback (the role that ran 0005).
--
-- SECURITY BOUNDARY (enforced by the database, not by this script's WHERE clauses):
--   * seo_import_rollback has NO usable members at rest, so the application login cannot switch into it.
--   * Step 1 (administrator, trusted) records the target run in seo_import_rollback_authorisation. Only the administrator can write that table.
--   * Step 2 runs as seo_import_rollback. Its RLS policies let it SEE, DELETE and CANCEL only rows of a run that has an authorisation row created by THIS transaction
--     (xmin = current transaction id). The role has no INSERT/UPDATE/DELETE on the authorisation table, so it cannot change the target; a run id it types, a GUC it sets,
--     or an old authorisation row from an earlier transaction authorises nothing. The role block does not even take the id as input: it reads the single authorised row.
--     Even a mistake or a hostile statement inside step 2 therefore cannot touch another run's rows or cancel another run: PostgreSQL filters them out.
--   * Step 3 (administrator) re-checks from outside the restricted role that nothing else changed (counts + hashes of all other rows) and that no usable member remains.
--   * Everything is ONE transaction: any failure aborts it, so nothing is deleted, cancelled, authorised or granted.
-- LIMIT (stated, not hidden): the administrator session itself is trusted. A session that can RESET ROLE to the administrator, or that can GRANT/INSERT as owner, is not restricted by RLS.
-- The boundary protects against mistakes and misuse INSIDE the rollback role; it does not make the administrator less powerful than they already are.
--
-- ONLY EDIT the run id on the line marked <<<. It is the UUID returned by the import start step (also in seo_gsc_sync_runs / seo_audit_log).
BEGIN;

-- Helper (administrator only, lives in pg_temp, vanishes with the session): a fingerprint of EVERYTHING that must not change.
CREATE FUNCTION pg_temp.rb_snapshot(p_run text) RETURNS text LANGUAGE sql AS $f$
  SELECT (SELECT count(*) FROM seo_search_daily WHERE "syncRunId" IS DISTINCT FROM p_run)||'/'||(SELECT count(*) FROM seo_search_performance WHERE "syncRunId" IS DISTINCT FROM p_run)||'/'||
         (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_search_daily t WHERE "syncRunId" IS DISTINCT FROM p_run)||'/'||
         (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_search_performance t WHERE "syncRunId" IS DISTINCT FROM p_run)||'/'||
         (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_gsc_sync_runs t WHERE id <> p_run)||'/'||
         (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_audit_log t WHERE NOT (action = 'gsc.import.rolled_back' AND "entityId" = p_run))||'/'||
         (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_sites t)||'/'||
         (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_oauth_connections t)
$f$;

-- STEP 1 (administrator): validate, then authorise exactly this run for this transaction.
DO $authorise$
DECLARE
  v_run    text := '00000000-0000-0000-0000-000000000000';   -- <<< EDIT: run id to roll back
  v_domain text := 'tapisglobalinternational.com';
  r        record;
BEGIN
  IF v_run !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' OR v_run = '00000000-0000-0000-0000-000000000000' THEN
    RAISE EXCEPTION 'rollback aborted: edit the run id on the <<< line';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('gsc-import:' || v_domain));            -- serialise with import steps
  SELECT id, "siteId", status INTO r FROM seo_gsc_sync_runs WHERE id = v_run AND kind = 'SEARCH_ANALYTICS' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'rollback aborted: run not found'; END IF;
  IF r.status = 'CANCELLED' THEN RAISE EXCEPTION 'rollback aborted: run is already CANCELLED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM seo_sites WHERE id = r."siteId" AND domain = v_domain) THEN RAISE EXCEPTION 'rollback aborted: run belongs to another site'; END IF;
  INSERT INTO seo_import_rollback_authorisation ("runId") VALUES (v_run);        -- valid only inside THIS transaction (policy: xmin = current transaction)
  PERFORM set_config('seo.rollback_before', pg_temp.rb_snapshot(v_run), true);   -- transport only; the final comparison fails closed if it is tampered with
END
$authorise$;

-- STEP 2 (restricted role): the only statements that delete or cancel. The target is the single authorisation row visible to the role in this transaction.
GRANT seo_import_rollback TO CURRENT_USER WITH INHERIT FALSE, SET TRUE;
SET LOCAL ROLE seo_import_rollback;
DO $rollback$
DECLARE
  v_run    text;
  v_domain text := 'tapisglobalinternational.com';
  r        record;
  dp int; dd int;
BEGIN
  SELECT "runId" INTO STRICT v_run FROM seo_import_rollback_authorisation;        -- exactly one authorised run, or the block fails
  PERFORM pg_advisory_xact_lock(hashtext('gsc-import:' || v_domain));
  SELECT id, "siteId", status INTO STRICT r FROM seo_gsc_sync_runs WHERE id = v_run AND kind = 'SEARCH_ANALYTICS' FOR UPDATE;
  IF r.status = 'CANCELLED' THEN RAISE EXCEPTION 'rollback aborted: run is already CANCELLED'; END IF;
  DELETE FROM seo_search_performance WHERE "syncRunId" = v_run; GET DIAGNOSTICS dp = ROW_COUNT;
  DELETE FROM seo_search_daily       WHERE "syncRunId" = v_run; GET DIAGNOSTICS dd = ROW_COUNT;
  IF EXISTS (SELECT 1 FROM seo_search_daily WHERE "syncRunId" = v_run) OR EXISTS (SELECT 1 FROM seo_search_performance WHERE "syncRunId" = v_run) THEN RAISE EXCEPTION 'rollback aborted: rows remain'; END IF;
  UPDATE seo_gsc_sync_runs SET status = 'CANCELLED', "errorCode" = 'ROLLED_BACK', "finishedAt" = CURRENT_TIMESTAMP WHERE id = v_run;
  INSERT INTO seo_audit_log (id, "siteId", "actorType", actor, action, "entityType", "entityId", metadata)
    VALUES (gen_random_uuid()::text, r."siteId", 'ADMIN', 'admin-sql-rollback', 'gsc.import.rolled_back', 'seo_gsc_sync_runs', v_run, jsonb_build_object('deletedDaily', dd, 'deletedPerformance', dp));
  RAISE NOTICE 'rolled back run %: % daily rows and % detail rows deleted', v_run, dd, dp;
END
$rollback$;
RESET ROLE;
REVOKE seo_import_rollback FROM CURRENT_USER;

-- STEP 3 (administrator): independent verification from outside the restricted role.
DO $verify$
DECLARE v_run text; before_s text := current_setting('seo.rollback_before', true);
BEGIN
  SELECT "runId" INTO STRICT v_run FROM seo_import_rollback_authorisation WHERE xmin::text = (pg_current_xact_id()::xid)::text;
  IF before_s IS NULL OR before_s = '' OR pg_temp.rb_snapshot(v_run) IS DISTINCT FROM before_s THEN RAISE EXCEPTION 'rollback aborted: rows outside the authorised run would change'; END IF;
  IF EXISTS (SELECT 1 FROM seo_search_daily WHERE "syncRunId" = v_run) OR EXISTS (SELECT 1 FROM seo_search_performance WHERE "syncRunId" = v_run) THEN RAISE EXCEPTION 'rollback aborted: rows remain'; END IF;
  IF (SELECT status::text FROM seo_gsc_sync_runs WHERE id = v_run) IS DISTINCT FROM 'CANCELLED' THEN RAISE EXCEPTION 'rollback aborted: run is not CANCELLED'; END IF;
  IF (SELECT count(*) FROM seo_audit_log WHERE action = 'gsc.import.rolled_back' AND "entityId" = v_run) <> 1 THEN RAISE EXCEPTION 'rollback aborted: audit entry missing'; END IF;
  IF EXISTS (SELECT 1 FROM pg_auth_members WHERE roleid = 'seo_import_rollback'::regrole AND (set_option OR inherit_option)) THEN
    RAISE EXCEPTION 'rollback aborted: seo_import_rollback still has a usable member (SET or INHERIT); nothing is committed';
  END IF;
END
$verify$;
COMMIT;
