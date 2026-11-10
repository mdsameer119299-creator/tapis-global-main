import { randomUUID } from 'crypto'
import type { Pool, PoolClient } from 'pg'
import { dailyFingerprint, fingerprintSql, isStorableText, perfFingerprint, performanceRowKey, type DailyRow, type PerfRow } from './gsc-fingerprint'

/** One-time, insert-only 90-day Search Console history import. NOT a sync: it refuses to run unless the four target tables are empty.
 *
 *  Write allowlist (everything else is impossible by construction AND by database grants; see db/seo/0005_seo_import_roles.sql):
 *    seo_search_daily (INSERT)  seo_search_performance (INSERT)  seo_gsc_sync_runs (INSERT + UPDATE own run)  seo_audit_log (INSERT)
 *  Rollback (separate role) may DELETE only rows carrying the run's syncRunId from the two search tables, and flip its run to CANCELLED.
 *
 *  Every step is ONE transaction: SET LOCAL ROLE -> per-site advisory lock -> work -> counters + status + audit, all committed or none.
 *  Nothing is ever overwritten: rows are inserted with ON CONFLICT DO NOTHING and any pre-existing conflicting row aborts the step. */

export const IMPORT_PROPERTY = 'sc-domain:tapisglobalinternational.com'
export const IMPORT_SITE_DOMAIN = 'tapisglobalinternational.com'
export const IMPORT_RANGE_START = '2026-08-11'
export const IMPORT_RANGE_END = '2026-11-08' // inclusive; latest day with final data
export const IMPORT_EXPECTED_DB_REF = 'xxmrziaefhxmaewrvbqk' // tapis-global-seo-dev
export const IMPORT_CONFIRM_PHRASE = 'IMPORT-90D-2026-08-11-TO-2026-11-08-INTO-tapis-global-seo-dev'
export const IMPORTER_ROLE = 'seo_importer'
export const ROLLBACK_ROLE = 'seo_import_rollback'
/** Approved row counts per window (verified live in the E1 extraction, identical to the accepted dry-run). */
export const WINDOW_COUNTS = [331, 385, 378, 347, 324, 361, 315, 343, 297, 381, 390, 370, 293]
export const DAILY_COUNT = 90
export const TOTAL_ROWS = DAILY_COUNT + WINDOW_COUNTS.reduce((a, b) => a + b, 0) // 4,605
const ROW_LIMIT = 25_000
const DAY = 86_400_000
const ms = (d: string) => Date.parse(`${d}T00:00:00Z`)
const ymd = (t: number) => new Date(t).toISOString().slice(0, 10)

export interface ImportWindow { index: number; start: string; end: string; days: number; expected: number }
export const IMPORT_WINDOWS: ImportWindow[] = (() => {
  const out: ImportWindow[] = []
  let i = 1
  for (let s = ms(IMPORT_RANGE_START); s <= ms(IMPORT_RANGE_END); s += 7 * DAY, i++) {
    const e = Math.min(s + 6 * DAY, ms(IMPORT_RANGE_END))
    out.push({ index: i, start: ymd(s), end: ymd(e), days: (e - s) / DAY + 1, expected: WINDOW_COUNTS[i - 1] })
  }
  return out
})()

export interface ImportBaseline { daily: string; windows: Record<number, string> }
export interface WindowResult { rows: PerfRow[]; complete: boolean }
export interface GscSource { daily(): Promise<DailyRow[]>; window(index: number): Promise<WindowResult> }
export interface ImportRun { runId: string; siteId: string }

export type ImportErrorCode =
  | 'BASELINE_NOT_CONFIGURED' | 'SITE_NOT_FOUND' | 'NOT_CONNECTED' | 'TABLES_NOT_EMPTY' | 'RUN_IN_PROGRESS' | 'RUN_NOT_FOUND' | 'RUN_NOT_RUNNING' | 'RUN_NOT_PARTIAL'
  | 'GOOGLE_HTTP_ERROR' | 'WINDOW_TRUNCATED' | 'WINDOW_COUNT_MISMATCH' | 'WINDOW_DATA_CHANGED' | 'OUT_OF_RANGE_ROW' | 'DUPLICATE_KEYS' | 'BAD_ROW'
  | 'CONFLICT_IDENTICAL' | 'CONFLICT_DIFFERENT' | 'SUBSET_VIOLATION' | 'DB_ERROR' | 'INCOMPLETE' | 'ALREADY_ROLLED_BACK' | 'ROLLBACK_TOUCHED_OTHER_ROWS' | 'INVALID_STEP'
