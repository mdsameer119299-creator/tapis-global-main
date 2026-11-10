// One-time Search Console import: STATIC guarantees (always run) + the eight safety tests, role/RLS permission matrix (run against a SCRATCH Postgres only).
// Scratch part env: SEO_SCRATCH_PG_URL=postgres://postgres@localhost:55432/postgres (admin, creates/drops throwaway databases), SEO_SCRATCH_TEMPLATE=<db with 0001-0005 applied>,
// SEO_SCRATCH_LOGIN=seo_import_app (the pinned dedicated login, created by db/seo/admin_create_import_login.sql: member of seo_importer ONLY, WITH INHERIT FALSE, SET TRUE), SEO_SCRATCH_BYPASS_LOGIN=<login with BYPASSRLS>,
// SEO_SCRATCH_ADMIN_LOGIN=<non-superuser administrator holding ADMIN OPTION (not SET) on seo_import_rollback, like the role that ran 0005>.
// Never point these at a real database: the harness refuses anything that is not localhost.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const I = jiti('../lib/seo-command/gsc-import.ts')
const FP = jiti('../lib/seo-command/gsc-fingerprint.ts')
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8')
let statics = 0
const s = (name, fn) => { fn(); statics++; console.log('ok -', name) }
const sa = async (name, fn) => { await fn(); statics++; console.log('ok -', name) }

// ===================== STATIC guarantees (no database) =====================
const src = read('lib/seo-command/gsc-import.ts'), code = read('lib/seo-command/gsc-import.ts').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, ''), route = read('app/api/admin/seo/gsc/import/route.ts'), sql5 = read('db/seo/0005_seo_import_roles.sql')
s('write allowlist: every INSERT/UPDATE/DELETE in the importer targets one of the four approved tables', () => {
  const targets = new Set()
  for (const m of code.matchAll(/(INSERT INTO|UPDATE|DELETE FROM)\s+([a-z_]+)/g)) targets.add(m[1].split(' ')[0] + ' ' + m[2])
  const allowed = new Set(['INSERT seo_search_daily', 'INSERT seo_search_performance', 'INSERT seo_gsc_sync_runs', 'INSERT seo_audit_log', 'UPDATE seo_gsc_sync_runs'])
  for (const t of targets) assert.ok(allowed.has(t), `unexpected write target: ${t}`)
  assert.equal(targets.size, 5) // 4 INSERT targets + UPDATE of seo_gsc_sync_runs; nothing else
})
s('importer never touches oauth / sites / sitemap / ga4 / recommendations writes, never UPSERTs and never uses DO UPDATE', () => {
  assert.ok(!/(INSERT INTO|UPDATE|DELETE FROM)\s+seo_(sites|oauth_|sitemap_status|ga4|recommendations|keywords|crawl)/.test(code))
  assert.ok(!/ON CONFLICT[^)]*\)\s*DO UPDATE/i.test(code)); assert.ok(!/\bTRUNCATE\b|\bDROP\b|\bALTER\b|\bGRANT\b/i.test(code))
  assert.equal((code.match(/ON CONFLICT/g) ?? []).length, 2); assert.equal((code.match(/ON CONFLICT[^`]*DO NOTHING/g) ?? []).length, 2)
})
s('the application can never hold a deletion-capable role: no DELETE, no rollback role, no rollback action, no seo_worker in app code', () => {
  assert.ok(!/DELETE FROM/i.test(code)); // the only mention allowed is the login guard, which PROVES the login is NOT a member of these roles
  const noGuard = code.replace(/async function assertImportLogin[\s\S]*?\n}\n/, '')
  assert.ok(!/seo_import_rollback|ROLLBACK_ROLE|rollbackImport/.test(noGuard + route.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')))
  assert.ok(!/seo_worker/.test(noGuard)); assert.equal(I.IMPORTER_ROLE, 'seo_importer'); assert.equal(I.rollbackImport, undefined)
  assert.ok(!/'rollback'/.test(route.replace(/\/\*[\s\S]*?\*\//g, '')) )
  assert.equal((code.match(/SET LOCAL ROLE/g) ?? []).length, 1)
})
s('admin rollback script: manual only; run id edited in ONE place; role block takes its target from the transaction-local authorisation row; deletes only run-scoped rows from the two search tables; grants+revokes inside one transaction; independent verification; nothing in the repo or deploy references it', () => {
  const a = read('db/seo/admin_rollback_import_run.sql'), ac = a.replace(/--.*$/gm, '')
  assert.ok(/^BEGIN;/m.test(ac) && /COMMIT;\s*$/.test(ac.trim())); assert.ok(/GRANT seo_import_rollback TO CURRENT_USER/.test(ac) && /REVOKE seo_import_rollback FROM CURRENT_USER/.test(ac))
  const ix = (x) => ac.indexOf(x)
  assert.ok(ix('INSERT INTO seo_import_rollback_authorisation') > 0 && ix('INSERT INTO seo_import_rollback_authorisation') < ix('GRANT seo_import_rollback') && ix('GRANT seo_import_rollback') < ix('SET LOCAL ROLE seo_import_rollback'))
  assert.ok(ix('SET LOCAL ROLE') < ix('DELETE FROM') && ix('DELETE FROM') < ix('RESET ROLE') && ix('RESET ROLE') < ix('REVOKE seo_import_rollback') && ix('REVOKE seo_import_rollback') < ix('$verify$'))
  const dels = [...ac.matchAll(/DELETE FROM\s+(\w+)\s+WHERE\s+"syncRunId" = v_run/g)].map((m) => m[1]); assert.deepEqual(dels.sort(), ['seo_search_daily', 'seo_search_performance']); assert.equal((ac.match(/DELETE FROM/g) ?? []).length, 2)
  const roleBlock = ac.slice(ix('$rollback$'), ac.indexOf('$rollback$', ix('$rollback$') + 10))
  assert.ok(/SELECT "runId" INTO STRICT v_run FROM seo_import_rollback_authorisation/.test(roleBlock) && !/v_run\s+text\s*:=/.test(roleBlock) && !/current_setting|set_config/.test(roleBlock)) // the restricted role never takes the id from input or a GUC
  assert.equal((a.match(/<<< EDIT/g) ?? []).length, 1) // one edit point
  assert.ok(/pg_advisory_xact_lock/.test(ac) && /FOR UPDATE/.test(ac) && /outside the authorised run would change/.test(ac) && /still has a usable member/.test(ac) && /xmin::text = \(pg_current_xact_id\(\)::xid\)::text/.test(ac))
  for (const f of ['package.json', 'vercel.json', 'next.config.js', 'next.config.mjs']) if (existsSync(path.join(ROOT, f))) assert.ok(!/admin_rollback_import_run/.test(read(f)), f)
  assert.ok(!/admin_rollback_import_run/.test(code + route.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')))
})
s('approved scope constants: property, 90-day inclusive range, 13 windows summing to 4,515 detail + 90 daily = 4,605', () => {
  assert.equal(I.IMPORT_PROPERTY, 'sc-domain:tapisglobalinternational.com'); assert.equal(I.IMPORT_RANGE_START, '2026-08-11'); assert.equal(I.IMPORT_RANGE_END, '2026-11-08')
  assert.equal(I.IMPORT_WINDOWS.length, 13); assert.equal(I.IMPORT_WINDOWS[0].start, '2026-08-11'); assert.equal(I.IMPORT_WINDOWS[12].end, '2026-11-08'); assert.equal(I.IMPORT_WINDOWS.reduce((a, w) => a + w.days, 0), 90)
  assert.equal(I.TOTAL_ROWS, 4605); assert.equal(I.WINDOW_COUNTS.reduce((a, b) => a + b, 0), 4515)
})
s('route is admin-only, same-origin, Preview-only, explicitly enabled, DB-ref pinned, confirm-phrase gated; returns counts/codes only', () => {
  for (const needle of ['verifySeoSession', 'originMatchesHost', "VERCEL_ENV !== 'preview'", "SEO_GSC_IMPORT_ENABLED !== 'true'", 'IMPORT_EXPECTED_DB_REF', 'IMPORT_CONFIRM_PHRASE', 'cache-control']) assert.ok(route.includes(needle), needle)
  assert.ok(!/console\.(log|error)\([^)]*(query|page|url|token|secret)/i.test(route)); assert.ok(!/process\.env\.DATABASE_URL/.test(route + src))
  assert.ok(!/export const (GET|PUT|PATCH|DELETE)/.test(route)); for (const l of route.split('\n').filter((l) => /NextResponse\.json\(/.test(l))) assert.ok(!/refreshToken|accessToken|clientSecret|SEO_DATABASE_URL|\.message/.test(l), l)
})
s('no cron / scheduled execution of the importer; vercel.json has no crons', () => {
  const v = existsSync(path.join(ROOT, 'vercel.json')) ? JSON.parse(read('vercel.json')) : {}; assert.ok(!v.crons || v.crons.length === 0)
  assert.ok(!/setInterval|setTimeout\([^)]*import|node-cron/i.test(src + route))
})
await sa('baseline is fail-closed: window hashes absent => BASELINE_NOT_CONFIGURED (importer refuses to start)', async () => {
  const B = jiti('../lib/seo-command/gsc-import-baseline.ts').IMPORT_BASELINE
  assert.match(B.daily, /^[0-9a-f]{64}$/); assert.ok(Object.keys(B.windows).length === 0 || Object.keys(B.windows).length === 13)
  if (Object.keys(B.windows).length === 0) await assert.rejects(I.startImport({ connect: () => { throw new Error('must not touch the database') } }, B, 'x'), (e) => e.code === 'BASELINE_NOT_CONFIGURED')
})
s('migration 0005 is additive, creates exactly two NOLOGIN roles, grants DELETE only to the rollback role, never grants that role to anyone, nothing on out-of-scope tables', () => {
  assert.ok(!/GRANT\s+seo_import_rollback\s+TO/i.test(sql5.replace(/--.*$/gm, '')) && !/GRANT\s+seo_importer\s+TO/i.test(sql5.replace(/--.*$/gm, '')))
  assert.equal((sql5.match(/CREATE ROLE/g) ?? []).length, 2); assert.ok(/NOLOGIN NOINHERIT NOSUPERUSER[^;]*NOBYPASSRLS/.test(sql5))
  for (const l of sql5.split('\n').filter((l) => /^GRANT/.test(l) && /DELETE/.test(l))) assert.ok(/seo_import_rollback/.test(l) && !/seo_importer\b[^_]/.test(l.replace('seo_import_rollback', '')), l)
  assert.ok(!/seo_(oauth_states|sitemap_status|ga4|recommendations|keywords|competitors|crawl|technical|agent|approval|integrations)/.test(sql5.split('\n').filter((l) => /^GRANT/.test(l)).join('\n')))
  assert.ok(!/DROP|TRUNCATE|DELETE FROM|UPDATE public|INSERT INTO/.test(sql5.replace(/--.*$/gm, '')))
})

// ---- dedicated importer login: connection code ----
const ID = jiti('../lib/seo-command/import-db.ts')
const stripC = (x) => x.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '')
const dbCode = stripC(read('lib/seo-command/import-db.ts')), routeCode = stripC(route)
s('importer connection code: exactly one Pool, built ONLY from SEO_IMPORT_DATABASE_URL; no fallback to getSeoPool/seoQuery/withSeoTx/SEO_DATABASE_URL/DATABASE_URL', () => {
  assert.equal((dbCode.match(/new Pool\(/g) ?? []).length, 1)
  assert.ok(/assertSafeImportDbUrl\(env\.SEO_IMPORT_DATABASE_URL,/.test(dbCode) && /connectionString: stripSslParams\(url\)/.test(dbCode))
  // SEO_DATABASE_URL / DATABASE_URL appear only as comparison inputs passed to the validator, never as a connection string
  for (const m of dbCode.matchAll(/env\.(SEO_DATABASE_URL|DATABASE_URL)/g)) assert.ok(new RegExp(`(seoUrl|mainUrl): env\\.${m[1]}`).test(dbCode))
  assert.ok(!/\|\|\s*env\.|\?\?\s*env\.SEO_DATABASE_URL|\?\?\s*env\.DATABASE_URL/.test(dbCode.replace(/env\.SEO_DATABASE_EXPECTED_REF \?\? ''/, '')))
  for (const [n, c] of [['gsc-import.ts', code], ['route.ts', routeCode], ['import-db.ts', dbCode]]) assert.ok(!/getSeoPool|seoQuery|withSeoTx|process\.env\.SEO_DATABASE_URL|process\.env\.DATABASE_URL|\bDATABASE_URL\b(?!\w)/.test(c.replace(/SEO_IMPORT_DATABASE_URL|SEO_DATABASE_URL/g, (m) => (n === 'import-db.ts' && m === 'SEO_DATABASE_URL' ? '' : m))) || n === 'import-db.ts', `${n} must not use the general database pool`)
  assert.ok(!/from '\.\/db'|from '@\/lib\/seo-command\/db'/.test(code + routeCode)); assert.ok(/getImportPool\(\)/.test(routeCode) && /isImportDbConfigured\(\)/.test(routeCode))
  assert.ok(!/process\.env\.SEO_DATABASE_URL|isSeoDbConfigured/.test(routeCode))
  assert.ok(!/DELETE|rollback/i.test(dbCode.replace(/seo_import_rollback|IMPORT_LOGIN_ROLE/g, '')))
})
s('login guard: every transaction first proves the session login is exactly seo_import_app (no superuser/BYPASSRLS/CREATEROLE/CREATEDB/REPLICATION; importer member; not rollback/worker/postgres) before SET LOCAL ROLE', () => {
  const i = code.indexOf('async function importTx'), tx = code.slice(i, i + 700)
  assert.ok(tx.indexOf('assertImportLogin(c)') > 0 && tx.indexOf('assertImportLogin(c)') < tx.indexOf('SET LOCAL ROLE') && tx.indexOf('BEGIN') < tx.indexOf('assertImportLogin(c)'))
  const g = code.slice(code.indexOf('async function assertImportLogin'), code.indexOf('// ---------- transactions') > 0 ? code.indexOf('export async function importTx') : undefined)
  for (const k of ['rolsuper', 'rolbypassrls', 'rolcreaterole', 'rolcreatedb', 'rolreplication', "'seo_importer'", "'seo_import_rollback'", "'seo_worker'", "'postgres'", 'IMPORT_LOGIN_ROLE']) assert.ok(g.includes(k), k)
  assert.equal((code.match(/SET LOCAL ROLE/g) ?? []).length, 1)
})
s('assertSafeImportDbUrl: accepts only the dedicated login on the approved project; rejects unsafe URLs without echoing them', () => {
  const REF = 'xxmrziaefhxmaewrvbqk', ok = (u, o = {}) => ID.assertSafeImportDbUrl(u, { expectedRef: REF, ...o })
  const good = `postgresql://seo_import_app.${REF}:S3cret%21pw@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
  assert.equal(ok(good, { seoUrl: `postgresql://postgres.${REF}:Other@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`, mainUrl: 'postgresql://u:p@h.example:5432/db' }), good)
  assert.equal(ok(`postgresql://seo_import_app:pw@db.${REF}.supabase.co:5432/postgres`).length > 0, true) // direct form
  const bad = [
    [undefined, 'ImportDbNotConfiguredError'], ['', 'ImportDbNotConfiguredError'],
    ['mysql://x', 'ImportDbUnsafeError'], ['postgres://', 'ImportDbUnsafeError'], ['not a url', 'ImportDbUnsafeError'],
    [`postgresql://postgres.${REF}:pw@h.supabase.com:6543/postgres`, 'ImportDbUnsafeError'], [`postgresql://seo_worker.${REF}:pw@h.supabase.com:6543/postgres`, 'ImportDbUnsafeError'],
    [`postgresql://seo_importer.${REF}:pw@h.supabase.com:6543/postgres`, 'ImportDbUnsafeError'], [`postgresql://seo_import_rollback.${REF}:pw@h.supabase.com:6543/postgres`, 'ImportDbUnsafeError'],
    [`postgresql://seo_import_app.otherref:pw@h.supabase.com:6543/${REF}`, 'ImportDbUnsafeError'], [`postgresql://seo_import_app.${REF}.extra:pw@h.supabase.com:6543/postgres`, 'ImportDbUnsafeError'],
    [`postgresql://seo_import_app_x.${REF}:pw@h.supabase.com:6543/postgres`, 'ImportDbUnsafeError'],
    ['postgresql://seo_import_app.zzzzzzzzzzzzzzzzzzzz:pw@h.supabase.com:6543/postgres', 'ImportDbUnsafeError'], // wrong project
    [`postgresql://seo_import_app.qgltrhszzqtgmaaglbfz:pw@h.supabase.com:6543/${REF}`, 'ImportDbUnsafeError'], // CraftTrack ref present
  ]
  for (const [u, name] of bad) { let err; try { ok(u) } catch (e) { err = e } assert.ok(err && err.name === name, String(u)); if (u) assert.ok(!err.message.includes('pw') && !err.message.includes('pooler') && !err.message.includes(u), 'message must not echo the URL') }
  assert.throws(() => ok(good, { seoUrl: good }), (e) => e.name === 'ImportDbUnsafeError') // same as SEO url
  assert.throws(() => ok(good, { mainUrl: good }), (e) => e.name === 'ImportDbUnsafeError')
  assert.throws(() => ok(good, { seoUrl: `postgresql://postgres.${REF}:S3cret%21pw@h:6543/postgres` }), (e) => e.name === 'ImportDbUnsafeError') // reused password
  assert.throws(() => ID.assertSafeImportDbUrl(good, { expectedRef: '' }), (e) => e.name === 'ImportDbUnsafeError') // no expected ref configured
})
s('NO FALLBACK: without SEO_IMPORT_DATABASE_URL the importer pool is refused even when SEO_DATABASE_URL and DATABASE_URL are set; unsafe values create no pool', () => {
  const REF = 'xxmrziaefhxmaewrvbqk'; ID.__setImportPoolForTests(undefined)
  const env = { SEO_DATABASE_URL: `postgresql://postgres.${REF}:pw1@h.supabase.com:6543/postgres`, DATABASE_URL: 'postgresql://u:pw2@main.example:5432/db', SEO_DATABASE_EXPECTED_REF: REF }
  assert.throws(() => ID.getImportPool(env), (e) => e.name === 'ImportDbNotConfiguredError')
  assert.throws(() => ID.getImportPool({ ...env, SEO_IMPORT_DATABASE_URL: env.SEO_DATABASE_URL }), (e) => e.name === 'ImportDbUnsafeError')
  assert.throws(() => ID.getImportPool({ ...env, SEO_IMPORT_DATABASE_URL: env.DATABASE_URL }), (e) => e.name === 'ImportDbUnsafeError')
  assert.equal(globalThis.__seoImportPool, undefined) // nothing was created or cached by the refused calls
  const p = ID.getImportPool({ ...env, SEO_IMPORT_DATABASE_URL: `postgresql://seo_import_app.${REF}:pw3@h.supabase.com:6543/postgres` }); assert.ok(p && p.options.max === 2); p.end().catch(() => {}); ID.__setImportPoolForTests(undefined)
  const prior = process.env.SEO_IMPORT_DATABASE_URL; delete process.env.SEO_IMPORT_DATABASE_URL; assert.equal(ID.isImportDbConfigured(), false); if (prior !== undefined) process.env.SEO_IMPORT_DATABASE_URL = prior
})
s('administrator login scripts: no password in any file, login is NOLOGIN-free restricted (NOINHERIT, NOBYPASSRLS, no CREATEROLE), member of seo_importer only, nothing granted to postgres/seo_worker/rollback', () => {
  const c = stripC(read('db/seo/admin_create_import_login.sql')).replace(/^\s*--.*$/gm, ''), d = read('db/seo/down_import_login.sql').replace(/--.*$/gm, '')
  assert.ok(!/PASSWORD|ENCRYPTED/i.test(c) && !/PASSWORD/i.test(d)); assert.ok(/CREATE ROLE seo_import_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT/.test(c))
  const grants = [...c.matchAll(/GRANT\s+(\S+)\s+TO\s+(\S+)(\s+WITH[^;]*)?;/g)]; assert.deepEqual(grants.map((g) => [g[1], g[2]]), [['seo_importer', 'seo_import_app']]); assert.match(grants[0][3], /INHERIT FALSE, SET TRUE/)
  assert.ok(!/seo_import_rollback\s+TO|seo_worker\s+TO|postgres\s+TO|GRANT\s+[^;]*ON\s+/i.test(c)); assert.ok(!/DELETE|DROP TABLE|TRUNCATE|UPDATE\s+\w|INSERT INTO/i.test(c + d))
  for (const f of ['package.json', 'vercel.json', 'next.config.js', 'next.config.mjs']) if (existsSync(path.join(ROOT, f))) assert.ok(!/admin_create_import_login|down_import_login/.test(read(f)), f)
  assert.ok(!/admin_create_import_login|down_import_login/.test(code + routeCode + dbCode))
})

// ===================== SCRATCH DATABASE tests =====================
const ADMIN = process.env.SEO_SCRATCH_PG_URL
if (!ADMIN) { console.log('SKIP - scratch-database tests (set SEO_SCRATCH_PG_URL, SEO_SCRATCH_TEMPLATE, SEO_SCRATCH_LOGIN, SEO_SCRATCH_BYPASS_LOGIN)'); console.log(`\n${statics} static checks passed`); process.exit(0) }
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(ADMIN) || /supabase|pooler|xxmrziaefhxmaewrvbqk|qgltrhszzqtgmaaglbfz/i.test(ADMIN)) throw new Error('SEO_SCRATCH_PG_URL must be a local scratch server')
const { default: pg } = { default: require('pg') }
const aurl = new URL(ADMIN)
const HOST = { host: aurl.hostname, port: Number(aurl.port || 5432) }
const TEMPLATE = process.env.SEO_SCRATCH_TEMPLATE, LOGIN = process.env.SEO_SCRATCH_LOGIN, BYPASS = process.env.SEO_SCRATCH_BYPASS_LOGIN, ADMIN_LOGIN = process.env.SEO_SCRATCH_ADMIN_LOGIN
if (!TEMPLATE || !LOGIN || !BYPASS || !ADMIN_LOGIN) throw new Error('SEO_SCRATCH_TEMPLATE / SEO_SCRATCH_LOGIN / SEO_SCRATCH_BYPASS_LOGIN / SEO_SCRATCH_ADMIN_LOGIN are required')

const { IMPORT_WINDOWS: WINDOWS, WINDOW_COUNTS, TOTAL, IMPORT_RANGE_START: RANGE_START, IMPORT_RANGE_END: RANGE_END, IMPORT_PROPERTY: PROPERTY, IMPORT_SITE_DOMAIN: SITE_DOMAIN } = { ...I, TOTAL: I.TOTAL_ROWS }
const SITE = SITE_DOMAIN
const DAY = 86400000, ms = (d) => Date.parse(d + 'T00:00:00Z'), ymd = (t) => new Date(t).toISOString().slice(0, 10)
const ALL_DATES = (() => { const o = []; for (let t = ms(RANGE_START); t <= ms(RANGE_END); t += DAY) o.push(ymd(t)); return o })()
function makeDataset() {
  const daily = ALL_DATES.map((date, i) => ({ date, clicks: 10, impressions: 500, ctr: 0.02, position: 15 + (i % 7) / 3 }))
  const perf = {}
  for (const w of WINDOWS) { const rows = []; for (let i = 0; i < w.expected; i++) { const clicks = i % 41 === 0 ? 1 : 0, impressions = 1 + (i % 6); rows.push({ date: ymd(ms(w.start) + (i % w.days) * DAY), page: `https://example.test/p/${i % 37}/ü`, query: `q${w.index}-${i} 日本 😀`, country: ['ind', 'usa', 'gbr'][i % 3], device: ['MOBILE', 'DESKTOP', 'TABLET'][i % 3], clicks, impressions, ctr: clicks / impressions, position: 1 + (i % 30) / 2 }) } perf[w.index] = rows }
  return { daily, perf, baseline: { daily: FP.dailyFingerprint(daily), windows: Object.fromEntries(WINDOWS.map((w) => [w.index, FP.perfFingerprint(perf[w.index])])) } }
}
function fakeGoogle(ds, faults = {}) {
  const log = []
  return { log,
    daily: async () => { log.push({ kind: 'daily', startDate: RANGE_START, endDate: RANGE_END, property: PROPERTY, dataState: 'final', type: 'web' }); const rows = ds.daily.map((x) => ({ ...x })); return faults.daily ? faults.daily(rows) : rows },
    window: async (i) => { const w = WINDOWS[i - 1]; log.push({ kind: 'window', index: i, startDate: w.start, endDate: w.end, property: PROPERTY, dataState: 'final', type: 'web' }); const rows = ds.perf[i].map((x) => ({ ...x })); if (faults.window?.[i]) return faults.window[i](rows, w); return { rows, complete: true } } }
}
let CUR = null // baseline of the dataset under test
const P = {
  SITE_DOMAIN, PROPERTY, RANGE_START, RANGE_END, WINDOWS, makeDataset, fakeGoogle,
  start: (pool) => I.startImport(pool, CUR, 'admin'), stepDaily: (pool, run, g, b) => I.importDaily(pool, run, g, b), stepWindow: (pool, run, g, b, w) => I.importWindow(pool, run, g, b, w),
  runAll: (pool, run, g, b) => I.runImport(pool, run, g, b), finish: (pool, run, b) => I.finishImport(pool, run, b), failRun: I.failImport, progress: I.importProgress, resume: (pool, id) => I.resumeImport(pool, id, 'admin'),
  status: I.importStatus
}

const root = new pg.Client({ connectionString: ADMIN }); await root.connect()
const results = []; let dbN = 0; const dbs = []
const ds = P.makeDataset(); CUR = ds.baseline

async function fresh() {
  const name = `t_imp_${process.pid}_${++dbN}`; dbs.push(name)
  await root.query(`CREATE DATABASE ${name} TEMPLATE ${TEMPLATE}`)
  const admin = new pg.Client({ ...HOST, user: 'postgres', database: name }); await admin.connect()
  await admin.query(`INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('site1',$1,'https://www.tapisglobalinternational.com',now())`, [P.SITE_DOMAIN])
  await admin.query(`INSERT INTO seo_oauth_connections (id,"siteId",provider,state,"propertyUrl","refreshTokenCipher","refreshTokenIv","refreshTokenTag","updatedAt") VALUES ('oc1','site1','GSC','CONNECTED',$1,'\\x00','\\x00','\\x00',now())`, [P.PROPERTY])
  const adminPool = new pg.Pool({ ...HOST, user: aurl.username, database: name, max: 2 }); const pool = new pg.Pool({ ...HOST, user: LOGIN, password: 'x', database: name, max: 6 })
  return { name, admin, pool, adminPool, async done() { await pool.end(); await adminPool.end(); await admin.end(); await root.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`) } }
}
const q = async (a, sql, p = []) => (await a.query(sql, p)).rows
const one = async (a, sql, p = []) => (await a.query(sql, p)).rows[0]
const secSnap = (a) => one(a, `SELECT md5(coalesce((SELECT string_agg(tablename||policyname||cmd||roles::text||coalesce(qual,'')||coalesce(with_check,''),'|' ORDER BY tablename,policyname) FROM pg_policies WHERE schemaname='public'),'')||coalesce((SELECT string_agg(table_name||grantee||privilege_type,'|' ORDER BY table_name,grantee,privilege_type) FROM information_schema.role_table_grants WHERE table_schema='public'),'')||coalesce((SELECT string_agg(tablename||rowsecurity::text,'|' ORDER BY tablename) FROM pg_tables WHERE schemaname='public'),'')) s`).then((r) => r.s)
const otherTables = (a) => one(a, `SELECT (SELECT count(*) FROM seo_sites)::int sites,(SELECT count(*) FROM seo_oauth_connections)::int oauth,(SELECT count(*) FROM seo_sitemap_status)::int sitemap,(SELECT count(*) FROM seo_ga4_landing_daily)::int ga4,(SELECT count(*) FROM seo_oauth_states)::int states`)
const PROPERTY_RE = /sc-domain:[a-z.]+/g
let baseSec = null; let invariantChecks = 0

/** T8 invariants: run status vs counters vs live rows, success only when complete, security unchanged, other tables untouched. */
async function invariants(admin, runId, { expectNullRows = 0, sites = 1 } = {}) {
  invariantChecks++
  const v = []
  const r = await one(admin, `SELECT * FROM seo_gsc_sync_runs WHERE id=$1`, [runId])
  const dn = (await one(admin, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"=$1`, [runId])).n
  const pn = (await one(admin, `SELECT count(*)::int n FROM seo_search_performance WHERE "syncRunId"=$1`, [runId])).n
  if (r.status !== 'CANCELLED' && r.rowsWritten !== dn + pn) v.push(`rowsWritten ${r.rowsWritten} != live ${dn + pn}`)
  if (r.rowsWritten > r.rowsFetched) v.push('written>fetched')
  if (r.status === 'SUCCEEDED') { if (dn !== 90 || pn !== 4515 || r.rowsFetched !== 4605 || r.rowsWritten !== 4605 || !r.finishedAt || r.errorCode) v.push('SUCCEEDED but incomplete') }
  if (['PARTIAL', 'FAILED'].includes(r.status) && (!r.errorCode || !r.finishedAt)) v.push('PARTIAL/FAILED without errorCode/finishedAt')
  if (r.status === 'RUNNING' && r.finishedAt) v.push('RUNNING with finishedAt')
  if (r.status === 'CANCELLED' && (dn + pn) !== 0) v.push('CANCELLED but rows remain')
  const nulls = (await one(admin, `SELECT (SELECT count(*) FROM seo_search_daily WHERE "syncRunId" IS NULL)::int+(SELECT count(*) FROM seo_search_performance WHERE "syncRunId" IS NULL)::int n`)).n
  if (nulls !== expectNullRows) v.push(`NULL syncRunId rows ${nulls}`)
  const o = await otherTables(admin); if (o.sites !== sites || o.oauth !== 1 || o.sitemap !== 0 || o.ga4 !== 0 || o.states !== 0) v.push('other tables changed ' + JSON.stringify(o))
  if ((await secSnap(admin)) !== baseSec) v.push('security snapshot changed')
  const fin = await q(admin, `SELECT metadata->>'status' s FROM seo_audit_log WHERE "entityId"=$1 AND action='gsc.import.finished' ORDER BY at DESC, ctid DESC LIMIT 1`, [runId])
  if (fin[0] && r.status !== 'RUNNING' && !['CANCELLED'].includes(r.status) && fin[0].s !== r.status) v.push(`audit status ${fin[0].s} != run ${r.status}`)
  assert.deepEqual(v, [], 'invariant violations: ' + v.join('; '))
}
async function t(name, fn) { const t0 = Date.now(); try { await fn(); results.push({ name, ok: true, ms: Date.now() - t0 }); console.log('PASS', name) } catch (e) { results.push({ name, ok: false, err: String(e.message).slice(0, 600) }); console.log('FAIL', name, '\n   ', String(e.message).slice(0, 600)) } }
const happy = async (env, google = P.fakeGoogle(ds)) => { const run = await P.start(env.pool); const res = await P.runAll(env.pool, run, google, ds.baseline); return { run, res, google } }
const sumWin = (n) => WINDOW_COUNTS.slice(0, n).reduce((a, b) => a + b, 0)
const auditRows = (a, runId) => q(a, `SELECT action,"actorType",actor,"entityType","entityId",metadata FROM seo_audit_log WHERE "entityId"=$1 ORDER BY at, ctid`, [runId])

{ const e = await fresh(); baseSec = await secSnap(e.admin); await e.done() }

// ===== sanity: baseline happy path =====
await t('T0 happy path: 90 + 4515 rows, SUCCEEDED, counters 4605/4605, fingerprints match DB (SQL) ', async () => {
  const e = await fresh(); try {
    const { run, res, google } = await happy(e)
    assert.equal(res.status, 'SUCCEEDED')
    const r = await one(e.admin, `SELECT * FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId])
    assert.equal(r.status, 'SUCCEEDED'); assert.equal(r.rowsFetched, 4605); assert.equal(r.rowsWritten, 4605)
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_daily`)).n, 90)
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance`)).n, 4515)
    assert.equal(google.log.length, 14)
    const a = await auditRows(e.admin, run.runId); assert.deepEqual(a.map((x) => x.action), ['gsc.import.started', 'gsc.import.finished'])
    await invariants(e.admin, run.runId)
  } finally { await e.done() }
})


const ROLLBACK_SQL = readFileSync(path.join(ROOT, 'db/seo/admin_rollback_import_run.sql'), 'utf8')
/** Runs db/seo/admin_rollback_import_run.sql exactly as an administrator would (non-superuser admin login, simple-query protocol), with the run id substituted. */
async function adminRollback(e, runId, mutate = (x) => x) {
  const c = new pg.Client({ ...HOST, user: ADMIN_LOGIN, password: 'x', database: e.name }); await c.connect()
  const notices = []; c.on('notice', (m) => notices.push(m.message))
  try { await c.query(mutate(ROLLBACK_SQL.replace('00000000-0000-0000-0000-000000000000', runId).replace("v_run    text := '" + runId, "v_run    text := '" + runId))); return { ok: true, notices } }
  catch (x) { await c.query('ROLLBACK').catch(() => {}); return { ok: false, error: x.message, notices } }
  finally { await c.end() }
}
// usable members: anyone able to SET ROLE or inherit it. The administrator's bare ADMIN OPTION row (no SET, no INHERIT) is expected and cannot use the role.
const membersOf = async (e, role) => (await one(e.admin, `SELECT count(*)::int n FROM pg_auth_members WHERE roleid=$1::regrole AND (set_option OR inherit_option)`, [role])).n

// ===== T1 two-run rollback isolation (administrator SQL procedure) =====
await t('T1 two-run rollback isolation via the admin SQL procedure (+ over-broad delete aborts, no membership left behind, FK restrict, double rollback refused)', async () => {
  const e = await fresh(); try {
    const { run } = await happy(e)
    // fixtures: run B (different dates) and legacy rows with NULL syncRunId, same site
    await e.admin.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd","rowsFetched","rowsWritten","finishedAt") VALUES ('runB','site1','SEARCH_ANALYTICS','MANUAL','SUCCEEDED','2026-07-01','2026-07-05',25,25,now())`)
    for (let i = 1; i <= 5; i++) await e.admin.query(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ($1,'site1',$2,1,10,0.1,5,'runB')`, ['b-d' + i, `2026-07-0${i}`])
    for (let i = 1; i <= 20; i++) await e.admin.query(`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey","syncRunId") VALUES ($1,'site1','2026-07-01','p','qb'||$2::text,'ind','MOBILE',0,1,0,1,'rkB'||$2::text,'runB')`, ['b-p' + i, i])
    for (let i = 1; i <= 7; i++) await e.admin.query(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position) VALUES ($1,'site1',$2,1,10,0.1,5)`, ['n-d' + i, `2026-06-0${i}`])
    for (let i = 1; i <= 10; i++) await e.admin.query(`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey") VALUES ($1,'site1','2026-06-01','p','qn'||$2::text,'ind','MOBILE',0,1,0,1,'rkN'||$2::text)`, ['n-p' + i, i])
    // more fixtures: a run of ANOTHER site with rows, and a row of the authorised run itself dated OUTSIDE the approved range (corrupt/legacy) which the rollback must also remove
    await e.admin.query(`INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('site2','other.test','https://other.test',now())`)
    await e.admin.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('runC','site2','SEARCH_ANALYTICS','MANUAL','SUCCEEDED','2026-08-11','2026-11-08')`)
    for (let i = 1; i <= 3; i++) await e.admin.query(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ($1,'site2',$2,1,10,0.1,5,'runC')`, ['c-d' + i, `2026-08-1${i}`])
    for (let i = 1; i <= 2; i++) await e.admin.query(`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey","syncRunId") VALUES ($1,'site2','2026-08-11','p','qc'||$2::text,'ind','MOBILE',0,1,0,1,'rkC'||$2::text,'runC')`, ['c-p' + i, i])
    await e.admin.query(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ('a-oor','site1','2026-01-01',1,10,0.1,5,$1)`, [run.runId])
    const snap = () => one(e.admin, `SELECT (SELECT md5(string_agg(to_jsonb(t)::text,'|' ORDER BY id)) FROM seo_search_daily t WHERE "syncRunId" IS DISTINCT FROM $1) d,(SELECT md5(string_agg(to_jsonb(t)::text,'|' ORDER BY id)) FROM seo_search_performance t WHERE "syncRunId" IS DISTINCT FROM $1) p,(SELECT md5(to_jsonb(s)::text) FROM seo_gsc_sync_runs s WHERE id='runB') rb`, [run.runId])
    const before = await snap()
    // (1) a script that tries to delete ANOTHER run's rows inside the role block: nothing of run B is deleted and the script aborts (target rows remain), committing nothing
    const other = await adminRollback(e, run.runId, (x) => x.replace(/DELETE FROM seo_search_performance WHERE "syncRunId" = v_run/, `DELETE FROM seo_search_performance WHERE "syncRunId" = 'runB'`).replace(/DELETE FROM seo_search_daily       WHERE "syncRunId" = v_run/, `DELETE FROM seo_search_daily WHERE "syncRunId" = 'runB'`))
    assert.equal(other.ok, false); assert.match(other.error, /rows remain/); assert.deepEqual(await snap(), before); assert.equal(await membersOf(e, 'seo_import_rollback'), 0)
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"='runB'`)).n, 5)
    // (2) authorisation step removed / snapshot tampered: fails closed, nothing committed
    const noauth = await adminRollback(e, run.runId, (x) => x.replace(/INSERT INTO seo_import_rollback_authorisation \("runId"\) VALUES \(v_run\);/, 'NULL;')); assert.equal(noauth.ok, false); assert.equal(await membersOf(e, 'seo_import_rollback'), 0)
    const tamper = await adminRollback(e, run.runId, (x) => x.replace(/SELECT "runId" INTO STRICT v_run FROM seo_import_rollback_authorisation;/, `SELECT "runId" INTO STRICT v_run FROM seo_import_rollback_authorisation; PERFORM set_config('seo.rollback_before','tampered',true);`)); assert.equal(tamper.ok, false); assert.match(tamper.error, /outside the authorised run/)
    assert.deepEqual(await snap(), before); assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"=$1`, [run.runId])).n, 91)
    const out = await adminRollback(e, run.runId); assert.equal(out.ok, true, out.error); assert.ok(out.notices.some((m) => /91 daily rows and 4515 detail rows deleted/.test(m)), out.notices.join('|')) // 90 + the out-of-range row that carried this run's id
    assert.equal(await membersOf(e, 'seo_import_rollback'), 0) // temporary membership is gone after COMMIT
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"=$1`, [run.runId])).n, 0)
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE "syncRunId"=$1`, [run.runId])).n, 0)
    assert.deepEqual(await snap(), before) // run B rows, NULL rows and run B's row untouched byte-for-byte
    const rA = await one(e.admin, `SELECT status,"errorCode" FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId]); assert.deepEqual(rA, { status: 'CANCELLED', errorCode: 'ROLLED_BACK' })
    assert.equal((await one(e.admin, `SELECT status FROM seo_gsc_sync_runs WHERE id='runB'`)).status, 'SUCCEEDED')
    const again = await adminRollback(e, run.runId); assert.equal(again.ok, false); assert.match(again.error, /already CANCELLED/); assert.equal(await membersOf(e, 'seo_import_rollback'), 0)
    assert.equal((await q(e.admin, `SELECT 1 FROM seo_audit_log WHERE action='gsc.import.rolled_back' AND "entityId"=$1`, [run.runId])).length, 1)
    await assert.rejects(e.admin.query(`DELETE FROM seo_gsc_sync_runs WHERE id='runB'`), (x) => x.code === '23503') // FK RESTRICT while data points at it
    await invariants(e.admin, run.runId, { expectNullRows: 17, sites: 2 })
  } finally { await e.done() }
})