export class ImportError extends Error {
  code: ImportErrorCode
  diag: { window?: number; stable?: boolean; observed?: number; expected?: number; pg?: string }
  crash?: boolean
  constructor(code: ImportErrorCode, diag: ImportError['diag'] = {}) { super(code); this.name = 'ImportError'; this.code = code; this.diag = diag }
}
/** Fixed, safe messages only (stored in seo_gsc_sync_runs.errorMessage). Never contains data, queries, URLs or database text. */
const MSG: Record<string, string> = {
  GOOGLE_HTTP_ERROR: 'Search Console returned an error', WINDOW_COUNT_MISMATCH: 'A window row count differs from the approved baseline', WINDOW_DATA_CHANGED: 'A window differs from the approved baseline',
  WINDOW_TRUNCATED: 'A window response was incomplete', OUT_OF_RANGE_ROW: 'A row was outside the approved range', DUPLICATE_KEYS: 'Duplicate keys in a response', BAD_ROW: 'A row had an invalid value',
  CONFLICT_IDENTICAL: 'Rows already exist (identical)', CONFLICT_DIFFERENT: 'Rows already exist (different values)', SUBSET_VIOLATION: 'Detail exceeds daily totals', DB_ERROR: 'Database error', INCOMPLETE: 'Expected data is incomplete',
}

// ---------- transactions ----------
type TxOpts = { role?: string; readOnly?: boolean }
export async function importTx<T>(pool: Pool, fn: (c: PoolClient) => Promise<T>, o: TxOpts = {}): Promise<T> {
  const role = o.role ?? IMPORTER_ROLE
  if (role !== IMPORTER_ROLE && role !== ROLLBACK_ROLE) throw new ImportError('INVALID_STEP')
  const c = await pool.connect()
  try {
    await c.query(o.readOnly ? 'BEGIN READ ONLY' : 'BEGIN')
    await c.query(`SET LOCAL ROLE ${role}`) // role is one of two constants above, never user input
    await c.query(`SELECT pg_advisory_xact_lock(hashtext('gsc-import:'||$1))`, [IMPORT_SITE_DOMAIN])
    const out = await fn(c)
    await c.query('COMMIT')
    return out
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined)
    throw e
  } finally {
    c.release()
  }
}
const audit = (c: PoolClient, siteId: string, actorType: 'ADMIN' | 'SYSTEM', actor: string, action: string, runId: string, md: Record<string, unknown>) =>
  c.query(`INSERT INTO seo_audit_log (id,"siteId","actorType",actor,action,"entityType","entityId",metadata) VALUES ($1,$2,$3,$4,$5,'seo_gsc_sync_runs',$6,$7)`, [randomUUID(), siteId, actorType, actor.slice(0, 200), action, runId, JSON.stringify(md)])
async function lockRun(c: PoolClient, runId: string) {
  const r = (await c.query(`SELECT id,"siteId",status,"rowsFetched","rowsWritten","rangeStart"::text AS "rangeStart","rangeEnd"::text AS "rangeEnd" FROM seo_gsc_sync_runs WHERE id=$1 AND kind='SEARCH_ANALYTICS' FOR UPDATE`, [runId])).rows[0]
  if (!r) throw new ImportError('RUN_NOT_FOUND')
  return r as { id: string; siteId: string; status: string; rowsFetched: number; rowsWritten: number; rangeStart: string; rangeEnd: string }
}
const count = async (c: PoolClient, sql: string, p: unknown[]) => (await c.query(sql, p)).rows[0].n as number
function requireBaseline(b: ImportBaseline | null | undefined): ImportBaseline {
  if (!b || !/^[0-9a-f]{64}$/.test(b.daily) || IMPORT_WINDOWS.some((w) => !/^[0-9a-f]{64}$/.test(b.windows[w.index] ?? ''))) throw new ImportError('BASELINE_NOT_CONFIGURED')
  return b
}

/** Windows whose rows are all present for this run. A window with a partial row count is an inconsistency (DB_ERROR), never silently accepted. */
export async function windowsDone(c: PoolClient, runId: string): Promise<number[]> {
  const out: number[] = []
  for (const w of IMPORT_WINDOWS) {
    const n = await count(c, `SELECT count(*)::int n FROM seo_search_performance WHERE "syncRunId"=$1 AND date BETWEEN $2 AND $3`, [runId, w.start, w.end])
    if (n === w.expected) out.push(w.index)
    else if (n !== 0) throw new ImportError('DB_ERROR', { window: w.index, observed: n, expected: w.expected })
  }
  return out
}

// ---------- validation (before any database write) ----------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const validDate = (d: unknown): d is string => typeof d === 'string' && DATE_RE.test(d) && Number.isFinite(ms(d)) && ymd(ms(d)) === d
function validateRows(rows: DailyRow[] | PerfRow[], a: string, b: string, perf: boolean): void {
  for (const r of rows as PerfRow[]) {
    if (!validDate(r.date) || r.date < a || r.date > b) throw new ImportError('OUT_OF_RANGE_ROW')
    if (!Number.isInteger(r.clicks) || !Number.isInteger(r.impressions) || r.clicks < 0 || r.impressions < 0 || !Number.isFinite(r.ctr) || !Number.isFinite(r.position)) throw new ImportError('BAD_ROW')
    if (perf && !(isStorableText(r.page) && isStorableText(r.query) && isStorableText(r.country) && isStorableText(r.device))) throw new ImportError('BAD_ROW')
  }
}
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let last: unknown
  for (let i = 0; i < 3; i++) {
    try { return await fn() } catch (e) {
      const x = e as { crash?: boolean; status?: number }
      if (x.crash) throw e
      last = e
      if (!(x.status === 429 || (typeof x.status === 'number' && x.status >= 500))) break
    }
  }
  throw new ImportError('GOOGLE_HTTP_ERROR', { pg: String((last as { status?: number })?.status ?? '') })
}

// ---------- steps ----------
export async function startImport(pool: Pool, baselineIn: ImportBaseline | null, actor: string): Promise<ImportRun> {
  requireBaseline(baselineIn)
  return importTx(pool, async (c) => {
    const site = (await c.query(`SELECT id FROM seo_sites WHERE domain=$1`, [IMPORT_SITE_DOMAIN])).rows[0]
    if (!site) throw new ImportError('SITE_NOT_FOUND')
    const conn = (await c.query(`SELECT state,"propertyUrl" FROM seo_oauth_connections WHERE "siteId"=$1 AND provider='GSC'`, [site.id])).rows[0]
    if (!conn || conn.state !== 'CONNECTED' || conn.propertyUrl !== IMPORT_PROPERTY) throw new ImportError('NOT_CONNECTED')
    if ((await count(c, `SELECT count(*)::int n FROM seo_search_daily`, [])) + (await count(c, `SELECT count(*)::int n FROM seo_search_performance`, [])) > 0) throw new ImportError('TABLES_NOT_EMPTY')
    if ((await count(c, `SELECT count(*)::int n FROM seo_gsc_sync_runs WHERE "siteId"=$1 AND kind='SEARCH_ANALYTICS' AND status IN ('QUEUED','RUNNING')`, [site.id])) > 0) throw new ImportError('RUN_IN_PROGRESS')
    const runId = randomUUID()
    await c.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ($1,$2,'SEARCH_ANALYTICS','MANUAL','RUNNING',$3,$4)`, [runId, site.id, IMPORT_RANGE_START, IMPORT_RANGE_END])
    await audit(c, site.id, 'ADMIN', actor, 'gsc.import.started', runId, { property: IMPORT_PROPERTY, rangeStart: IMPORT_RANGE_START, rangeEnd: IMPORT_RANGE_END })
    return { runId, siteId: site.id }
  })
}

const bumpCounters = async (c: PoolClient, runId: string, fetched: number, inserted: number) => {
  const u = await c.query(`UPDATE seo_gsc_sync_runs SET "rowsFetched"="rowsFetched"+$2,"rowsWritten"="rowsWritten"+$3 WHERE id=$1 AND status='RUNNING'`, [runId, fetched, inserted])
  if (u.rowCount !== 1) throw new ImportError('DB_ERROR') // compare-and-set: the run must still be RUNNING
}

export async function importDaily(pool: Pool, run: ImportRun, src: GscSource, baselineIn: ImportBaseline | null): Promise<{ inserted?: number; already?: true }> {
  const baseline = requireBaseline(baselineIn)
  const rows = await withRetry(() => src.daily())
  validateRows(rows, IMPORT_RANGE_START, IMPORT_RANGE_END, false)
  if (rows.length !== DAILY_COUNT || new Set(rows.map((r) => r.date)).size !== DAILY_COUNT) throw new ImportError('WINDOW_COUNT_MISMATCH', { observed: rows.length, expected: DAILY_COUNT })
  if (dailyFingerprint(rows) !== baseline.daily) throw new ImportError('WINDOW_DATA_CHANGED')
  return importTx(pool, async (c) => {
    const r = await lockRun(c, run.runId)
    if (r.status !== 'RUNNING') throw new ImportError('RUN_NOT_RUNNING')
    if ((await count(c, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"=$1`, [run.runId])) > 0) return { already: true as const }
    const q = (await c.query(
      `WITH src AS (SELECT * FROM jsonb_to_recordset($1::jsonb) AS x(date date,clicks int,impressions int,ctr float8,"position" float8)),
       ex AS (SELECT (e.clicks=s.clicks AND e.impressions=s.impressions AND e.ctr=s.ctr AND e."position"=s."position") same FROM src s JOIN seo_search_daily e ON e."siteId"=$2 AND e.date=s.date),
       ins AS (INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,"position","syncRunId") SELECT gen_random_uuid()::text,$2,date,clicks,impressions,ctr,"position",$3 FROM src ON CONFLICT ("siteId",date) DO NOTHING RETURNING 1)
       SELECT (SELECT count(*) FROM src)::int fetched,(SELECT count(*) FROM ins)::int inserted,(SELECT count(*) FILTER (WHERE same) FROM ex)::int c_same,(SELECT count(*) FILTER (WHERE NOT same) FROM ex)::int c_diff`,
      [JSON.stringify(rows), run.siteId, run.runId])).rows[0]
    if (q.c_diff > 0) throw new ImportError('CONFLICT_DIFFERENT')
    if (q.c_same > 0 || q.inserted !== q.fetched) throw new ImportError('CONFLICT_IDENTICAL')
    await bumpCounters(c, run.runId, q.fetched, q.inserted)
    return { inserted: q.inserted as number }
  })
}