await t('T1b admin rollback guards: placeholder/invalid/unknown run id, a run of another site, and a failure after the grant all leave no membership and no change', async () => {
  const e = await fresh(); try {
    const { run } = await happy(e)
    const fixed = await one(e.admin, `SELECT (SELECT count(*)::int FROM seo_search_performance) p,(SELECT count(*)::int FROM seo_search_daily) d,(SELECT status FROM seo_gsc_sync_runs WHERE id=$1) st`, [run.runId])
    for (const [label, id, rx] of [['placeholder', '00000000-0000-0000-0000-000000000000', /edit the run id/], ['invalid', 'not-a-uuid', /edit the run id/], ['unknown', '11111111-1111-1111-1111-111111111111', /run not found/]]) {
      const r = await adminRollback(e, id, (x) => x.replace("'00000000-0000-0000-0000-000000000000'; ", `'${id}'; `)); assert.equal(r.ok, false, label); assert.match(r.error, rx, label); assert.equal(await membersOf(e, 'seo_import_rollback'), 0, label)
    }
    await e.admin.query(`INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('site2','other.test','https://other.test',now())`)
    await e.admin.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status) VALUES ('22222222-2222-2222-2222-222222222222','site2','SEARCH_ANALYTICS','MANUAL','SUCCEEDED')`)
    const o = await adminRollback(e, '22222222-2222-2222-2222-222222222222'); assert.equal(o.ok, false); assert.match(o.error, /another site/)
    const f = await adminRollback(e, run.runId, (x) => x.replace("RAISE NOTICE 'rolled back", "RAISE EXCEPTION 'injected failure after delete'; RAISE NOTICE 'rolled back")); assert.equal(f.ok, false); assert.match(f.error, /injected failure/)
    assert.equal(await membersOf(e, 'seo_import_rollback'), 0)
    assert.deepEqual(await one(e.admin, `SELECT (SELECT count(*)::int FROM seo_search_performance) p,(SELECT count(*)::int FROM seo_search_daily) d,(SELECT status FROM seo_gsc_sync_runs WHERE id=$1) st`, [run.runId]), fixed) // all-or-nothing
    // an ordinary application login (no ADMIN OPTION) cannot run the procedure at all: the GRANT fails and nothing happens
    const c = new pg.Client({ ...HOST, user: LOGIN, password: 'x', database: e.name }); await c.connect()
    try { await assert.rejects(c.query(ROLLBACK_SQL.replace('00000000-0000-0000-0000-000000000000', run.runId)), (x) => x.code === '42501'); await c.query('ROLLBACK').catch(() => {}) } finally { await c.end() }
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance`)).n, 4515)
  } finally { await e.done() }
})

// ===== T2 conflicts =====
for (const kind of ['identical', 'different']) await t(`T2 conflict (${kind}): step rolls back, existing row untouched, run PARTIAL, nothing overwritten`, async () => {
  const e = await fresh(); try {
    const run = await P.start(e.pool); const g = P.fakeGoogle(ds)
    await P.stepDaily(e.pool, run, g, ds.baseline)
    const r0 = ds.perf[1][0]; const rk = FP.performanceRowKey(r0)
    await e.admin.query(`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey") VALUES ('fx','site1',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [r0.date, r0.page, r0.query, r0.country, r0.device, kind === 'identical' ? r0.clicks : r0.clicks + 1, r0.impressions, r0.ctr, r0.position, rk])
    const fx0 = await one(e.admin, `SELECT md5(to_jsonb(t)::text) m FROM seo_search_performance t WHERE id='fx'`)
    const res = await P.runAll(e.pool, run, g, ds.baseline)
    assert.equal(res.failed, true); assert.equal(res.code, kind === 'identical' ? 'CONFLICT_IDENTICAL' : 'CONFLICT_DIFFERENT'); assert.equal(res.status, 'PARTIAL')
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE "syncRunId"=$1`, [run.runId])).n, 0)
    assert.deepEqual(await one(e.admin, `SELECT md5(to_jsonb(t)::text) m FROM seo_search_performance t WHERE id='fx'`), fx0)
    const r = await one(e.admin, `SELECT "rowsFetched","rowsWritten",status,"errorCode" FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId]); assert.equal(r.rowsWritten, 90); assert.equal(r.rowsFetched, 90)
    const fin = (await auditRows(e.admin, run.runId)).at(-1); assert.equal(fin.metadata.status, 'PARTIAL'); assert.equal(fin.metadata.errorCode, res.code)
    await invariants(e.admin, run.runId, { expectNullRows: 1 })
  } finally { await e.done() }
})
await t('T2 second import refused (TABLES_NOT_EMPTY): zero new runs/audit rows, data byte-identical; duplicate keys in a batch rejected', async () => {
  const e = await fresh(); try {
    const { run } = await happy(e)
    const snap = () => one(e.admin, `SELECT (SELECT count(*) FROM seo_gsc_sync_runs)::int runs,(SELECT count(*) FROM seo_audit_log)::int aud,(SELECT md5(string_agg(to_jsonb(t)::text,'|' ORDER BY id)) FROM seo_search_performance t) p,(SELECT md5(string_agg(to_jsonb(t)::text,'|' ORDER BY id)) FROM seo_search_daily t) d`)
    const b = await snap(); await assert.rejects(P.start(e.pool), (x) => x.code === 'TABLES_NOT_EMPTY'); assert.deepEqual(await snap(), b)
    await invariants(e.admin, run.runId)
    const e2 = await fresh(); try { const run2 = await P.start(e2.pool); const g = P.fakeGoogle(ds, { window: { 2: (rows) => ({ rows: [...rows.slice(0, -1), { ...rows[0] }], complete: true }) } })
      const res = await P.runAll(e2.pool, run2, g, ds.baseline); assert.equal(res.code, 'DUPLICATE_KEYS'); assert.equal((await one(e2.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE date BETWEEN $1 AND $2 AND "syncRunId"=$3`, [WINDOWS[1].start, WINDOWS[1].end, run2.runId])).n, 0); await invariants(e2.admin, run2.runId)
    } finally { await e2.done() }
  } finally { await e.done() }
})

// ===== T3 partial failure and resume =====
await t('T3 partial failure (503 on window 7) then resume: windows 1-6 not re-fetched, final SUCCEEDED, audit sequence', async () => {
  const e = await fresh(); try {
    const run = await P.start(e.pool); const bad = P.fakeGoogle(ds, { window: { 7: () => { const x = new Error('503'); x.status = 503; throw x } } })
    const res = await P.runAll(e.pool, run, bad, ds.baseline)
    assert.equal(res.failed, true); assert.equal(res.code, 'GOOGLE_HTTP_ERROR'); assert.equal(res.status, 'PARTIAL')
    assert.equal(bad.log.filter((l) => l.index === 7).length, 3) // 3 attempts
    const r = await one(e.admin, `SELECT * FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId]); assert.equal(r.status, 'PARTIAL'); assert.equal(r.rowsWritten, 90 + sumWin(6)); assert.equal(r.rowsFetched, 90 + sumWin(6))
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance`)).n, sumWin(6))
    await assert.rejects(P.finish(e.pool, run, ds.baseline), (x) => x.code === 'RUN_NOT_RUNNING') // never SUCCEEDED
    const fin1 = (await auditRows(e.admin, run.runId)).at(-1); assert.deepEqual([fin1.metadata.status, fin1.metadata.completedWindows, fin1.metadata.failedWindow], ['PARTIAL', 6, 7])
    await invariants(e.admin, run.runId)
    const ok = P.fakeGoogle(ds); await P.resume(e.pool, run.runId)
    const res2 = await P.runAll(e.pool, run, ok, ds.baseline); assert.equal(res2.status, 'SUCCEEDED')
    assert.equal(ok.log.filter((l) => l.kind === 'daily').length, 0); assert.deepEqual(ok.log.map((l) => l.index), [7, 8, 9, 10, 11, 12, 13])
    const r2 = await one(e.admin, `SELECT * FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId]); assert.equal(r2.rowsWritten, 4605); assert.equal(r2.rowsFetched, 4605); assert.equal(r2.status, 'SUCCEEDED'); assert.equal(r2.errorCode, null)
    assert.deepEqual((await auditRows(e.admin, run.runId)).map((x) => x.action + (x.metadata.status ? ':' + x.metadata.status : '')), ['gsc.import.started', 'gsc.import.finished:PARTIAL', 'gsc.import.resumed', 'gsc.import.finished:SUCCEEDED'])
    await invariants(e.admin, run.runId)
  } finally { await e.done() }
})
await t('T3 crash after window 4 (no fail path runs): RUNNING+stale, 2nd start refused, status shows 4 windows, resume completes', async () => {
  const e = await fresh(); try {
    const run = await P.start(e.pool); const g = P.fakeGoogle(ds, { window: { 5: () => { const x = new Error('crash'); x.crash = true; throw x } } })
    await assert.rejects(P.runAll(e.pool, run, g, ds.baseline), (x) => x.crash)
    const st = await P.status(e.pool, run.runId); assert.deepEqual([st.status, st.completedWindows], ['RUNNING', [1, 2, 3, 4]]); assert.equal(st.rowsWritten, 90 + sumWin(4))
    assert.equal((await q(e.admin, `SELECT 1 FROM seo_audit_log WHERE action='gsc.import.finished'`)).length, 0)
    await assert.rejects(P.start(e.pool), (x) => ['TABLES_NOT_EMPTY', 'RUN_IN_PROGRESS'].includes(x.code))
    await invariants(e.admin, run.runId)
    await assert.rejects(P.resume(e.pool, run.runId), (x) => x.code === 'RUN_NOT_PARTIAL') // explicit resume is for PARTIAL only; a RUNNING (crashed) run is simply continued, every step being idempotent
    const ok = P.fakeGoogle(ds); const res = await P.runAll(e.pool, run, ok, ds.baseline); assert.equal(res.status, 'SUCCEEDED'); assert.deepEqual(ok.log.map((l) => l.index), [5, 6, 7, 8, 9, 10, 11, 12, 13])
    await invariants(e.admin, run.runId)
  } finally { await e.done() }
})
await t('T3 poisoned DB row in window 5: tx rolls back (0 rows from window 5), run PARTIAL DB_ERROR, windows 1-4 intact', async () => {
  const e = await fresh(); try {
    await e.admin.query(`CREATE FUNCTION poison() RETURNS trigger AS $$ BEGIN IF NEW.query LIKE 'q5-10 %' THEN RAISE EXCEPTION 'poison'; END IF; RETURN NEW; END $$ LANGUAGE plpgsql; CREATE TRIGGER poison_t BEFORE INSERT ON seo_search_performance FOR EACH ROW EXECUTE FUNCTION poison()`)
    const { run, res } = await happy(e); assert.equal(res.code, 'DB_ERROR'); assert.equal(res.status, 'PARTIAL')
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE date BETWEEN $1 AND $2`, [WINDOWS[4].start, WINDOWS[4].end])).n, 0)
    const r = await one(e.admin, `SELECT "rowsWritten" FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId]); assert.equal(r.rowsWritten, 90 + sumWin(4))
    await invariants(e.admin, run.runId)
  } finally { await e.done() }
})

// ===== T4 concurrency =====
await t('T4 concurrency: racing starts, racing identical window steps, lock blocking, rollback vs step', async () => {
  const e = await fresh(); try {
    const rs = await Promise.allSettled([P.start(e.pool), P.start(e.pool)])
    assert.equal(rs.filter((x) => x.status === 'fulfilled').length, 1); assert.equal(rs.find((x) => x.status === 'rejected').reason.code, 'RUN_IN_PROGRESS')
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_gsc_sync_runs`)).n, 1); assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_audit_log WHERE action='gsc.import.started'`)).n, 1)
    const run = rs.find((x) => x.status === 'fulfilled').value; const g = P.fakeGoogle(ds)
    await P.stepDaily(e.pool, run, g, ds.baseline)
    const two = await Promise.all([P.stepWindow(e.pool, run, g, ds.baseline, WINDOWS[0]), P.stepWindow(e.pool, run, g, ds.baseline, WINDOWS[0])])
    assert.deepEqual(two.map((x) => x.inserted ?? 'already').sort(), [331, 'already'].sort())
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE date BETWEEN $1 AND $2`, [WINDOWS[0].start, WINDOWS[0].end])).n, 331)
    // lock blocking: a competing holder makes the step wait (advisory wait observed), then it completes after release
    const holder = await e.pool.connect(); await holder.query('BEGIN'); await holder.query(`SELECT pg_advisory_xact_lock(hashtext('gsc-import:'||$1))`, [P.SITE_DOMAIN])
    const pending = P.stepWindow(e.pool, run, g, ds.baseline, WINDOWS[1]); let waited = false
    for (let i = 0; i < 50 && !waited; i++) { await new Promise((r) => setTimeout(r, 100)); waited = (await one(e.admin, `SELECT count(*)::int n FROM pg_stat_activity WHERE datname=$1 AND wait_event='advisory'`, [e.name])).n >= 1 }
    assert.equal(waited, true, 'step should wait on the advisory lock')
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE date BETWEEN $1 AND $2`, [WINDOWS[1].start, WINDOWS[1].end])).n, 0)
    await holder.query('COMMIT'); holder.release(); assert.equal((await pending).inserted, 385)
    // rollback vs step queued behind a holder: end state must be consistent whichever runs first
    const h2 = await e.pool.connect(); await h2.query('BEGIN'); await h2.query(`SELECT pg_advisory_xact_lock(hashtext('gsc-import:'||$1))`, [P.SITE_DOMAIN])
    const s = P.stepWindow(e.pool, run, g, ds.baseline, WINDOWS[2]).then((x) => x, (x) => x); await new Promise((r) => setTimeout(r, 300)); const rb = adminRollback(e, run.runId)
    await new Promise((r) => setTimeout(r, 300)); await h2.query('COMMIT'); h2.release(); const [sres, rres] = await Promise.all([s, rb]); assert.equal(rres.ok, true, rres.error)
    const r = await one(e.admin, `SELECT status FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId]); assert.equal(r.status, 'CANCELLED')
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance`)).n + (await one(e.admin, `SELECT count(*)::int n FROM seo_search_daily`)).n, 0)
    await invariants(e.admin, run.runId)
  } finally { await e.done() }
})

// ===== T5 failed window validation =====
const t5 = [
  ['count-1 (stable)', (rows) => ({ rows: rows.slice(0, -1), complete: true }), 'WINDOW_COUNT_MISMATCH', true],
  ['count+1', (rows) => ({ rows: [...rows, { ...rows[0], query: 'extra-row' }], complete: true }), 'WINDOW_COUNT_MISMATCH', true],
  ['same count, changed clicks', (rows) => { rows[0].clicks += 1; return { rows, complete: true } }, 'WINDOW_DATA_CHANGED', true],
  ['truncated (complete=false)', (rows) => ({ rows, complete: false }), 'WINDOW_TRUNCATED', true],
  ['empty 200 response', () => ({ rows: [], complete: true }), 'WINDOW_COUNT_MISMATCH', true],
]
for (const [label, fn, code, stable] of t5) await t(`T5 failed window validation: ${label} -> ${code}, 0 rows from window 3, run PARTIAL`, async () => {
  const e = await fresh(); try {
    const g = P.fakeGoogle(ds, { window: { 3: fn } }); const { run, res } = await happy(e, g)
    assert.equal(res.code, code); assert.equal(res.status, 'PARTIAL'); assert.equal(res.diag.stable, stable)
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE date BETWEEN $1 AND $2`, [WINDOWS[2].start, WINDOWS[2].end])).n, 0)
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance`)).n, sumWin(2)); assert.equal(g.log.filter((l) => l.index > 3).length, 0)
    assert.notEqual((await one(e.admin, `SELECT status FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId])).status, 'SUCCEEDED')
    await invariants(e.admin, run.runId)
  } finally { await e.done() }
})
await t('T5 unstable response (different row count on every fetch) flagged stable=false', async () => {
  const e = await fresh(); try { let n = 0; const g = P.fakeGoogle(ds, { window: { 3: (rows) => ({ rows: rows.slice(0, rows.length - 1 - (n++ % 3)), complete: true }) } }); const { run, res } = await happy(e, g)
    assert.equal(res.code, 'WINDOW_COUNT_MISMATCH'); assert.equal(res.diag.stable, false); await invariants(e.admin, run.runId) } finally { await e.done() }
})

// ===== T6 out-of-range records =====
const rngBad = [
  ['window 1 row dated 2026-08-10', { window: { 1: (rows) => { rows[0].date = '2026-08-10'; return { rows, complete: true } } } }, 1],
  ['window 13 row dated 2026-11-09', { window: { 13: (rows) => { rows[0].date = '2026-11-09'; return { rows, complete: true } } } }, 13],
  ['malformed date 2026-13-40', { window: { 4: (rows) => { rows[0].date = '2026-13-40'; return { rows, complete: true } } } }, 4],
  ['in range but outside its window', { window: { 2: (rows) => { rows[0].date = '2026-08-11'; return { rows, complete: true } } } }, 2],
  ['daily extra date 2026-11-09', { daily: (rows) => { rows[89].date = '2026-11-09'; return rows } }, 0],
]
for (const [label, faults, idx] of rngBad) await t(`T6 out-of-range: ${label} rejected before insert`, async () => {
  const e = await fresh(); try { const g = P.fakeGoogle(ds, faults); const { run, res } = await happy(e, g)
    assert.equal(res.code, 'OUT_OF_RANGE_ROW'); assert.equal(res.status, idx === 0 ? 'FAILED' : 'PARTIAL')
    assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE date NOT BETWEEN $1 AND $2`, [P.RANGE_START, P.RANGE_END])).n, 0)
    if (idx > 0) assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_search_performance WHERE date BETWEEN $1 AND $2`, [WINDOWS[idx - 1].start, WINDOWS[idx - 1].end])).n, 0)
    await invariants(e.admin, run.runId) } finally { await e.done() }
})
await t('T6 all Google requests stay inside the exact range, property and settings (14 calls)', async () => {
  const e = await fresh(); try { const { run, google } = await happy(e)
    assert.equal(google.log.length, 14); assert.ok(google.log.every((l) => l.startDate >= P.RANGE_START && l.endDate <= P.RANGE_END && l.property === P.PROPERTY && l.dataState === 'final' && l.type === 'web'))
    assert.equal(Math.min(...google.log.map((l) => +l.startDate.replace(/-/g, ''))), 20260811); assert.equal(Math.max(...google.log.map((l) => +l.endDate.replace(/-/g, ''))), 20261108)
    assert.equal((await one(e.admin, `SELECT (SELECT min(date) FROM seo_search_daily)::text mn,(SELECT max(date) FROM seo_search_daily)::text mx`)).mn, '2026-08-11'); await invariants(e.admin, run.runId) } finally { await e.done() }
})