export async function importWindow(pool: Pool, run: ImportRun, src: GscSource, baselineIn: ImportBaseline | null, w: ImportWindow): Promise<{ inserted?: number; already?: true }> {
  const baseline = requireBaseline(baselineIn)
  const fetchOnce = () => withRetry(() => src.window(w.index))
  const res = await fetchOnce()
  const check = (r: WindowResult): ImportErrorCode | null => {
    if (!r.complete) return 'WINDOW_TRUNCATED'
    validateRows(r.rows, w.start, w.end, true)
    if (r.rows.length !== w.expected) return 'WINDOW_COUNT_MISMATCH'
    if (new Set(r.rows.map((x) => performanceRowKey(x))).size !== r.rows.length) throw new ImportError('DUPLICATE_KEYS')
    if (perfFingerprint(r.rows) !== baseline.windows[w.index]) return 'WINDOW_DATA_CHANGED'
    return null
  }
  const bad = check(res)
  if (bad) { // classify: two independent refetches; "stable" only when both agree with the first response
    const sig = (r: WindowResult) => (r.complete ? `${r.rows.length}:${perfFingerprint(r.rows)}` : 'incomplete')
    const a = await fetchOnce(), b = await fetchOnce()
    throw new ImportError(bad, { window: w.index, stable: sig(a) === sig(b) && sig(a) === sig(res), observed: res.rows.length, expected: w.expected })
  }
  return importTx(pool, async (c) => {
    const r = await lockRun(c, run.runId)
    if (r.status !== 'RUNNING') throw new ImportError('RUN_NOT_RUNNING')
    if ((await count(c, `SELECT count(*)::int n FROM seo_search_performance WHERE "syncRunId"=$1 AND date BETWEEN $2 AND $3`, [run.runId, w.start, w.end])) === w.expected) return { already: true as const }
    const rows = res.rows.map((x) => ({ ...x, rowKey: performanceRowKey(x) }))
    const q = (await c.query(
      `WITH src AS (SELECT * FROM jsonb_to_recordset($1::jsonb) AS x(date date,page text,query text,country text,device text,clicks int,impressions int,ctr float8,"position" float8,"rowKey" text)),
       ex AS (SELECT (e.clicks=s.clicks AND e.impressions=s.impressions AND e.ctr=s.ctr AND e."position"=s."position") same FROM src s JOIN seo_search_performance e ON e."siteId"=$2 AND e."rowKey"=s."rowKey"),
       ins AS (INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,"position","rowKey","syncRunId") SELECT gen_random_uuid()::text,$2,date,page,query,country,device,clicks,impressions,ctr,"position","rowKey",$3 FROM src ON CONFLICT ("siteId","rowKey") DO NOTHING RETURNING 1)
       SELECT (SELECT count(*) FROM src)::int fetched,(SELECT count(*) FROM ins)::int inserted,(SELECT count(*) FILTER (WHERE same) FROM ex)::int c_same,(SELECT count(*) FILTER (WHERE NOT same) FROM ex)::int c_diff`,
      [JSON.stringify(rows), run.siteId, run.runId])).rows[0]
    if (q.c_diff > 0) throw new ImportError('CONFLICT_DIFFERENT')
    if (q.c_same > 0 || q.inserted !== q.fetched) throw new ImportError('CONFLICT_IDENTICAL')
    // detail rows are a subset of the daily totals: per date, never more clicks/impressions than the daily headline
    const sub = await count(c, `SELECT count(*)::int n FROM (SELECT 1 FROM seo_search_performance p JOIN seo_search_daily d ON d."siteId"=p."siteId" AND d.date=p.date WHERE p."syncRunId"=$1 AND p.date BETWEEN $2 AND $3 GROUP BY p.date,d.clicks,d.impressions HAVING sum(p.clicks)>d.clicks OR sum(p.impressions)>d.impressions) x`, [run.runId, w.start, w.end])
    if (sub > 0) throw new ImportError('SUBSET_VIOLATION')
    await bumpCounters(c, run.runId, q.fetched, q.inserted)
    return { inserted: q.inserted as number }
  })
}