// ===== T7 audit-log correctness =====
await t('T7 audit correctness: actions, entity, actor types, whitelisted metadata, no query/URL text, append-only', async () => {
  const e = await fresh(); try {
    const { run } = await happy(e); const a = await auditRows(e.admin, run.runId)
    assert.deepEqual(a.map((x) => [x.action, x.actorType, x.entityType, x.entityId]), [['gsc.import.started', 'ADMIN', 'seo_gsc_sync_runs', run.runId], ['gsc.import.finished', 'SYSTEM', 'seo_gsc_sync_runs', run.runId]])
    const allowed = new Set(['property', 'rangeStart', 'rangeEnd', 'status', 'errorCode', 'completedWindows', 'failedWindow', 'rowsFetched', 'rowsWritten', 'from', 'deletedDaily', 'deletedPerformance'])
    for (const x of a) { assert.ok(Object.keys(x.metadata).every((k) => allowed.has(k))); const s = JSON.stringify(x.metadata); assert.ok(!/example\.test|q1-|q5-|https?:\/\//.test(s.replace(PROPERTY_RE, ''))) }
    const w = await e.pool.connect(); try { await w.query('BEGIN'); await w.query('SET LOCAL ROLE seo_importer')
      await w.query('SAVEPOINT a'); await assert.rejects(w.query(`UPDATE seo_audit_log SET actor='x'`), (x) => x.code === '42501'); await w.query('ROLLBACK TO a')
      await assert.rejects(w.query(`DELETE FROM seo_audit_log`), (x) => x.code === '42501') } finally { await w.query('ROLLBACK').catch(() => {}); w.release() }
    await invariants(e.admin, run.runId)
  } finally { await e.done() }
})
await t('T7 failed audit insert cannot leave a wrong status: finished-audit blocked -> run stays RUNNING, no SUCCEEDED, then finish succeeds after fix', async () => {
  const e = await fresh(); try {
    await e.admin.query(`CREATE FUNCTION block_fin() RETURNS trigger AS $$ BEGIN IF NEW.action='gsc.import.finished' THEN RAISE EXCEPTION 'audit blocked'; END IF; RETURN NEW; END $$ LANGUAGE plpgsql; CREATE TRIGGER block_fin_t BEFORE INSERT ON seo_audit_log FOR EACH ROW EXECUTE FUNCTION block_fin()`)
    const { run, res } = await happy(e); assert.equal(res.stale, true); assert.equal(res.failed, true)
    const r = await one(e.admin, `SELECT status,"finishedAt","errorCode","rowsWritten" FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId]); assert.deepEqual([r.status, r.finishedAt, r.errorCode, r.rowsWritten], ['RUNNING', null, null, 4605])
    assert.equal((await q(e.admin, `SELECT 1 FROM seo_audit_log WHERE action='gsc.import.finished'`)).length, 0)
    await invariants(e.admin, run.runId)
    await e.admin.query(`DROP TRIGGER block_fin_t ON seo_audit_log`)
    assert.equal((await P.finish(e.pool, run, ds.baseline)).status, 'SUCCEEDED'); assert.equal((await auditRows(e.admin, run.runId)).at(-1).metadata.status, 'SUCCEEDED'); await invariants(e.admin, run.runId)
  } finally { await e.done() }
})
await t('T7 failed audit insert at START: no run row, no data', async () => {
  const e = await fresh(); try {
    await e.admin.query(`CREATE FUNCTION block_st() RETURNS trigger AS $$ BEGIN IF NEW.action='gsc.import.started' THEN RAISE EXCEPTION 'audit blocked'; END IF; RETURN NEW; END $$ LANGUAGE plpgsql; CREATE TRIGGER block_st_t BEFORE INSERT ON seo_audit_log FOR EACH ROW EXECUTE FUNCTION block_st()`)
    await assert.rejects(P.start(e.pool)); assert.equal((await one(e.admin, `SELECT count(*)::int n FROM seo_gsc_sync_runs`)).n, 0)
  } finally { await e.done() }
})

// ===== T8 status / row-count consistency (never success if incomplete) =====
await t('T8 never SUCCEEDED when incomplete: tampered counter, deleted row, altered row, missing window all end PARTIAL/INCOMPLETE', async () => {
  const tamper = [['counter -1', (a, id) => a.query(`UPDATE seo_gsc_sync_runs SET "rowsWritten"="rowsWritten"-1 WHERE id=$1`, [id])], ['one detail row deleted', (a) => a.query(`DELETE FROM seo_search_performance WHERE id=(SELECT id FROM seo_search_performance LIMIT 1)`)], ['one detail value altered', (a) => a.query(`UPDATE seo_search_performance SET clicks=clicks+0, impressions=impressions+1 WHERE id=(SELECT id FROM seo_search_performance LIMIT 1)`)], ['one daily row altered', (a) => a.query(`UPDATE seo_search_daily SET clicks=clicks+1 WHERE id=(SELECT id FROM seo_search_daily LIMIT 1)`)]]
  for (const [label, fn] of tamper) { const e = await fresh(); try {
    const run = await P.start(e.pool); const g = P.fakeGoogle(ds); await P.stepDaily(e.pool, run, g, ds.baseline); for (const w of WINDOWS) await P.stepWindow(e.pool, run, g, ds.baseline, w)
    await fn(e.admin, run.runId); const f = await P.finish(e.pool, run, ds.baseline); assert.equal(f.status, 'PARTIAL', label)
    const r = await one(e.admin, `SELECT status,"errorCode" FROM seo_gsc_sync_runs WHERE id=$1`, [run.runId]); assert.deepEqual([r.status, r.errorCode], ['PARTIAL', 'INCOMPLETE'], label)
  } finally { await e.done() } }
})
await t('T8 invariant checker is not vacuous: detects tampering', async () => {
  const e = await fresh(); try { const { run } = await happy(e); await e.admin.query(`UPDATE seo_gsc_sync_runs SET "rowsWritten"=4604 WHERE id=$1`, [run.runId]); await assert.rejects(invariants(e.admin, run.runId), /invariant violations/) } finally { await e.done() }
})

// ===== role / RLS permission matrix =====

const probeAs = async (e, role, probes, viaAdmin = false, pre = []) => {
  const c = viaAdmin ? await e.adminPool.connect() : await e.pool.connect(); const out = {}
  try { await c.query('BEGIN'); for (const x of pre) await c.query(x); await c.query(`SET LOCAL ROLE ${role}`)
    out.identity = (await c.query(`SELECT session_user su, current_user cu, (SELECT rolbypassrls FROM pg_roles WHERE rolname=current_user) bypass, (SELECT rolsuper FROM pg_roles WHERE rolname=current_user) su2`)).rows[0]
    for (const [label, sql] of probes) { await c.query('SAVEPOINT s'); try { const r = await c.query(sql); out[label] = 'allowed' + (r.rows[0]?.n !== undefined ? ` n=${r.rows[0].n}` : r.rowCount ? ` rows=${r.rowCount}` : ''); } catch (x) { out[label] = 'denied ' + x.code } await c.query('ROLLBACK TO s') }
  } finally { await c.query('ROLLBACK').catch(() => {}); c.release() }
  return out
}
const common = [
  ['INSERT seo_sites', `INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('x','x.test','https://x.test',now())`],
  ['UPDATE seo_sites', `UPDATE seo_sites SET "baseUrl"='https://y.test'`],
  ['DELETE seo_sites', `DELETE FROM seo_sites`],
  ['SELECT seo_oauth_states', `SELECT count(*)::int n FROM seo_oauth_states`],
  ['INSERT seo_oauth_connections', `INSERT INTO seo_oauth_connections (id,"siteId",provider,"updatedAt") VALUES ('o2','site1','GA4',now())`],
  ['UPDATE seo_oauth_connections (any col)', `UPDATE seo_oauth_connections SET state='DISCONNECTED'`],
  ['DELETE seo_oauth_connections', `DELETE FROM seo_oauth_connections`],
  ['INSERT seo_sitemap_status', `INSERT INTO seo_sitemap_status (id,"siteId",path) VALUES ('sm','site1','/x')`],
  ['SELECT seo_sitemap_status', `SELECT count(*)::int n FROM seo_sitemap_status`],
  ['INSERT seo_ga4_landing_daily', `INSERT INTO seo_ga4_landing_daily (id,"siteId",date,"landingPage","channelGroup",country,device,sessions,"engagedSessions","keyEvents","rowKey") VALUES ('g','site1','2026-08-11','/','x','x','x',1,1,1,'k')`],
  ['INSERT seo_keywords', `INSERT INTO seo_keywords (id,"siteId",keyword,"updatedAt") VALUES ('k','site1','kw',now())`],
  ['SELECT seo_recommendations', `SELECT count(*)::int n FROM seo_recommendations`],
  ['SELECT seo_crawl_runs', `SELECT count(*)::int n FROM seo_crawl_runs`],
  ['UPDATE seo_audit_log', `UPDATE seo_audit_log SET actor='z'`],
  ['DELETE seo_audit_log', `DELETE FROM seo_audit_log`],
  ['DELETE seo_gsc_sync_runs', `DELETE FROM seo_gsc_sync_runs`],
  ['UPDATE seo_gsc_sync_runs.kind', `UPDATE seo_gsc_sync_runs SET kind='SITEMAPS'`],
  ['UPDATE seo_gsc_sync_runs.rangeEnd', `UPDATE seo_gsc_sync_runs SET "rangeEnd"='2026-11-09'`],
  ['UPDATE seo_search_daily', `UPDATE seo_search_daily SET clicks=clicks+1`],
  ['UPDATE seo_search_performance', `UPDATE seo_search_performance SET clicks=clicks+1`],
  ['INSERT daily without syncRunId', `INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position) VALUES ('d0','site1','2026-08-11',1,1,1,1)`],
  ['INSERT audit non-import action', `INSERT INTO seo_audit_log (id,"actorType",actor,action,"entityType") VALUES ('a0','SYSTEM','x','recommendation.approved','seo_recommendations')`],
  ['INSERT sync run kind SITEMAPS', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status) VALUES ('rz','site1','SITEMAPS','MANUAL','RUNNING')`],
  ['INSERT sync run other range', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('rz','site1','SEARCH_ANALYTICS','MANUAL','RUNNING','2026-01-01','2026-01-31')`],
]
await t('PERM seo_importer: reads site+GSC connection, the 4-table writes work, EVERYTHING else is denied', async () => {
  const e = await fresh(); try {
    await e.admin.query(`INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('other','other.test','https://other.test',now())`)
    await e.admin.query(`INSERT INTO seo_oauth_connections (id,"siteId",provider,state,"propertyUrl","updatedAt") VALUES ('oc2','other','GSC','CONNECTED','sc-domain:other.test',now())`)
    await e.admin.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('seed','site1','SEARCH_ANALYTICS','MANUAL','RUNNING','2026-08-11','2026-11-08')`)
    const out = await probeAs(e, 'seo_importer', [
      ['SELECT seo_sites (only the approved site)', `SELECT count(*)::int n FROM seo_sites`],
      ['SELECT seo_sites other.test', `SELECT count(*)::int n FROM seo_sites WHERE domain='other.test'`],
      ['SELECT seo_sites baseUrl column', `SELECT "baseUrl" FROM seo_sites`],
      ['SELECT oauth GSC connections (only approved property)', `SELECT count(*)::int n FROM seo_oauth_connections WHERE provider='GSC'`],
      ['SELECT oauth cipher column', `SELECT "refreshTokenCipher" FROM seo_oauth_connections`],
      ['SELECT oauth accessToken-like other col (scopes)', `SELECT scopes FROM seo_oauth_connections`],
      ['INSERT second active run (one-active-run index)', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('rv','site1','SEARCH_ANALYTICS','MANUAL','RUNNING','2026-08-11','2026-11-08')`],
      ['UPDATE sync run bookkeeping', `UPDATE seo_gsc_sync_runs SET "rowsWritten"=1 WHERE id='seed'`],
      ['UPDATE sync run to SUCCEEDED', `UPDATE seo_gsc_sync_runs SET status='SUCCEEDED' WHERE id='seed'`],
      ['UPDATE sync run to CANCELLED', `UPDATE seo_gsc_sync_runs SET status='CANCELLED' WHERE id='seed'`],
      ['INSERT audit gsc.import.started', `INSERT INTO seo_audit_log (id,"actorType",actor,action,"entityType","entityId") VALUES ('a1','ADMIN','x','gsc.import.started','seo_gsc_sync_runs','seed')`],
      ['INSERT audit gsc.import.rolled_back', `INSERT INTO seo_audit_log (id,"actorType",actor,action,"entityType","entityId") VALUES ('a2','ADMIN','x','gsc.import.rolled_back','seo_gsc_sync_runs','seed')`],
      ['SELECT audit (non-import row hidden)', `SELECT count(*)::int n FROM seo_audit_log`],
      ['INSERT seo_search_daily (with run)', `INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ('d1','site1','2026-08-11',1,1,1,1,'seed')`],
      ['INSERT seo_search_daily other site', `INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ('d2','other','2026-08-11',1,1,1,1,'seed')`],
      ['INSERT seo_search_performance (with run)', `INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey","syncRunId") VALUES ('p1','site1','2026-08-11','p','q','ind','MOBILE',0,1,0,1,'rk','seed')`],
      ['DELETE seo_search_performance', `DELETE FROM seo_search_performance`],
      ['DELETE seo_search_daily', `DELETE FROM seo_search_daily`],
      ...common,
    ])
    globalThis.__permImporter = out; console.log('   PERM seo_importer', JSON.stringify(out))
    assert.deepEqual(out.identity, { su: LOGIN, cu: 'seo_importer', bypass: false, su2: false })
    for (const k of ['UPDATE sync run bookkeeping', 'UPDATE sync run to SUCCEEDED', 'INSERT audit gsc.import.started', 'INSERT seo_search_daily (with run)', 'INSERT seo_search_performance (with run)', 'SELECT oauth cipher column', 'SELECT seo_sites baseUrl column'.replace('baseUrl column', 'baseUrl column')]) { if (k === 'SELECT seo_sites baseUrl column') continue; assert.match(out[k], /^allowed/, k) }
    assert.equal(out['SELECT seo_sites (only the approved site)'], 'allowed n=1'); assert.equal(out['SELECT seo_sites other.test'], 'allowed n=0'); assert.equal(out['SELECT oauth GSC connections (only approved property)'], 'allowed n=1')
    for (const k of ['INSERT second active run (one-active-run index)', 'SELECT seo_sites baseUrl column', 'SELECT oauth accessToken-like other col (scopes)', 'UPDATE sync run to CANCELLED', 'INSERT audit gsc.import.rolled_back', 'DELETE seo_search_performance', 'DELETE seo_search_daily', 'INSERT seo_search_daily other site']) assert.match(out[k], /^denied/, k)
    for (const [k] of common) assert.ok(/^denied/.test(out[k]) || /n=0$/.test(out[k]), `${k}: ${out[k]}`)
  } finally { await e.done() }
})
await t('PERM seo_import_rollback (privileges of the role itself, probed by an administrator): only DELETE on the two search tables + CANCEL a run + rolled_back audit; nothing else', async () => {
  const e = await fresh(); try {
    await e.admin.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status) VALUES ('seed','site1','SEARCH_ANALYTICS','MANUAL','SUCCEEDED')`)
    await e.admin.query(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ('d1','site1','2026-08-11',1,1,1,1,'seed')`)
    await e.admin.query(`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey","syncRunId") VALUES ('p1','site1','2026-08-11','p','q','ind','MOBILE',0,1,0,1,'rk','seed')`)
    const out = await probeAs(e, 'seo_import_rollback', [
      ['DELETE seo_search_performance', `DELETE FROM seo_search_performance WHERE "syncRunId"='seed'`],
      ['DELETE seo_search_daily', `DELETE FROM seo_search_daily WHERE "syncRunId"='seed'`],
      ['UPDATE sync run to CANCELLED', `UPDATE seo_gsc_sync_runs SET status='CANCELLED',"errorCode"='ROLLED_BACK',"finishedAt"=now() WHERE id='seed'`],
      ['UPDATE sync run to RUNNING (resurrect)', `UPDATE seo_gsc_sync_runs SET status='RUNNING' WHERE id='seed'`],
      ['UPDATE sync run to SUCCEEDED', `UPDATE seo_gsc_sync_runs SET status='SUCCEEDED' WHERE id='seed'`],
      ['INSERT audit gsc.import.rolled_back', `INSERT INTO seo_audit_log (id,"actorType",actor,action,"entityType","entityId") VALUES ('a1','ADMIN','x','gsc.import.rolled_back','seo_gsc_sync_runs','seed')`],
      ['INSERT audit gsc.import.started', `INSERT INTO seo_audit_log (id,"actorType",actor,action,"entityType","entityId") VALUES ('a2','ADMIN','x','gsc.import.started','seo_gsc_sync_runs','seed')`],
      ['INSERT seo_search_daily', `INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ('d9','site1','2026-08-12',1,1,1,1,'seed')`],
      ['INSERT sync run', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status) VALUES ('rq','site1','SEARCH_ANALYTICS','MANUAL','RUNNING')`],
      ['SELECT oauth connections', `SELECT count(*)::int n FROM seo_oauth_connections`],
      ['INSERT authorisation (self-authorise)', `INSERT INTO seo_import_rollback_authorisation ("runId") VALUES ('seed')`],
      ['UPDATE authorisation (retarget)', `UPDATE seo_import_rollback_authorisation SET "runId"='other'`],
      ['DELETE authorisation', `DELETE FROM seo_import_rollback_authorisation`],
      ['SELECT authorisation (own transaction row only)', `SELECT count(*)::int n FROM seo_import_rollback_authorisation`],
      ...common,
    ], true, [`INSERT INTO seo_import_rollback_authorisation ("runId") VALUES ('seed')`])
    console.log('   PERM seo_import_rollback', JSON.stringify(out))
    assert.deepEqual(out.identity, { su: aurl.username, cu: 'seo_import_rollback', bypass: false, su2: false })
    for (const k of ['DELETE seo_search_performance', 'DELETE seo_search_daily', 'UPDATE sync run to CANCELLED', 'INSERT audit gsc.import.rolled_back']) assert.match(out[k], /^allowed/, k)
    for (const k of ['UPDATE sync run to RUNNING (resurrect)', 'UPDATE sync run to SUCCEEDED', 'INSERT audit gsc.import.started', 'INSERT seo_search_daily', 'INSERT sync run', 'SELECT oauth connections', 'INSERT authorisation (self-authorise)', 'UPDATE authorisation (retarget)', 'DELETE authorisation']) assert.match(out[k], /^denied/, k)
    assert.equal(out['SELECT authorisation (own transaction row only)'], 'allowed n=1')
    for (const [k] of common) if (!/DELETE seo_audit_log|UPDATE seo_audit_log|DELETE seo_gsc_sync_runs|UPDATE seo_gsc_sync_runs|UPDATE seo_search|INSERT daily|INSERT audit|INSERT sync run|INSERT seo_sites|UPDATE seo_sites|DELETE seo_sites|SELECT seo_oauth_states|oauth|sitemap|ga4|keywords|recommendations|crawl/.test(k)) throw new Error('unclassified ' + k); else assert.ok(/^denied/.test(out[k]) || /n=0$/.test(out[k]), `${k}: ${out[k]}`)
  } finally { await e.done() }
})
await t('PERM application login: holds seo_importer only; cannot SET ROLE to seo_import_rollback / seo_worker / postgres, cannot GRANT itself anything; rollback role has no members at rest', async () => {
  const e = await fresh(); try {
    const c = await e.pool.connect(); try {
      const plain = await c.query(`SELECT has_table_privilege(current_user,'seo_search_daily','INSERT') a, has_table_privilege(current_user,'seo_sites','SELECT') b, has_table_privilege(current_user,'seo_search_daily','DELETE') d`); assert.deepEqual(plain.rows[0], { a: false, b: false, d: false }) // INHERIT FALSE: nothing without SET ROLE
      for (const r of ['seo_import_rollback', 'seo_worker', 'postgres']) { await c.query('BEGIN'); await assert.rejects(c.query(`SET LOCAL ROLE ${r}`), (x) => x.code === '42501', r); await c.query('ROLLBACK') }
      await c.query('BEGIN'); await c.query('SET LOCAL ROLE seo_importer'); await assert.rejects(c.query('SET LOCAL ROLE seo_import_rollback'), (x) => x.code === '42501'); await c.query('ROLLBACK') // no hopping from the one role it holds
      for (const g of ['GRANT seo_import_rollback TO CURRENT_USER', `GRANT seo_import_rollback TO ${BYPASS}`]) { await c.query('BEGIN'); await assert.rejects(c.query(g), (x) => x.code === '42501', g); await c.query('ROLLBACK') }
    } finally { c.release() }
    assert.equal(await membersOf(e, 'seo_import_rollback'), 0) // nobody can use it at rest; the only row is the administrator's bare ADMIN OPTION
    const m = await one(e.admin, `SELECT m.rolname member, a.admin_option ao, a.set_option so, a.inherit_option io FROM pg_auth_members a JOIN pg_roles m ON m.oid=a.member WHERE a.roleid='seo_import_rollback'::regrole`)
    assert.deepEqual(m, { member: ADMIN_LOGIN, ao: true, so: false, io: false })
    const im = await q(e.admin, `SELECT m.rolname member FROM pg_auth_members a JOIN pg_roles m ON m.oid=a.member WHERE a.roleid='seo_importer'::regrole ORDER BY 1`); assert.ok(im.some((x) => x.member === LOGIN))
  } finally { await e.done() }
})
await t('PERM authorisation table: service_role / anon / authenticated / PUBLIC / seo_importer / seo_worker hold NO privilege (also after Supabase-style default privileges); only seo_import_rollback SELECT', async () => {
  assert.ok(/REVOKE ALL PRIVILEGES ON TABLE public\.seo_import_rollback_authorisation FROM service_role/.test(read('db/seo/0005_seo_import_roles.sql')))
  const e = await fresh(); try {
    const priv = async () => (await e.admin.query(`SELECT coalesce(pg_get_userbyid(x.grantee),'PUBLIC') g, x.privilege_type p FROM pg_class c, aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) x WHERE c.oid='public.seo_import_rollback_authorisation'::regclass AND x.grantee <> c.relowner AND x.grantee <> (SELECT oid FROM pg_roles WHERE rolname = $1) ORDER BY 1,2`, [ADMIN_LOGIN])).rows.map((r) => r.g + ':' + r.p)
    assert.deepEqual(await priv(), ['seo_import_rollback:SELECT'])
    // when a service_role exists on this server, prove the revoke is what removes a Supabase-style default grant (mutation: grant it back, the check must see it)
    if ((await e.admin.query(`SELECT 1 FROM pg_roles WHERE rolname='service_role'`)).rowCount) {
      await e.admin.query('GRANT TRUNCATE ON public.seo_import_rollback_authorisation TO service_role'); assert.ok((await priv()).includes('service_role:TRUNCATE'))
      await e.admin.query('REVOKE ALL PRIVILEGES ON TABLE public.seo_import_rollback_authorisation FROM service_role'); assert.deepEqual(await priv(), ['seo_import_rollback:SELECT'])
    }
  } finally { await e.done() }
})
await t('PERM RLS is enforced after SET LOCAL ROLE even for a BYPASSRLS login (owner_like): removing the site policy hides the site from seo_importer', async () => {
  const e = await fresh(); try {
    await e.admin.query(`GRANT seo_importer TO ${BYPASS} WITH INHERIT FALSE, SET TRUE`)
    const o = new pg.Client({ ...HOST, user: BYPASS, password: 'x', database: e.name }); await o.connect()
    try { assert.equal((await o.query(`SELECT count(*)::int n FROM seo_sites`)).rows[0].n, 1); await e.admin.query(`DROP POLICY seo_importer_site_read ON seo_sites`)
      await o.query('BEGIN'); await o.query('SET LOCAL ROLE seo_importer'); const n = (await o.query(`SELECT count(*)::int n FROM seo_sites`)).rows[0].n; await o.query('ROLLBACK'); assert.equal(n, 0)
    } finally { await o.end() }
  } finally { await e.done() }
})

// ===================== REVISED RLS SCOPE: multi-run fixture (scratch) =====================
// Fixture: THE approved run rA (RUNNING, site1, approved range); rB (site1, other range, SUCCEEDED); rCancelled / rFailed (site1, approved range, not active); rCron (site1, SCHEDULE trigger);
// rOther (another site, approved range, RUNNING). Rows: in-range rows of rA, an OUT-OF-RANGE row tagged rA, rows of rB (all outside the approved range), other-site rows, legacy rows with NULL run.
async function seedScope(e) {
  const a = e.admin
  await a.query(`INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('other','other.test','https://other.test',now())`)
  const run = (id, site, status, start, end, trig = 'MANUAL') => a.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ($1,$2,'SEARCH_ANALYTICS',$3::"SeoTrigger",$4::"SeoRunStatus",$5,$6)`, [id, site, trig, status, start, end])
  await run('rA', 'site1', 'RUNNING', '2026-08-11', '2026-11-08'); await run('rB', 'site1', 'SUCCEEDED', '2026-07-01', '2026-07-05'); await run('rCancelled', 'site1', 'CANCELLED', '2026-08-11', '2026-11-08')
  await run('rFailed', 'site1', 'FAILED', '2026-08-11', '2026-11-08'); await run('rCron', 'site1', 'RUNNING', '2026-08-11', '2026-11-08', 'SCHEDULE'); await run('rOther', 'other', 'RUNNING', '2026-08-11', '2026-11-08')
  const d = (id, site, date, r) => a.query(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ($1,$2,$3,1,10,0.1,5,$4)`, [id, site, date, r])
  const pf = (id, site, date, r) => a.query(`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey","syncRunId") VALUES ($1,$2,$3,'p',$1,'ind','MOBILE',0,1,0,1,$1,$4)`, [id, site, date, r])
  for (const [i, dt] of [['a1', '2026-08-12'], ['a2', '2026-08-13'], ['a3', '2026-08-14'], ['a-oor', '2026-01-01']]) await d(i, 'site1', dt, 'rA') // (siteId,date) is unique: 08-11 and 11-08 stay free for the boundary probes
  for (const [i, dt] of [['ap1', '2026-08-11'], ['ap2', '2026-08-12'], ['ap-oor', '2026-02-02']]) await pf(i, 'site1', dt, 'rA')
  for (const [i, dt] of [['b1', '2026-07-01'], ['b2', '2026-07-02']]) await d(i, 'site1', dt, 'rB'); await pf('bp1', 'site1', '2026-07-01', 'rB')
  for (const [i, dt] of [['o1', '2026-08-11'], ['o2', '2026-08-12']]) await d(i, 'other', dt, 'rOther'); await pf('op1', 'other', '2026-08-11', 'rOther')
  for (const [i, dt] of [['n1', '2026-06-01'], ['n2', '2026-06-02']]) await d(i, 'site1', dt, null); await pf('np1', 'site1', '2026-06-01', null)
}
const insD = (id, site, date, r) => [`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position,"syncRunId") VALUES ('${id}','${site}','${date}',1,1,1,1,${r === null ? 'NULL' : `'${r}'`})`]
const insP = (id, site, date, r) => [`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey","syncRunId") VALUES ('${id}','${site}','${date}','p','q','ind','MOBILE',0,1,0,1,'${id}',${r === null ? 'NULL' : `'${r}'`})`]
/** Runs probes in savepoints inside one transaction on client c (already BEGUN, role set). expect: 'ok' (>=1 row/ok), 'zero' (statement ran, 0 rows), 'denied' (error), or a number (row count). Returns violation strings. */
async function runProbes(c, probes) {
  const v = []
  for (const [label, sql, expect] of probes) {
    await c.query('SAVEPOINT pr'); let got
    try { const r = await c.query(sql); got = r.rows[0]?.n !== undefined ? Number(r.rows[0].n) : r.rowCount } catch (x) { got = 'denied' }
    await c.query('ROLLBACK TO pr')
    const good = expect === 'ok' ? typeof got === 'number' && got >= 1 : expect === 'zero' ? got === 0 : expect === 'denied' ? got === 'denied' : got === expect
    if (!good) v.push(`${label}: expected ${expect}, got ${got}`)
  }
  return v
}
const cnt = async (e, sql, p = []) => (await one(e.admin, sql, p)).n
/** Importer scope violations on a seeded scratch DB (empty list = every restriction held). */
async function importerScopeViolations(e) {
  const c = await e.pool.connect(); let v = []
  try {
    await c.query('BEGIN'); await c.query('SET LOCAL ROLE seo_importer')
    const site1Daily = await cnt(e, `SELECT count(*)::int n FROM seo_search_daily WHERE "siteId"='site1'`), site1Perf = await cnt(e, `SELECT count(*)::int n FROM seo_search_performance WHERE "siteId"='site1'`)
    v = await runProbes(c, [
      ['daily valid (approved site, in range, approved RUNNING run)', insD('t0', 'site1', '2026-08-15', 'rA')[0], 'ok'],
      ['daily first day of range', insD('t1', 'site1', '2026-08-11', 'rA')[0], 'ok'], ['daily last day of range', insD('t1b', 'site1', '2026-11-08', 'rA')[0], 'ok'],
      ['daily day BEFORE range (2026-08-10)', insD('t2', 'site1', '2026-08-10', 'rA')[0], 'denied'], ['daily day AFTER range (2026-11-09)', insD('t3', 'site1', '2026-11-09', 'rA')[0], 'denied'], ['daily far outside range', insD('t4', 'site1', '2026-01-01', 'rA')[0], 'denied'],
      ['daily attached to run rB (other range)', insD('t5', 'site1', '2026-08-14', 'rB')[0], 'denied'], ['daily attached to CANCELLED run', insD('t6', 'site1', '2026-08-14', 'rCancelled')[0], 'denied'],
      ['daily attached to FAILED run', insD('t7', 'site1', '2026-08-14', 'rFailed')[0], 'denied'], ['daily attached to SCHEDULE-trigger run', insD('t8', 'site1', '2026-08-14', 'rCron')[0], 'denied'],
      ['daily site1 row attached to ANOTHER SITE\'s run', insD('t9', 'site1', '2026-08-14', 'rOther')[0], 'denied'], ['daily other-site row attached to the other site\'s run', insD('t10', 'other', '2026-08-14', 'rOther')[0], 'denied'],
      ['daily other-site row attached to rA', insD('t11', 'other', '2026-08-14', 'rA')[0], 'denied'], ['daily with nonexistent run', insD('t12', 'site1', '2026-08-14', 'nope')[0], 'denied'], ['daily with NULL run', insD('t13', 'site1', '2026-08-14', null)[0], 'denied'],
      ['perf valid', insP('u1', 'site1', '2026-08-14', 'rA')[0], 'ok'], ['perf day BEFORE range', insP('u2', 'site1', '2026-08-10', 'rA')[0], 'denied'], ['perf day AFTER range', insP('u3', 'site1', '2026-11-09', 'rA')[0], 'denied'],
      ['perf attached to rB', insP('u4', 'site1', '2026-08-14', 'rB')[0], 'denied'], ['perf attached to CANCELLED run', insP('u5', 'site1', '2026-08-14', 'rCancelled')[0], 'denied'],
      ['perf site1 row attached to another site\'s run', insP('u6', 'site1', '2026-08-14', 'rOther')[0], 'denied'], ['perf with NULL run', insP('u7', 'site1', '2026-08-14', null)[0], 'denied'], ['perf with nonexistent run', insP('u8', 'site1', '2026-08-14', 'nope')[0], 'denied'],
      ['UPDATE a search row', `UPDATE seo_search_daily SET clicks=99`, 'denied'], ['DELETE search daily (no WHERE)', `DELETE FROM seo_search_daily`, 'denied'], ['DELETE search performance (no WHERE)', `DELETE FROM seo_search_performance`, 'denied'],
      ['DELETE rows of run rA', `DELETE FROM seo_search_daily WHERE "syncRunId"='rA'`, 'denied'], ['TRUNCATE', `TRUNCATE seo_search_daily`, 'denied'],
      ['run update: bookkeeping of THE approved run', `UPDATE seo_gsc_sync_runs SET "rowsWritten"=1 WHERE id='rA'`, 'ok'],
      ['run update: other-range run rB', `UPDATE seo_gsc_sync_runs SET "rowsWritten"=1 WHERE id='rB'`, 'zero'], ['run update: other site\'s run', `UPDATE seo_gsc_sync_runs SET "rowsWritten"=1 WHERE id='rOther'`, 'zero'],
      ['run update: CANCELLED run', `UPDATE seo_gsc_sync_runs SET "rowsWritten"=1 WHERE id='rCancelled'`, 'zero'], ['run update: SCHEDULE-trigger run', `UPDATE seo_gsc_sync_runs SET "rowsWritten"=1 WHERE id='rCron'`, 'zero'],
      ['run update: cancel the approved run', `UPDATE seo_gsc_sync_runs SET status='CANCELLED' WHERE id='rA'`, 'denied'], ['run update: change range columns', `UPDATE seo_gsc_sync_runs SET "rangeStart"='2020-01-01' WHERE id='rA'`, 'denied'],
      ['run insert: second active approved run (unique index)', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('rNew','site1','SEARCH_ANALYTICS','MANUAL','RUNNING','2026-08-11','2026-11-08')`, 'denied'],
      ['run insert: other range', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('rNew','site1','SEARCH_ANALYTICS','MANUAL','RUNNING','2026-07-01','2026-11-08')`, 'denied'],
      ['run insert: SCHEDULE trigger', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('rNew','site1','SEARCH_ANALYTICS','SCHEDULE','RUNNING','2026-08-11','2026-11-08')`, 'denied'],
      ['run insert: status SUCCEEDED', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('rNew','site1','SEARCH_ANALYTICS','MANUAL','SUCCEEDED','2026-08-11','2026-11-08')`, 'denied'],
      ['run insert: other site', `INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ('rNew','other','SEARCH_ANALYTICS','MANUAL','RUNNING','2026-08-11','2026-11-08')`, 'denied'],
      ['select: search daily = ONLY the approved site (incl. legacy NULL and out-of-range rows, needed by the empty-table guard)', `SELECT count(*)::int n FROM seo_search_daily`, site1Daily],
      ['select: search performance = ONLY the approved site', `SELECT count(*)::int n FROM seo_search_performance`, site1Perf],
      ['select: other site\'s rows invisible', `SELECT count(*)::int n FROM seo_search_daily WHERE "siteId"='other'`, 0], ['select: other site\'s run invisible', `SELECT count(*)::int n FROM seo_gsc_sync_runs WHERE id='rOther'`, 0],
      ['select: approved site\'s runs visible (resume / status)', `SELECT count(*)::int n FROM seo_gsc_sync_runs WHERE "siteId"='site1'`, 5],
      ['authorisation table', `SELECT count(*)::int n FROM seo_import_rollback_authorisation`, 'denied'],
    ])
    await c.query('ROLLBACK')
  } finally { await c.query('ROLLBACK').catch(() => {}); c.release() }
  return v
}
/** Rollback-role violations on a seeded scratch DB (empty list = the role could only ever touch the one authorised run). */
async function rollbackScopeViolations(e) {
  const v = []; const ids = { daily: await cnt(e, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"='rA'`), perf: await cnt(e, `SELECT count(*)::int n FROM seo_search_performance WHERE "syncRunId"='rA'`) }
  const others = () => one(e.admin, `SELECT (SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_search_daily t WHERE "syncRunId" IS DISTINCT FROM 'rA') d,(SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_search_performance t WHERE "syncRunId" IS DISTINCT FROM 'rA') p,(SELECT md5(coalesce(string_agg(to_jsonb(t)::text,'|' ORDER BY id),'')) FROM seo_gsc_sync_runs t WHERE id<>'rA') r`)
  const beforeOthers = await others(); const tx = async (pre, probes, finish = 'ROLLBACK') => { const c = await e.adminPool.connect(); try { await c.query('BEGIN'); for (const x of pre) await c.query(x); await c.query('SET LOCAL ROLE seo_import_rollback'); const out = await runProbes(c, probes); await c.query(finish); return out } finally { await c.query('ROLLBACK').catch(() => {}); c.release() } }
  const AUDIT = (id) => `INSERT INTO seo_audit_log (id,"actorType",actor,action,"entityType","entityId") VALUES (gen_random_uuid()::text,'ADMIN','x','gsc.import.rolled_back','seo_gsc_sync_runs','${id}')`
  const NOAUTH = [['no authorisation: DELETE daily (no WHERE)', `DELETE FROM seo_search_daily`, 'zero'], ['no authorisation: DELETE performance (no WHERE)', `DELETE FROM seo_search_performance`, 'zero'],
    ['no authorisation: cancel every run', `UPDATE seo_gsc_sync_runs SET status='CANCELLED'`, 'zero'], ['no authorisation: sees no run', `SELECT count(*)::int n FROM seo_gsc_sync_runs`, 0], ['no authorisation: sees no search rows', `SELECT count(*)::int n FROM seo_search_daily`, 0],
    ['no authorisation: audit rolled_back for rA', AUDIT('rA'), 'denied'], ['self-authorise (INSERT)', `INSERT INTO seo_import_rollback_authorisation ("runId") VALUES ('rA')`, 'denied']]
  v.push(...await tx([], NOAUTH))
  // a STALE authorisation committed by an earlier transaction authorises nothing
  await e.admin.query(`INSERT INTO seo_import_rollback_authorisation ("runId") VALUES ('rB')`)
  v.push(...(await tx([], NOAUTH)).map((x) => 'stale committed authorisation (rB) still active: ' + x))
  v.push(...await tx([], [['stale authorisation row invisible', `SELECT count(*)::int n FROM seo_import_rollback_authorisation`, 0], ['stale authorisation: delete rB rows', `DELETE FROM seo_search_daily WHERE "syncRunId"='rB'`, 'zero'], ['stale authorisation: cancel rB', `UPDATE seo_gsc_sync_runs SET status='CANCELLED' WHERE id='rB'`, 'zero']]))
  // second, independent binding: a row whose xmin DOES equal this transaction's xid (inserted here) but whose authorisedAt is not this transaction's start time authorises nothing
  v.push(...await tx([`INSERT INTO seo_import_rollback_authorisation ("runId","authorisedAt") VALUES ('rB', now() - interval '1 day')`], [['timestamp binding: same-xid row with an old authorisedAt is invisible', `SELECT count(*)::int n FROM seo_import_rollback_authorisation`, 0], ['timestamp binding: delete rB rows', `DELETE FROM seo_search_daily WHERE "syncRunId"='rB'`, 'zero'], ['timestamp binding: cancel rB', `UPDATE seo_gsc_sync_runs SET status='CANCELLED' WHERE id='rB'`, 'zero']]))
  // authorise rA in THIS transaction (a stale rB row also exists): the role can reach ONLY rA
  const auth = [`INSERT INTO seo_import_rollback_authorisation ("runId") VALUES ('rA')`]
  v.push(...await tx(auth, [
    ['authorised: exactly one authorisation visible', `SELECT count(*)::int n FROM seo_import_rollback_authorisation`, 1], ['authorised: sees only rA daily rows', `SELECT count(*)::int n FROM seo_search_daily`, ids.daily], ['authorised: sees only rA performance rows', `SELECT count(*)::int n FROM seo_search_performance`, ids.perf],
    ['authorised: sees only rA run', `SELECT count(*)::int n FROM seo_gsc_sync_runs`, 1],
    ['DELETE daily with NO WHERE removes exactly rA rows (incl. its out-of-range row)', `DELETE FROM seo_search_daily`, ids.daily], ['DELETE performance with NO WHERE removes exactly rA rows', `DELETE FROM seo_search_performance`, ids.perf],
    ['DELETE of rB rows by explicit id', `DELETE FROM seo_search_daily WHERE "syncRunId"='rB'`, 'zero'], ['DELETE of other-site rows', `DELETE FROM seo_search_daily WHERE "siteId"='other'`, 'zero'], ['DELETE of legacy NULL rows', `DELETE FROM seo_search_daily WHERE "syncRunId" IS NULL`, 'zero'],
    ['cancel EVERY run (no WHERE) cancels exactly one (rA)', `UPDATE seo_gsc_sync_runs SET status='CANCELLED',"errorCode"='ROLLED_BACK',"finishedAt"=now()`, 1], ['cancel rB', `UPDATE seo_gsc_sync_runs SET status='CANCELLED' WHERE id='rB'`, 'zero'],
    ['cancel rOther', `UPDATE seo_gsc_sync_runs SET status='CANCELLED' WHERE id='rOther'`, 'zero'], ['cancel rCancelled/rFailed/rCron', `UPDATE seo_gsc_sync_runs SET status='CANCELLED' WHERE id IN ('rCancelled','rFailed','rCron')`, 'zero'],
    ['set rA to SUCCEEDED (resurrect)', `UPDATE seo_gsc_sync_runs SET status='SUCCEEDED' WHERE id='rA'`, 'denied'], ['change rA range / site', `UPDATE seo_gsc_sync_runs SET "siteId"='other' WHERE id='rA'`, 'denied'],
    ['audit rolled_back for rA', AUDIT('rA'), 'ok'], ['audit rolled_back for rB', AUDIT('rB'), 'denied'], ['audit rolled_back for rOther', AUDIT('rOther'), 'denied'],
    ['re-target: UPDATE authorisation', `UPDATE seo_import_rollback_authorisation SET "runId"='rB'`, 'denied'], ['add a second authorisation', `INSERT INTO seo_import_rollback_authorisation ("runId") VALUES ('rB')`, 'denied'], ['DELETE authorisation', `DELETE FROM seo_import_rollback_authorisation`, 'denied'],
    ['TRUNCATE search table', `TRUNCATE seo_search_daily`, 'denied'], ['DELETE runs', `DELETE FROM seo_gsc_sync_runs`, 'denied'], ['INSERT search row', insD('z1', 'site1', '2026-08-14', 'rA')[0], 'denied'], ['sees no oauth rows', `SELECT count(*)::int n FROM seo_oauth_connections`, 'denied'],
  ]))
  // the same actions COMMITTED: only rA changes; everything else byte-identical
  const c = await e.adminPool.connect()
  try { await c.query('BEGIN'); await c.query(auth[0]); await c.query('SET LOCAL ROLE seo_import_rollback'); await c.query(`DELETE FROM seo_search_daily`); await c.query(`DELETE FROM seo_search_performance`); await c.query(`UPDATE seo_gsc_sync_runs SET status='CANCELLED',"errorCode"='ROLLED_BACK',"finishedAt"=now()`); await c.query('RESET ROLE'); await c.query('COMMIT') } finally { await c.query('ROLLBACK').catch(() => {}); c.release() }
  const after = await others(); if (JSON.stringify(after) !== JSON.stringify(beforeOthers)) v.push('committed rollback changed rows outside rA')
  if ((await cnt(e, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"='rA'`)) + (await cnt(e, `SELECT count(*)::int n FROM seo_search_performance WHERE "syncRunId"='rA'`)) !== 0) v.push('committed rollback left rA rows')
  if ((await one(e.admin, `SELECT status FROM seo_gsc_sync_runs WHERE id='rA'`)).status !== 'CANCELLED') v.push('rA not cancelled')
  return v
}
await t('IMPORTER SCOPE (RLS): approved site, approved date range, approved RUNNING run of the same site; no update/delete; SELECT narrowed to the approved site (multi-run fixture incl. out-of-range rows)', async () => {
  const e = await fresh(); try { await seedScope(e); const before = await one(e.admin, `SELECT (SELECT count(*)::int FROM seo_search_daily) d,(SELECT count(*)::int FROM seo_search_performance) p,(SELECT count(*)::int FROM seo_gsc_sync_runs) r`)
    const v = await importerScopeViolations(e); assert.deepEqual(v, [])
    assert.deepEqual(await one(e.admin, `SELECT (SELECT count(*)::int FROM seo_search_daily) d,(SELECT count(*)::int FROM seo_search_performance) p,(SELECT count(*)::int FROM seo_gsc_sync_runs) r`), before) // probes left nothing behind
  } finally { await e.done() }
})
await t('IMPORTER: the one valid run insert works on an empty database; a second one is refused by the one-active-run index; after CANCEL a new run may start', async () => {
  const e = await fresh(); try {
    const ins = (id) => I.importTx(e.pool, (c) => c.query(`INSERT INTO seo_gsc_sync_runs (id,"siteId",kind,trigger,status,"rangeStart","rangeEnd") VALUES ($1,'site1','SEARCH_ANALYTICS','MANUAL','RUNNING','2026-08-11','2026-11-08')`, [id]))
    await ins('v1'); await assert.rejects(ins('v2'), (x) => x.code === '23505')
    await e.admin.query(`UPDATE seo_gsc_sync_runs SET status='CANCELLED' WHERE id='v1'`); await ins('v3')
    assert.equal(await cnt(e, `SELECT count(*)::int n FROM seo_gsc_sync_runs WHERE status='RUNNING'`), 1)
  } finally { await e.done() }
})
await t('ROLLBACK ROLE SCOPE (RLS): only the run authorised IN THIS TRANSACTION; stale/forged/retargeted authorisation, other runs, other site, legacy and out-of-range rows all untouched (multi-run fixture)', async () => {
  const e = await fresh(); try { await seedScope(e); const v = await rollbackScopeViolations(e); assert.deepEqual(v, []) } finally { await e.done() }
})
await t('T9 admin rollback with a script mutated to delete everything: PostgreSQL confines the role, only the authorised run is removed, all other rows (other runs, other site, legacy, out-of-range) byte-identical', async () => {
  const e = await fresh(); try {
    await seedScope(e); await e.admin.query(`UPDATE seo_gsc_sync_runs SET status='SUCCEEDED' WHERE id='rA'`)
    const RID = '5a5a5a5a-0000-4000-8000-00000000000a'; await e.admin.query(`UPDATE seo_gsc_sync_runs SET id=$1 WHERE id='rA'`, [RID]) // FK ON UPDATE CASCADE moves the rows with it
    const snap = () => one(e.admin, `SELECT (SELECT md5(string_agg(to_jsonb(t)::text,'|' ORDER BY id)) FROM seo_search_daily t WHERE "syncRunId" IS DISTINCT FROM $1) d,(SELECT md5(string_agg(to_jsonb(t)::text,'|' ORDER BY id)) FROM seo_search_performance t WHERE "syncRunId" IS DISTINCT FROM $1) p,(SELECT md5(string_agg(to_jsonb(t)::text,'|' ORDER BY id)) FROM seo_gsc_sync_runs t WHERE id<>$1) r`, [RID])
    const before = await snap(); const dailyRun = await cnt(e, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"=$1`, [RID])
    const bad = await adminRollback(e, RID, (x) => x.replace(/DELETE FROM seo_search_performance WHERE "syncRunId" = v_run/, 'DELETE FROM seo_search_performance WHERE true').replace(/DELETE FROM seo_search_daily       WHERE "syncRunId" = v_run/, 'DELETE FROM seo_search_daily WHERE true'))
    assert.equal(bad.ok, true, bad.error); assert.ok(bad.notices.some((m) => new RegExp(`${dailyRun} daily rows and 3 detail rows deleted`).test(m)), bad.notices.join('|'))
    assert.deepEqual(await snap(), before); assert.equal(await membersOf(e, 'seo_import_rollback'), 0)
    assert.equal(await cnt(e, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId" IS NULL`), 2) // legacy rows
    assert.equal(await cnt(e, `SELECT count(*)::int n FROM seo_search_daily WHERE "syncRunId"='rB'`), 2) // other run's out-of-range rows
  } finally { await e.done() }
})
await t('MUTATION CONTROLS: weakening any restriction makes the scope checks fail (the tests are not vacuous)', async () => {
  const mut = async (name, sqls, which, expectRx) => {
    const e = await fresh(); try { for (const x of sqls) await e.admin.query(x); await seedScope(e); const v = await (which === 'importer' ? importerScopeViolations(e) : rollbackScopeViolations(e)); assert.ok(v.length > 0 && v.some((x) => expectRx.test(x)), `${name}: checker did not detect (${JSON.stringify(v).slice(0, 300)})`) } finally { await e.done() }
  }
  const dp = (pol, tbl) => `DROP POLICY ${pol} ON ${tbl}`
  await mut('rollback delete = syncRunId IS NOT NULL (old policy)', ['seo_search_daily', 'seo_search_performance'].flatMap((tb) => [dp('seo_rollback_delete', tb), `CREATE POLICY seo_rollback_delete ON ${tb} FOR DELETE TO seo_import_rollback USING ("syncRunId" IS NOT NULL)`]), 'rollback', /DELETE daily with NO WHERE|DELETE of rB rows|committed rollback changed/)
  await mut('rollback run update = any SEARCH_ANALYTICS run (old policy)', [dp('seo_rollback_runs_update', 'seo_gsc_sync_runs'), dp('seo_rollback_runs_select', 'seo_gsc_sync_runs'), `CREATE POLICY seo_rollback_runs_select ON seo_gsc_sync_runs FOR SELECT TO seo_import_rollback USING (kind='SEARCH_ANALYTICS')`, `CREATE POLICY seo_rollback_runs_update ON seo_gsc_sync_runs FOR UPDATE TO seo_import_rollback USING (kind='SEARCH_ANALYTICS') WITH CHECK (kind='SEARCH_ANALYTICS' AND status='CANCELLED')`], 'rollback', /cancel EVERY run|cancel rB|cancel rOther|sees no run/)
  await mut('authorisation visible across transactions (no xmin binding)', [dp('seo_rollback_auth_select', 'seo_import_rollback_authorisation'), `CREATE POLICY seo_rollback_auth_select ON seo_import_rollback_authorisation FOR SELECT TO seo_import_rollback USING (true)`], 'rollback', /stale/)
  await mut('authorisation without the timestamp binding (xmin only)', [dp('seo_rollback_auth_select', 'seo_import_rollback_authorisation'), `CREATE POLICY seo_rollback_auth_select ON seo_import_rollback_authorisation FOR SELECT TO seo_import_rollback USING (xmin::text = (pg_current_xact_id()::xid)::text)`], 'rollback', /timestamp binding/)
  await mut('rollback role may INSERT authorisation', [`GRANT INSERT ON seo_import_rollback_authorisation TO seo_import_rollback`, `CREATE POLICY zz_ins ON seo_import_rollback_authorisation FOR INSERT TO seo_import_rollback WITH CHECK (true)`], 'rollback', /self-authorise|add a second authorisation/)
  const oldIns = (tb) => [dp('seo_importer_insert', tb), `CREATE POLICY seo_importer_insert ON ${tb} FOR INSERT TO seo_importer WITH CHECK ("syncRunId" IS NOT NULL AND "siteId" IN (SELECT id FROM seo_sites WHERE domain='tapisglobalinternational.com'))`]
  await mut('importer insert = old policy (no date / run checks)', ['seo_search_daily', 'seo_search_performance'].flatMap(oldIns), 'importer', /BEFORE range|AFTER range|attached to run rB|CANCELLED run|another site/)
  const noDate = (tb) => [dp('seo_importer_insert', tb), `CREATE POLICY seo_importer_insert ON ${tb} FOR INSERT TO seo_importer WITH CHECK ("siteId" IN (SELECT id FROM seo_sites WHERE domain='tapisglobalinternational.com') AND EXISTS (SELECT 1 FROM seo_gsc_sync_runs r WHERE r.id=${tb}."syncRunId" AND r."siteId"=${tb}."siteId" AND r.kind='SEARCH_ANALYTICS' AND r.trigger='MANUAL' AND r.status='RUNNING' AND r."rangeStart"=DATE '2026-08-11' AND r."rangeEnd"=DATE '2026-11-08'))`]
  await mut('importer insert without the date range check', ['seo_search_daily', 'seo_search_performance'].flatMap(noDate), 'importer', /BEFORE range|AFTER range|far outside/)
  const noRunState = (tb) => [dp('seo_importer_insert', tb), `CREATE POLICY seo_importer_insert ON ${tb} FOR INSERT TO seo_importer WITH CHECK ("date" BETWEEN DATE '2026-08-11' AND DATE '2026-11-08' AND "siteId" IN (SELECT id FROM seo_sites WHERE domain='tapisglobalinternational.com') AND "syncRunId" IS NOT NULL)`]
  await mut('importer insert without the run-association check', ['seo_search_daily', 'seo_search_performance'].flatMap(noRunState), 'importer', /attached to|nonexistent|another site/)
  await mut('importer SELECT = USING (true) (old policy)', ['seo_search_daily', 'seo_search_performance'].flatMap((tb) => [dp('seo_importer_select', tb), `CREATE POLICY seo_importer_select ON ${tb} FOR SELECT TO seo_importer USING (true)`]), 'importer', /ONLY the approved site|invisible/)
})
// ===================== DEDICATED LOGIN isolation (scratch) =====================
const adminPoolFor = (e, user) => new pg.Pool({ ...HOST, user, password: 'x', database: e.name, max: 2 })
await t('LOGIN guard: every transaction refuses any login other than the exact restricted login, and nothing is written', async () => {
  const e = await fresh(); try {
    for (const user of [BYPASS, ADMIN_LOGIN, aurl.username]) { // other login names: BYPASSRLS login, CREATEROLE admin, superuser
      const pool = adminPoolFor(e, user)
      try {
        await assert.rejects(P.start(pool), (x) => x.code === 'LOGIN_UNSAFE', user)
        await assert.rejects(I.importTx(pool, async () => 1, { readOnly: true }), (x) => x.code === 'LOGIN_UNSAFE', user)
      } finally { await pool.end() }
    }
    const n = await one(e.admin, `SELECT (SELECT count(*) FROM seo_gsc_sync_runs)::int runs,(SELECT count(*) FROM seo_audit_log)::int audit,(SELECT count(*) FROM seo_search_daily)::int d,(SELECT count(*) FROM seo_search_performance)::int p`)
    assert.deepEqual(n, { runs: 0, audit: 0, d: 0, p: 0 })
    assert.equal(await I.importTx(e.pool, async (c) => (await c.query('SELECT 1 AS x')).rows[0].x, { readOnly: true }), 1) // the real login passes
  } finally { await e.done() }
})
await t('LOGIN guard: each forbidden attribute or membership added to the exact login is refused (superuser, BYPASSRLS, CREATEROLE, CREATEDB, REPLICATION, rollback member incl. ADMIN-only, seo_worker, postgres, missing seo_importer); restored => accepted', async () => {
  const e = await fresh(); try {
    const muts = [
      ['SUPERUSER', 'ALTER ROLE seo_import_app SUPERUSER', 'ALTER ROLE seo_import_app NOSUPERUSER'], ['BYPASSRLS', 'ALTER ROLE seo_import_app BYPASSRLS', 'ALTER ROLE seo_import_app NOBYPASSRLS'],
      ['CREATEROLE', 'ALTER ROLE seo_import_app CREATEROLE', 'ALTER ROLE seo_import_app NOCREATEROLE'], ['CREATEDB', 'ALTER ROLE seo_import_app CREATEDB', 'ALTER ROLE seo_import_app NOCREATEDB'],
      ['REPLICATION', 'ALTER ROLE seo_import_app REPLICATION', 'ALTER ROLE seo_import_app NOREPLICATION'],
      ['member of rollback (SET)', 'GRANT seo_import_rollback TO seo_import_app WITH INHERIT FALSE, SET TRUE', 'REVOKE seo_import_rollback FROM seo_import_app'],
      ['member of rollback (ADMIN OPTION only)', 'GRANT seo_import_rollback TO seo_import_app WITH ADMIN TRUE, INHERIT FALSE, SET FALSE', 'REVOKE seo_import_rollback FROM seo_import_app'],
      ['member of seo_worker', 'GRANT seo_worker TO seo_import_app WITH INHERIT FALSE, SET TRUE', 'REVOKE seo_worker FROM seo_import_app'],
      ['member of postgres', 'GRANT postgres TO seo_import_app WITH INHERIT FALSE, SET TRUE', 'REVOKE postgres FROM seo_import_app'],
      ['not a member of seo_importer', `REVOKE seo_importer FROM seo_import_app GRANTED BY ${ADMIN_LOGIN}`, `GRANT seo_importer TO seo_import_app WITH INHERIT FALSE, SET TRUE GRANTED BY ${ADMIN_LOGIN}`], // the membership was granted by the administrator login
    ]
    const ping = () => I.importTx(e.pool, async (c) => (await c.query('SELECT 1 AS x')).rows[0].x, { readOnly: true })
    assert.equal(await ping(), 1)
    for (const [name, up, down] of muts) {
      await root.query(up)
      try { await assert.rejects(ping(), (x) => x.code === 'LOGIN_UNSAFE', name) } finally { await root.query(down) }
      assert.equal(await ping(), 1, 'restored: ' + name)
    }
    const m = await q(root, `SELECT r.rolname role_granted, m.set_option so, m.inherit_option io, m.admin_option ao FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.roleid JOIN pg_roles u ON u.oid=m.member WHERE u.rolname='seo_import_app'`)
    assert.deepEqual(m, [{ role_granted: 'seo_importer', so: true, io: false, ao: false }])
  } finally { await e.done() }
})
await t('LOGIN isolation: the dedicated login has no privileges of its own, cannot assume rollback/worker/postgres, cannot grant/alter roles, cannot run the administrator rollback SQL; SET LOCAL ROLE does not leak', async () => {
  const e = await fresh(); try {
    const { run } = await happy(e); const before = await one(e.admin, `SELECT (SELECT count(*) FROM seo_search_daily)::int d,(SELECT count(*) FROM seo_search_performance)::int p`)
    const c = await e.pool.connect(); try {
      assert.deepEqual((await c.query(`SELECT current_user::text cu, session_user::text su, r.rolsuper, r.rolbypassrls, r.rolcreaterole FROM pg_roles r WHERE r.rolname=session_user`)).rows[0], { cu: 'seo_import_app', su: 'seo_import_app', rolsuper: false, rolbypassrls: false, rolcreaterole: false })
      for (const sql of ['SELECT count(*) FROM seo_sites', 'SELECT count(*) FROM seo_search_daily', `INSERT INTO seo_audit_log (id,"actorType",actor,action,"entityType","entityId") VALUES ('z','ADMIN','x','gsc.import.started','x','x')`, 'DELETE FROM seo_search_performance', 'SELECT refresh FROM seo_oauth_connections']) { await c.query('BEGIN'); await assert.rejects(c.query(sql), (x) => x.code === '42501' || x.code === '42703', sql); await c.query('ROLLBACK') } // INHERIT FALSE: no direct access
      for (const sql of ['SET ROLE seo_import_rollback', 'SET ROLE seo_worker', 'SET ROLE postgres', 'SET SESSION AUTHORIZATION postgres', 'GRANT seo_import_rollback TO seo_import_app', 'GRANT seo_worker TO seo_import_app', `CREATE ROLE evil LOGIN`, 'ALTER ROLE seo_import_app BYPASSRLS', 'ALTER ROLE seo_import_app SUPERUSER', 'GRANT seo_importer TO seo_import_app WITH ADMIN TRUE', 'DROP POLICY seo_importer_site_read ON seo_sites', 'GRANT ALL ON seo_search_daily TO seo_import_app', 'ALTER TABLE seo_search_daily DISABLE ROW LEVEL SECURITY']) {
        await c.query('BEGIN'); await assert.rejects(c.query(sql), (x) => ['42501', '0LP01', '42P01'].includes(x.code) || /permission denied|must be owner|must have admin/i.test(x.message), sql); await c.query('ROLLBACK')
      }
      for (const sql of ['SET LOCAL ROLE seo_importer']) { await c.query('BEGIN'); await c.query(sql); for (const bad of ['SET LOCAL ROLE seo_import_rollback', 'SET LOCAL ROLE seo_worker', 'RESET SESSION AUTHORIZATION; SET LOCAL ROLE postgres']) await c.query('SAVEPOINT s').then(() => assert.rejects(c.query(bad), (x) => x.code === '42501' || x.code === '25P02' || /permission denied/i.test(x.message))).then(() => c.query('ROLLBACK TO s')); await c.query('ROLLBACK') }
    } finally { c.release() }
    // after a committed import step the session is back on the login (SET LOCAL did not leak into the pooled connection)
    const c2 = await e.pool.connect(); try { await I.importTx(e.pool, async (x) => (await x.query('SELECT 1')).rows[0]); assert.equal((await c2.query('SELECT current_user::text cu')).rows[0].cu, 'seo_import_app') } finally { c2.release() }
    // the login cannot run the administrator rollback procedure: its GRANT of the rollback role fails; nothing is deleted
    const ac = new pg.Client({ ...HOST, user: LOGIN, password: 'x', database: e.name }); await ac.connect()
    try { await assert.rejects(ac.query(ROLLBACK_SQL.replace('00000000-0000-0000-0000-000000000000', run.runId)), (x) => x.code === '42501' || /permission|admin option|must have/i.test(x.message)); await ac.query('ROLLBACK').catch(() => {}) } finally { await ac.end() }
    assert.deepEqual(await one(e.admin, `SELECT (SELECT count(*) FROM seo_search_daily)::int d,(SELECT count(*) FROM seo_search_performance)::int p`), before)
    assert.equal(await membersOf(e, 'seo_import_rollback'), 0)
    const mem = await q(e.admin, `SELECT r.rolname role_granted, m.set_option so, m.inherit_option io, m.admin_option ao FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.roleid JOIN pg_roles u ON u.oid=m.member WHERE u.rolname=$1`, [LOGIN])
    assert.deepEqual(mem, [{ role_granted: 'seo_importer', so: true, io: false, ao: false }])
  } finally { await e.done() }
})
await t('LOGIN creation/removal scripts (admin_create_import_login.sql / down_import_login.sql) run as a non-superuser administrator: guards, post-conditions, repeatable, leaves login exactly as designed', async () => {
  const CREATE = readFileSync(path.join(ROOT, 'db/seo/admin_create_import_login.sql'), 'utf8'), DOWN = readFileSync(path.join(ROOT, 'db/seo/down_import_login.sql'), 'utf8')
  assert.equal(LOGIN, 'seo_import_app')
  const run = async (sql) => { const c = new pg.Client({ ...HOST, user: ADMIN_LOGIN, password: 'x', database: 'postgres' }); await c.connect(); try { await c.query(sql); return { ok: true } } catch (x) { await c.query('ROLLBACK').catch(() => {}); return { ok: false, error: x.message } } finally { await c.end() } }
  const state = () => one(root, `SELECT (SELECT count(*) FROM pg_roles WHERE rolname='seo_import_app')::int exists,(SELECT count(*) FROM pg_auth_members m WHERE m.member='seo_import_app'::regrole)::int memberships`).catch(() => ({ exists: 0, memberships: 0 }))
  try {
    { const d = await run(DOWN); assert.ok(d.ok, d.error) } assert.equal((await state()).exists, 0)                         // removal works, leaves nothing
    assert.ok((await run(DOWN)).ok)                                                                   // and is repeatable
    const r1 = await run(CREATE); assert.ok(r1.ok, r1.error)
    const a = await one(root, `SELECT rolcanlogin, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolreplication, rolinherit, rolconnlimit, rolconfig FROM pg_roles WHERE rolname='seo_import_app'`)
    assert.deepEqual({ ...a, rolconfig: a.rolconfig.slice().sort() }, { rolcanlogin: true, rolsuper: false, rolbypassrls: false, rolcreaterole: false, rolcreatedb: false, rolreplication: false, rolinherit: false, rolconnlimit: 3, rolconfig: ['idle_in_transaction_session_timeout=30s', 'statement_timeout=25s'] })
    assert.deepEqual(await q(root, `SELECT r.rolname role_granted, m.set_option so, m.inherit_option io, m.admin_option ao FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.roleid WHERE m.member='seo_import_app'::regrole`), [{ role_granted: 'seo_importer', so: true, io: false, ao: false }])
    assert.equal((await one(root, `SELECT rolpassword IS NULL AS nopw FROM pg_authid WHERE rolname='seo_import_app'`)).nopw, true) // the script sets no password
    const r2 = await run(CREATE); assert.ok(!r2.ok && /already exists/.test(r2.error)); assert.deepEqual(await state(), { exists: 1, memberships: 1 })  // re-run aborts, nothing changes
    assert.ok(!(await run(CREATE.replace(/GRANT seo_importer TO seo_import_app[^;]*;/, 'GRANT seo_importer TO seo_import_app WITH INHERIT TRUE, SET TRUE;').replace('CREATE ROLE seo_import_app', 'DROP ROLE seo_import_app; CREATE ROLE seo_import_app'))).ok) // a mutated script (wrong membership) trips the post-condition and rolls back
    assert.equal((await state()).exists, 1)
  } finally {
    if (!(await state()).exists) assert.ok((await run(CREATE)).ok)
    await root.query(`ALTER ROLE seo_import_app CONNECTION LIMIT -1`) // scratch only: the concurrency tests open more than the live limit of 3 sessions
  }
})
for (const d of dbs) await root.query(`DROP DATABASE IF EXISTS ${d} WITH (FORCE)`).catch(() => {})
await root.end()
console.log(`\nSUMMARY: ${statics} static + ${results.filter((r) => r.ok).length} scratch-db passed, ${results.filter((r) => !r.ok).length} failed, invariant checks run: ${invariantChecks}`)
if (results.some((r) => !r.ok)) process.exit(1)