/** Marks the run PARTIAL/FAILED with a fixed message, in the same transaction as its audit event. If that transaction fails the run simply stays RUNNING (stale, resumable). */
export async function failImport(pool: Pool, run: ImportRun, err: ImportError): Promise<{ status?: string; code?: string; skipped?: true; stale?: true }> {
  const code = err.code
  try {
    return await importTx(pool, async (c) => {
      const r = await lockRun(c, run.runId)
      if (r.status !== 'RUNNING') return { skipped: true as const }
      const done = await windowsDone(c, run.runId).catch(() => [] as number[])
      const dailyN = await count(c, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"=$1`, [run.runId])
      const status = dailyN > 0 || done.length > 0 ? 'PARTIAL' : 'FAILED'
      await c.query(`UPDATE seo_gsc_sync_runs SET status=$2::"SeoRunStatus","errorCode"=$3,"errorMessage"=$4,"finishedAt"=CURRENT_TIMESTAMP WHERE id=$1 AND status='RUNNING'`, [run.runId, status, code, MSG[code] ?? 'Import failed'])
      await audit(c, run.siteId, 'SYSTEM', 'importer', 'gsc.import.finished', run.runId, { status, errorCode: code, completedWindows: done.length, failedWindow: err.diag.window ?? null, rowsFetched: r.rowsFetched, rowsWritten: r.rowsWritten })
      return { status, code }
    })
  } catch { return { stale: true as const } }
}

/** Success is decided ONLY from the database: counters, per-window counts, and row-level fingerprints recomputed in SQL must all equal the approved baseline. */
export async function finishImport(pool: Pool, run: ImportRun, baselineIn: ImportBaseline | null): Promise<{ status: 'SUCCEEDED' | 'PARTIAL' }> {
  const baseline = requireBaseline(baselineIn)
  try {
    return await importTx(pool, async (c) => {
      const r = await lockRun(c, run.runId)
      if (r.status !== 'RUNNING') throw new ImportError('RUN_NOT_RUNNING')
      const done = await windowsDone(c, run.runId).catch(() => [] as number[])
      const dailyN = await count(c, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"=$1`, [run.runId])
      const perfN = await count(c, `SELECT count(*)::int n FROM seo_search_performance WHERE "syncRunId"=$1`, [run.runId])
      let ok = dailyN === DAILY_COUNT && perfN === TOTAL_ROWS - DAILY_COUNT && done.length === IMPORT_WINDOWS.length && r.rowsFetched === TOTAL_ROWS && r.rowsWritten === TOTAL_ROWS && r.rangeStart === IMPORT_RANGE_START && r.rangeEnd === IMPORT_RANGE_END
      if (ok) ok = ((await c.query(fingerprintSql('seo_search_daily', `"syncRunId"=$1`), [run.runId])).rows[0].s as string) === baseline.daily
      if (ok) for (const w of IMPORT_WINDOWS) {
        const s = (await c.query(fingerprintSql('seo_search_performance', `"syncRunId"=$1 AND date BETWEEN $2 AND $3`), [run.runId, w.start, w.end])).rows[0]
        if (s.n !== w.expected || s.s !== baseline.windows[w.index]) { ok = false; break }
      }
      const status = ok ? 'SUCCEEDED' : 'PARTIAL', code = ok ? null : 'INCOMPLETE'
      await c.query(`UPDATE seo_gsc_sync_runs SET status=$2::"SeoRunStatus","errorCode"=$3,"errorMessage"=$4,"finishedAt"=CURRENT_TIMESTAMP WHERE id=$1 AND status='RUNNING'`, [run.runId, status, code, code ? MSG[code] : null])
      await audit(c, run.siteId, 'SYSTEM', 'importer', 'gsc.import.finished', run.runId, { status, errorCode: code, completedWindows: done.length, rowsFetched: r.rowsFetched, rowsWritten: r.rowsWritten })
      return { status: status as 'SUCCEEDED' | 'PARTIAL' }
    })
  } catch (e) {
    if (e instanceof ImportError) throw e
    throw new ImportError('DB_ERROR', { pg: (e as { code?: string }).code })
  }
}

/** PARTIAL -> RUNNING, only by explicit admin action. Completed windows are kept and skipped. */
export async function resumeImport(pool: Pool, runId: string, actor: string): Promise<ImportRun> {
  return importTx(pool, async (c) => {
    const r = await lockRun(c, runId)
    if (r.status !== 'PARTIAL') throw new ImportError('RUN_NOT_PARTIAL')
    await c.query(`UPDATE seo_gsc_sync_runs SET status='RUNNING',"errorCode"=NULL,"errorMessage"=NULL,"finishedAt"=NULL WHERE id=$1 AND status='PARTIAL'`, [runId])
    await audit(c, r.siteId, 'ADMIN', actor, 'gsc.import.resumed', runId, { from: 'PARTIAL', rowsWritten: r.rowsWritten })
    return { runId, siteId: r.siteId }
  })
}

export async function importProgress(pool: Pool, runId: string): Promise<{ daily: boolean; windows: number[] }> {
  return importTx(pool, async (c) => ({ daily: (await count(c, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"=$1`, [runId])) === DAILY_COUNT, windows: await windowsDone(c, runId) }), { readOnly: true })
}

/** Counts only. */
export async function importStatus(pool: Pool, runId: string) {
  return importTx(pool, async (c) => {
    const r = (await c.query(`SELECT id,"siteId",status,"errorCode","rowsFetched","rowsWritten","finishedAt" FROM seo_gsc_sync_runs WHERE id=$1 AND kind='SEARCH_ANALYTICS'`, [runId])).rows[0]
    if (!r) throw new ImportError('RUN_NOT_FOUND')
    const windows = await windowsDone(c, runId).catch(() => [] as number[])
    return { runId, status: r.status as string, errorCode: r.errorCode as string | null, rowsFetched: r.rowsFetched as number, rowsWritten: r.rowsWritten as number, completedWindows: windows, finished: !!r.finishedAt }
  }, { readOnly: true })
}

/** Rollback of exactly one run, by syncRunId. Deletes only that run's rows and proves in the same transaction that every other row is byte-identical. */
export async function rollbackImport(pool: Pool, runId: string, actor: string, opts: { predicate?: string } = {}): Promise<{ deletedDaily: number; deletedPerformance: number }> {
  const predicate = opts.predicate ?? `"syncRunId" = $1` // override exists only so tests can prove an over-broad delete is caught
  return importTx(pool, async (c) => {
    const r = await lockRun(c, runId)
    if (r.status === 'CANCELLED') throw new ImportError('ALREADY_ROLLED_BACK')
    const others = async () => (await c.query(
      `SELECT (SELECT count(*)::int FROM seo_search_daily WHERE "syncRunId" IS DISTINCT FROM $1)||'/'||(SELECT count(*)::int FROM seo_search_performance WHERE "syncRunId" IS DISTINCT FROM $1)||'/'||
              (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_search_daily t WHERE "syncRunId" IS DISTINCT FROM $1)||'/'||
              (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_search_performance t WHERE "syncRunId" IS DISTINCT FROM $1) AS s`, [runId])).rows[0].s as string
    const before = await others()
    const params = predicate.includes('$1') ? [runId] : []
    const dp = await c.query(`DELETE FROM seo_search_performance WHERE ${predicate}`, params)
    const dd = await c.query(`DELETE FROM seo_search_daily WHERE ${predicate}`, params)
    if ((await others()) !== before) throw new ImportError('ROLLBACK_TOUCHED_OTHER_ROWS')
    await c.query(`UPDATE seo_gsc_sync_runs SET status='CANCELLED',"errorCode"='ROLLED_BACK',"finishedAt"=CURRENT_TIMESTAMP WHERE id=$1`, [runId])
    await audit(c, r.siteId, 'ADMIN', actor, 'gsc.import.rolled_back', runId, { deletedDaily: dd.rowCount, deletedPerformance: dp.rowCount })
    return { deletedDaily: dd.rowCount ?? 0, deletedPerformance: dp.rowCount ?? 0 }
  }, { role: ROLLBACK_ROLE })
}

/** Convenience driver (tests / local use): runs every outstanding step, then finishes. The HTTP route calls the steps one at a time instead. */
export async function runImport(pool: Pool, run: ImportRun, src: GscSource, baseline: ImportBaseline | null) {
  try {
    const p = await importProgress(pool, run.runId)
    if (!p.daily) await importDaily(pool, run, src, baseline)
    for (const w of IMPORT_WINDOWS) {
      if (p.windows.includes(w.index)) continue
      try { await importWindow(pool, run, src, baseline, w) } catch (e) {
        if (e instanceof ImportError) e.diag = { ...e.diag, window: w.index }
        throw e
      }
    }
    return await finishImport(pool, run, baseline)
  } catch (e) {
    if ((e as { crash?: boolean }).crash) throw e // simulated process death: nothing further executes
    const err = e instanceof ImportError ? e : new ImportError('DB_ERROR', { pg: (e as { code?: string }).code })
    return { failed: true as const, code: err.code, diag: err.diag, ...(await failImport(pool, run, err)) }
  }
}

// ---------- production Search Console source (same request shape as the approved dry-run; READ ONLY, webmasters.readonly) ----------
type Fetch = typeof fetch
type SaRow = { keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0)
export function createGscSource(accessToken: string, fetchImpl: Fetch = fetch): GscSource {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(IMPORT_PROPERTY)}/searchAnalytics/query`
  const call = async (body: Record<string, unknown>): Promise<SaRow[]> => {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 25_000)
    try {
      const res = await fetchImpl(url, { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal, cache: 'no-store' })
      if (res.status < 200 || res.status >= 300) throw Object.assign(new Error('google'), { status: res.status })
      return (((await res.json()) as { rows?: SaRow[] }).rows ?? [])
    } catch (e) {
      throw (e as { status?: number }).status ? e : Object.assign(new Error('network'), { status: 599 }) // network/timeout: retryable
    } finally { clearTimeout(timer) }
  }
  const base = { type: 'web', dataState: 'final', rowLimit: ROW_LIMIT }
  return {
    async daily() {
      const rows = await call({ ...base, startDate: IMPORT_RANGE_START, endDate: IMPORT_RANGE_END, dimensions: ['date'] })
      return rows.map((x) => ({ date: String(x.keys?.[0] ?? ''), clicks: num(x.clicks), impressions: num(x.impressions), ctr: num(x.ctr), position: num(x.position) }))
    },
    async window(index: number) {
      const w = IMPORT_WINDOWS.find((x) => x.index === index)
      if (!w) throw new ImportError('INVALID_STEP')
      const out: PerfRow[] = []
      let startRow = 0, complete = false
      for (let page = 0; page < 6 && !complete; page++) {
        const rows = await call({ ...base, startDate: w.start, endDate: w.end, dimensions: ['date', 'page', 'query', 'country', 'device'], startRow })
        rows.forEach((x) => { const k = x.keys ?? []; out.push({ date: String(k[0] ?? ''), page: String(k[1] ?? ''), query: String(k[2] ?? ''), country: String(k[3] ?? ''), device: String(k[4] ?? ''), clicks: num(x.clicks), impressions: num(x.impressions), ctr: num(x.ctr), position: num(x.position) }) })
        startRow += rows.length
        complete = rows.length < ROW_LIMIT
      }
      return { rows: out, complete }
    },
  }
}
