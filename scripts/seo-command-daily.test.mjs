// Daily report, GA4, keyword intelligence, analyst, delivery, pipeline and scheduler tests.
// Scratch part env: SEO_SCRATCH_PG_URL=postgres://postgres@localhost:PORT/postgres (admin) and SEO_SCRATCH_TEMPLATE=<db with 0001-0004 applied>. Local scratch servers only; skipped when unset.
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { generateKeyPairSync, createVerify } from 'node:crypto'
import path from 'node:path'

const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true })
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8')
const ga = jiti('../lib/seo-command/ga4.ts'), kw = jiti('../lib/seo-command/keyword-intel.ts'), an = jiti('../lib/seo-command/analyst.ts'), dr = jiti('../lib/seo-command/daily-report.ts'), dv = jiti('../lib/seo-command/report-delivery.ts')
let pipeline; try { pipeline = jiti('../lib/seo-command/daily-pipeline.ts') } catch { pipeline = null }

let passed = 0, failed = 0
async function t(name, fn) { try { await fn(); passed++; console.log(`ok - ${name}`) } catch (e) { failed++; console.log(`FAIL - ${name}\n    ${String(e?.message ?? e).split('\n').slice(0, 6).join('\n    ')}`) } }

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } })
const SA = { client_email: 'seo-reader@example-project.iam.gserviceaccount.com', private_key: privateKey }
const GA_ENV = { GA4_PROPERTY_ID: '123456789', GA4_SERVICE_ACCOUNT_JSON: JSON.stringify(SA) }

// ============================ GA4 (pure) ============================
await t('GA4 config: missing, invalid property id, invalid key, raw JSON and base64 JSON are all handled; nothing is guessed', () => {
  assert.deepEqual(ga.readGa4Config({}), { ok: false, reason: 'NOT_CONFIGURED' })
  assert.equal(ga.readGa4Config({ GA4_PROPERTY_ID: 'G-ABC123' , GA4_SERVICE_ACCOUNT_JSON: '{}' }).reason, 'INVALID_PROPERTY_ID')
  assert.equal(ga.readGa4Config({ GA4_PROPERTY_ID: '123456789' }).reason, 'NOT_CONFIGURED')
  assert.equal(ga.readGa4Config({ GA4_PROPERTY_ID: '123456789', GA4_SERVICE_ACCOUNT_JSON: '{"client_email":"x"}' }).reason, 'INVALID_SERVICE_ACCOUNT')
  assert.equal(ga.readGa4Config({ GA4_PROPERTY_ID: '123456789', GA4_SERVICE_ACCOUNT_JSON: 'not json' }).reason, 'INVALID_SERVICE_ACCOUNT')
  assert.equal(ga.readGa4Config(GA_ENV).ok, true)
  assert.equal(ga.readGa4Config({ GA4_PROPERTY_ID: 'properties/123456789', GA4_SERVICE_ACCOUNT_JSON: Buffer.from(JSON.stringify(SA)).toString('base64') }).config.propertyId, '123456789')
})
await t('GA4 service-account JWT is RS256, has the read-only analytics scope and verifies with the public key', () => {
  const jwt = ga.signServiceAccountJwt({ clientEmail: SA.client_email, privateKey }, 1_700_000_000); const [h, b, s] = jwt.split('.')
  assert.equal(JSON.parse(Buffer.from(h, 'base64url')).alg, 'RS256'); const c = JSON.parse(Buffer.from(b, 'base64url'))
  assert.equal(c.scope, 'https://www.googleapis.com/auth/analytics.readonly'); assert.equal(c.aud, 'https://oauth2.googleapis.com/token'); assert.equal(c.exp - c.iat, 3300)
  assert.ok(createVerify('RSA-SHA256').update(`${h}.${b}`).verify(publicKey, Buffer.from(s, 'base64url')))
})
await t('GA4 request is organic-search only and read-only; parsing drops (and counts) malformed rows instead of coercing them', () => {
  const r = ga.buildOrganicReportRequest('2026-11-01', '2026-11-07'); assert.equal(r.dimensionFilter.filter.stringFilter.value, 'Organic Search'); assert.ok(!('method' in r))
  const p = ga.parseOrganicReport({ rowCount: 3, rows: [
    { dimensionValues: [{ value: '20261107' }, { value: '/rugs' }, { value: 'Organic Search' }, { value: 'India' }, { value: 'mobile' }], metricValues: [{ value: '10' }, { value: '7' }, { value: '2' }] },
    { dimensionValues: [{ value: 'bad' }, { value: '/x' }, { value: 'Organic Search' }, { value: 'India' }, { value: 'mobile' }], metricValues: [{ value: '1' }, { value: '1' }, { value: '0' }] },
    { dimensionValues: [{ value: '20261107' }, { value: '/y' }, { value: 'Organic Search' }, { value: 'India' }, { value: 'mobile' }], metricValues: [{ value: 'NaN' }, { value: '1' }, { value: '0' }] }] })
  assert.equal(p.rows.length, 1); assert.equal(p.dropped, 2); assert.equal(p.rows[0].date, '2026-11-07'); assert.equal(p.rows[0].rowKey, '2026-11-07|/rugs|Organic Search|India|mobile')
})

// ============================ keyword intelligence (pure) ============================
const W = { start: '2026-10-12', end: '2026-11-08', previousStart: '2026-09-14', previousEnd: '2026-10-11' }
await t('keyword intelligence: low-CTR, positions 4-20, declines, categories, countries and landing-page map follow the stated thresholds', () => {
  const k = kw.analyseKeywords({ window: W,
    current: [{ query: 'hand tufted carpet manufacturer', clicks: 1, impressions: 400, position: 5.2 }, { query: 'jute rugs wholesale', clicks: 30, impressions: 300, position: 3.1 }, { query: 'coir mats exporter', clicks: 2, impressions: 60, position: 14 }, { query: 'tiny', clicks: 0, impressions: 5, position: 6 }, { query: 'dhurrie supplier india', clicks: 5, impressions: 40, position: 25 }],
    previous: [{ query: 'wool carpet bulk', clicks: 9, impressions: 200 }, { query: 'jute rugs wholesale', clicks: 25, impressions: 280 }, { query: 'low volume', clicks: 0, impressions: 10 }],
    queryPages: [{ query: 'jute rugs wholesale', page: '/jute', clicks: 30, impressions: 300 }, { query: 'coir mats exporter', page: '/jute', clicks: 2, impressions: 60 }],
    countries: [{ country: 'usa', clicks: 1, impressions: 500, position: 9 }, { country: 'ind', clicks: 40, impressions: 600, position: 6 }] })
  assert.deepEqual(k.lowCtr.map((r) => r.query), ['hand tufted carpet manufacturer'])
  assert.deepEqual(k.striking.map((r) => r.query), ['hand tufted carpet manufacturer', 'coir mats exporter'])
  assert.deepEqual(k.declining.map((r) => r.query), ['wool carpet bulk']); assert.equal(k.declining[0].dropPct, 100)
  assert.ok(k.categories.find((c) => c.category === 'Jute rugs') && k.categories.find((c) => c.category === 'Hand-tufted carpets') && k.categories.find((c) => c.category === 'Dhurries'))
  assert.equal(k.countries.find((c) => c.country === 'usa').flag, 'LOW_CTR'); assert.equal(k.countries.find((c) => c.country === 'ind').flag, null)
  assert.deepEqual(k.pageMap[0].topQueries, ['jute rugs wholesale', 'coir mats exporter']); assert.match(k.anonymizedNote, /anonymized/)
  assert.ok(kw.isCommercial('carpet exporter price') && !kw.isCommercial('what is a dhurrie'))
})

// ============================ analyst (pure) ============================
const emptyData = () => ({ reportDate: '2026-11-11', generatedAt: '2026-11-11T02:30:00.000Z', timezone: 'Asia/Kolkata',
  gsc: { status: 'UNAVAILABLE', source: 's', period: null, asOf: null, note: 'none' }, ga4: { status: 'UNAVAILABLE', source: 's', period: null, asOf: null, note: 'GA4 is not connected' }, technical: { status: 'UNAVAILABLE', source: 's', period: null, asOf: null, note: 'no crawl' },
  sitemap: { status: 'UNAVAILABLE', source: 's', period: null, asOf: null }, keywords: { status: 'UNAVAILABLE', source: 's', period: null, asOf: null }, competitors: { status: 'UNAVAILABLE', source: 's', period: null, asOf: null },
  recommendations: { status: 'OK', source: 's', period: null, asOf: null, data: { proposed: 0, highImpact: 0, top: [] } }, system: { gsc: { state: 'DISCONNECTED' }, gscTokenExpiry: null, integrations: [], lastRuns: [], failedRecent: [], errors: [] } })
await t('analyst: with nothing connected it reports blockers (P1), makes no performance claims, and every finding has the required fields', () => {
  const f = an.buildFindings(emptyData()); assert.ok(f.length >= 3); assert.ok(f.every((x) => x.finding && x.evidence.length && x.businessImpact && x.priority && x.confidence && x.suggestedFix && typeof x.approvalRequired === 'boolean' && x.approvalNote))
  assert.equal(f[0].priority, 'P1'); assert.ok(!f.some((x) => /fell|rose/.test(x.finding)))
})
await t('analyst: a 70% click drop is reported with evidence, MEDIUM confidence and "things to check" (no asserted cause); a small prior baseline or <5 days of data is not', () => {
  const d = emptyData(); const tot = (c, days = 7) => ({ clicks: c, impressions: 700, ctrPct: 1, position: 6, days })
  d.gsc = { status: 'OK', source: 's', period: 'p', asOf: '2026-11-08', data: { latestDate: '2026-11-08', latestDay: tot(3, 1), previousDay: tot(3, 1), last7: tot(21), prev7: tot(70), byDay: [], topQueries: [], topPages: [], countries: [], devices: [], detailCoveragePct: null, missingDays: [] } }
  d.system.gsc = { state: 'CONNECTED' }
  const f = an.buildFindings(d).find((x) => x.id === 'gsc-clicks-drop'); assert.ok(f); assert.equal(f.confidence, 'MEDIUM'); assert.match(f.suggestedFix, /not established causes/); assert.equal(f.dataQuality, 'VERIFIED')
  d.gsc.data.prev7 = tot(10); assert.ok(!an.buildFindings(d).some((x) => x.id === 'gsc-clicks-drop'))
  d.gsc.data.prev7 = tot(70); d.gsc.data.last7 = tot(21, 3); assert.ok(!an.buildFindings(d).some((x) => x.id === 'gsc-clicks-drop')); assert.ok(an.buildFindings(d).some((x) => x.id === 'gsc-incomplete-week'))
})
await t('analyst: every finding that would change the live site requires approval; the analyst has no publish capability', () => {
  const src = read('lib/seo-command/analyst.ts'); assert.ok(!/fetch\(|from 'pg'|seoQuery|withSeoTx|writeFile|child_process|\bgit\b|deploy\(/i.test(src.replace(/\/\*[\s\S]*?\*\//g, '')))
  const d = emptyData(); d.keywords = { status: 'OK', source: 's', period: 'p', asOf: 'x', data: { lowCtr: [{ query: 'q', impressions: 100, clicks: 0, ctrPct: 0, position: 3, category: 'c' }], striking: [{ query: 'q2', impressions: 50, clicks: 1, position: 8, category: 'c' }], declining: [], categories: [], countries: [], pageMap: [], window: W, anonymizedNote: '' } }
  d.technical = { status: 'OK', source: 's', period: 'p', asOf: 'x', data: { run: { id: 'r', finishedAt: 'x', pagesFetched: 10, healthScore: 80, truncated: false }, open: { CRITICAL: 1, HIGH: 2 }, newHighSeverity: [], resolvedRecently: 0 } }
  const siteChanging = an.buildFindings(d).filter((x) => ['kw-low-ctr', 'kw-striking', 'tech-open-high'].includes(x.id)); assert.equal(siteChanging.length, 3); assert.ok(siteChanging.every((x) => x.approvalRequired))
})

// ============================ delivery (pure) ============================
await t('delivery: with no confirmed recipient or SMTP config NOTHING is sent and only variable NAMES are reported; the enquiry recipient is never used', async () => {
  let sent = 0; const send = async () => { sent++; return {} }
  const r = await dv.deliverReport({ title: 'T', summaryMd: '# x' }, { ENQUIRY_NOTIFY_EMAIL: 'owner@example.com', SMTP_HOST: 'h' }, send)
  assert.equal(r.status, 'NOT_CONFIGURED'); assert.equal(sent, 0); assert.ok(r.missing.includes('SEO_REPORT_RECIPIENT')); assert.ok(!JSON.stringify(r).includes('owner@example.com'))
  assert.equal(dv.deliveryConfig({ SEO_REPORT_RECIPIENT: 'not-an-email', SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p', SMTP_FROM: 'a@b.co' }).ok, false)
})
await t('delivery: SENT, retried once then FAILED with a safe code, and an already-SENT report is not re-sent; result never contains the recipient or password', async () => {
  const env = { SEO_REPORT_RECIPIENT: 'boss@example.com', SMTP_HOST: 'smtp.example.com', SMTP_USER: 'u', SMTP_PASS: 'secret-pass', SMTP_FROM: 'seo@example.com' }
  let calls = 0; const ok = await dv.deliverReport({ title: 'T', summaryMd: '# a\n- b <script>' }, env, async (cfg, m) => { calls++; assert.equal(m.to, 'boss@example.com'); assert.ok(!m.html.includes('<script>')); return { messageId: 'm1' } })
  assert.equal(ok.status, 'SENT'); assert.equal(calls, 1)
  let n = 0; const bad = await dv.deliverReport({ title: 'T', summaryMd: 'x' }, env, async () => { n++; const e = new Error('boom secret-pass boss@example.com'); e.code = 'ECONNECTION'; throw e })
  assert.equal(bad.status, 'FAILED'); assert.equal(bad.code, 'ECONNECTION'); assert.equal(n, 2); assert.ok(!JSON.stringify(bad).includes('secret-pass') && !JSON.stringify(bad).includes('boss@example.com'))
  assert.equal((await dv.deliverReport({ title: 'T', summaryMd: 'x', previousDeliveryStatus: 'SENT' }, env, async () => { throw new Error('must not send') })).status, 'SKIPPED_ALREADY_SENT')
})

// ============================ timezone and scheduler configuration ============================
await t('timezone: the report date is the Asia/Kolkata calendar date; 08:00 IST is 02:30 UTC and never shifts (no DST)', () => {
  assert.equal(dr.istDate(new Date('2026-11-10T18:29:59Z')), '2026-11-10'); assert.equal(dr.istDate(new Date('2026-11-10T18:30:00Z')), '2026-11-11')
  assert.equal(dr.istDate(new Date('2026-11-11T02:30:00Z')), '2026-11-11'); assert.equal(dr.istDate(new Date('2026-07-01T02:30:00Z')), '2026-07-01')
  const hhmm = (iso) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
  for (const day of ['2026-01-15', '2026-06-15', '2026-11-11', '2027-03-28']) assert.equal(hhmm(`${day}T02:30:00Z`), '08:00')
  assert.equal(dr.addDays('2026-11-11', -1), '2026-11-10'); assert.equal(dr.addDays('2026-03-01', -1), '2026-02-28')
})
await t('scheduler: the workflow runs at 02:30 UTC (= 08:00 IST), calls only the Preview base URL, refuses the production domain, uses secrets only through ${{ secrets.* }}, never echoes them, and prevents overlap', () => {
  const y = read('.github/workflows/seo-daily-report.yml')
  assert.match(y, /cron: '30 2 \* \* \*'/); assert.match(y, /workflow_dispatch/); assert.match(y, /concurrency:\s*\n\s*group: seo-daily-report\s*\n\s*cancel-in-progress: false/)
  assert.match(y, /secrets\.SEO_PREVIEW_BASE_URL/); assert.match(y, /secrets\.SEO_CRON_SECRET/); assert.match(y, /secrets\.VERCEL_AUTOMATION_BYPASS_SECRET/); assert.match(y, /Refusing to call the production domain/)
  assert.ok(!/set -x|echo "?\$\{?(CRON_SECRET|BYPASS)/.test(y)); assert.ok(!/vercel (deploy|--prod)|--prod|git push|merge/i.test(y.replace(/#.*$/gm, ''))); assert.match(y, /--retry 3/); assert.match(y, /if: failure\(\)/)
  assert.ok(!/ghp_|AKIA|-----BEGIN/.test(y))
})
await t('routes: the scheduled endpoint needs the bearer secret; the manual endpoint needs the SEO admin session and a same-origin POST; no route writes to the website', () => {
  const c = read('app/api/seo/cron/daily/route.ts'); assert.match(c, /bearerMatches\(req\.headers\.get\('authorization'\), process\.env\.CRON_SECRET\)/); assert.ok(c.indexOf('bearerMatches') < c.indexOf('runDailyPipeline'))
  const m = read('app/api/admin/seo/reports/daily/route.ts'); assert.match(m, /seoApi\(\{ mutating: true \}/); assert.match(m, /deliver: body\.deliver === true/)
  for (const f of ['lib/seo-command/daily-report.ts', 'lib/seo-command/daily-pipeline.ts', 'lib/seo-command/analyst.ts', 'lib/seo-command/keyword-intel.ts']) assert.ok(!/fetch\(|tapisglobalinternational\.com/.test(read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\/\*\*[\s\S]*?\*\//g, '')), f)
})

// ============================ scratch database ============================
const ADMIN = process.env.SEO_SCRATCH_PG_URL, TEMPLATE = process.env.SEO_SCRATCH_TEMPLATE
if (!ADMIN || !TEMPLATE) { console.log('SKIP - scratch-database tests (set SEO_SCRATCH_PG_URL and SEO_SCRATCH_TEMPLATE)'); console.log(`\n${passed} daily/GA4/keyword/analyst/delivery/scheduler tests passed${failed ? `, ${failed} FAILED` : ''}`); process.exit(failed ? 1 : 0) }
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(ADMIN) || /supabase|pooler|xxmrziaefhxmaewrvbqk|qgltrhszzqtgmaaglbfz/i.test(ADMIN)) throw new Error('SEO_SCRATCH_PG_URL must be a local scratch server')
const pg = require('pg'); const au = new URL(ADMIN)
const root = new pg.Client({ connectionString: ADMIN }); await root.connect(); let dbN = 0; const dbs = []
const NOW = new Date('2026-11-11T02:30:00Z') // 08:00 IST on 2026-11-11
async function fresh() {
  const name = `t_daily_${process.pid}_${++dbN}`; dbs.push(name); await root.query(`CREATE DATABASE ${name} TEMPLATE ${TEMPLATE}`)
  const pool = new pg.Pool({ host: au.hostname, port: Number(au.port), user: au.username, database: name, max: 6 }); pool.on('error', () => {})
  const q = (s, p) => pool.query(s, p).then((r) => r.rows)
  const withTx = async (fn) => { const c = await pool.connect(); try { await c.query('BEGIN'); const o = await fn((s, p) => c.query(s, p).then((r) => r.rows)); await c.query('COMMIT'); return o } catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e } finally { c.release() } }
  await q(`INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('site1','tapisglobalinternational.com','https://www.tapisglobalinternational.com',now()) ON CONFLICT (id) DO UPDATE SET domain=EXCLUDED.domain,"baseUrl"=EXCLUDED."baseUrl"`)
  return { name, pool, q, withTx, async done() { await pool.end().catch(() => {}); await root.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`) } }
}
const gen = (e, o = {}) => dr.generateDailyReport({ withTx: e.withTx, q: e.q, siteId: 'site1', trigger: 'MANUAL', triggeredBy: 'test', now: NOW, ...o })
async function seedGsc(e) {
  for (let i = 0; i < 14; i++) { const d = dr.addDays('2026-11-08', -i); const clicks = i < 7 ? 3 : 10; await e.q(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position) VALUES ($1,'site1',$2,$3,100,$4,6)`, [`d${i}`, d, clicks, clicks / 100]) }
  const perf = async (id, date, query, page, country, device, clicks, imps, pos) => e.q(`INSERT INTO seo_search_performance (id,"siteId",date,page,query,country,device,clicks,impressions,ctr,position,"rowKey") VALUES ($1,'site1',$2,$3,$4,$5,$6,$7,$8,$9,$10,$1)`, [id, date, page, query, country, device, clicks, imps, clicks / imps, pos])
  for (let i = 0; i < 7; i++) { const d = dr.addDays('2026-11-08', -i); await perf(`pa${i}`, d, 'hand tufted carpet manufacturer', '/hand-tufted', 'ind', 'MOBILE', 0, 60, 5); await perf(`pb${i}`, d, 'jute rugs wholesale', '/jute', 'usa', 'DESKTOP', 1, 20, 3) }
  for (let i = 0; i < 7; i++) await perf(`pc${i}`, dr.addDays('2026-10-11', -i), 'wool carpet bulk', '/wool', 'ind', 'MOBILE', 5, 40, 7)
}
async function seedTech(e, finished = '2026-11-10 20:00:00') {
  await e.q(`INSERT INTO seo_crawl_runs (id,"siteId","baseUrl",status,"pagesPlanned","pagesFetched","startedAt","finishedAt","healthScore") VALUES ('cr1','site1','https://www.tapisglobalinternational.com','SUCCEEDED',10,10,$1,$1,82)`, [finished])
  await e.q(`INSERT INTO seo_technical_issues (id,"siteId",fingerprint,code,severity,status,url,"firstSeenAt","lastSeenAt") VALUES ('i1','site1','f1','MISSING_TITLE','HIGH','OPEN','https://www.tapisglobalinternational.com/x','2026-11-10 20:00:00','2026-11-10 20:00:00'),('i2','site1','f2','NOINDEX_PAGE','CRITICAL','OPEN','https://www.tapisglobalinternational.com/y','2026-10-01 10:00:00','2026-11-10 20:00:00')`)
}

await t('empty database: every section is UNAVAILABLE (not zero), the report is PARTIAL, says so, invents nothing, and is stored once', async () => {
  const e = await fresh(); try {
    const r = await gen(e); assert.equal(r.outcome, 'CREATED'); assert.equal(r.status, 'PARTIAL')
    const row = (await e.q(`SELECT title,"summaryMd",data,"periodStart"::text d FROM seo_reports WHERE id=$1`, [r.reportId]))[0]; assert.equal(row.d, '2026-11-11'); assert.match(row.title, /2026-11-11 \(Asia\/Kolkata\)/)
    for (const k of ['gsc', 'ga4', 'technical', 'sitemap', 'keywords', 'competitors']) assert.equal(row.data[k].status, 'UNAVAILABLE', k)
    assert.match(row.summaryMd, /not fully available/); assert.match(row.summaryMd, /No Search Console rows are stored/); assert.ok(!/0 clicks/.test(row.summaryMd)); assert.ok(!/\bNaN\b|undefined/.test(row.summaryMd))
    assert.equal(row.data.delivery.status, 'NOT_ATTEMPTED'); assert.ok(row.data.findings.length >= 3 && row.data.findings.every((f) => f.approvalRequired !== undefined))
    const run = (await e.q(`SELECT agent::text,status::text,trigger::text FROM seo_agent_runs`))[0]; assert.deepEqual(run, { agent: 'REPORTING', status: 'PARTIAL', trigger: 'MANUAL' })
  } finally { await e.done() }
})
await t('real stored data: GSC totals, week-on-week change, missing days, keyword opportunities, technical issues and findings come from the stored rows', async () => {
  const e = await fresh(); try {
    await seedGsc(e); await seedTech(e); await e.q(`INSERT INTO seo_competitors (id,"siteId",domain,label) VALUES ('c1','site1','rival.example','Rival')`)
    await e.q(`INSERT INTO seo_competitor_snapshots (id,"competitorId","fetchedAt","httpStatus",title) VALUES ('s1','c1','2026-11-01 00:00:00',200,'Old title'),('s2','c1','2026-11-10 00:00:00',200,'New title')`)
    await e.q(`INSERT INTO seo_sitemap_status (id,"siteId",path,errors,warnings,"submittedUrls","fetchedAt") VALUES ('sm1','site1','https://www.tapisglobalinternational.com/sitemap.xml',2,1,50,'2026-11-10 12:00:00')`)
    const r = await gen(e); const d = (await e.q(`SELECT data, "summaryMd" FROM seo_reports WHERE id=$1`, [r.reportId]))[0]
    const g = d.data.gsc; assert.equal(g.status, 'OK'); assert.equal(g.data.latestDate, '2026-11-08'); assert.equal(g.data.last7.clicks, 21); assert.equal(g.data.prev7.clicks, 70); assert.equal(g.data.last7.days, 7); assert.equal(g.data.latestDay.clicks, 3)
    assert.equal(g.data.last7.ctrPct, 3); assert.equal(g.data.last7.position, 6); assert.equal(g.data.topQueries[0].query, 'jute rugs wholesale'); assert.equal(g.data.devices.length, 2)
    assert.equal(g.data.detailCoveragePct, 33.3); assert.match(d.summaryMd, /omits anonymized queries/); assert.match(d.summaryMd, /-70% vs the 7 days before/)
    assert.equal(d.data.technical.status, 'OK'); assert.equal(d.data.technical.data.open.CRITICAL, 1); assert.equal(d.data.technical.data.newHighSeverity.length, 1); assert.equal(d.data.technical.data.newHighSeverity[0].code, 'MISSING_TITLE')
    assert.equal(d.data.sitemap.data.sitemaps[0].errors, 2); assert.match(d.data.sitemap.data.urlInspection, /NOT reported as indexed/)
    assert.equal(d.data.keywords.data.lowCtr[0].query, 'hand tufted carpet manufacturer'); assert.ok(d.data.keywords.data.declining.some((x) => x.query === 'wool carpet bulk'))
    assert.equal(d.data.competitors.data.changes[0].changed[0], 'title'); assert.equal(d.data.ga4.status, 'UNAVAILABLE'); assert.match(d.data.ga4.note, /not connected/)
    const ids = d.data.findings.map((f) => f.id); for (const x of ['gsc-clicks-drop', 'tech-open-high', 'sitemap-errors', 'kw-low-ctr', 'kw-striking', 'sys-ga4']) assert.ok(ids.includes(x), x)
    assert.ok(d.data.findings.find((f) => f.id === 'gsc-clicks-drop').evidence.some((x) => x.includes('21') && true)); assert.match(d.summaryMd, /Approval required: YES/)
  } finally { await e.done() }
})
await t('stale data is labelled STALE (never presented as current): old Search Console dates and an old crawl', async () => {
  const e = await fresh(); try {
    for (let i = 0; i < 14; i++) await e.q(`INSERT INTO seo_search_daily (id,"siteId",date,clicks,impressions,ctr,position) VALUES ($1,'site1',$2,5,100,0.05,5)`, [`d${i}`, dr.addDays('2026-10-25', -i)])
    await seedTech(e, '2026-11-01 00:00:00'); const r = await gen(e); const d = (await e.q(`SELECT data,"summaryMd" FROM seo_reports WHERE id=$1`, [r.reportId]))[0]
    assert.equal(d.data.gsc.status, 'STALE'); assert.equal(d.data.technical.status, 'STALE'); assert.equal(r.status, 'PARTIAL'); assert.match(d.summaryMd, /\[STALE\]/); assert.ok(d.data.findings.some((f) => f.id === 'gsc-stale') && d.data.findings.some((f) => f.id === 'tech-stale'))
  } finally { await e.done() }
})
await t('duplicate prevention: the same IST day returns DUPLICATE and changes nothing; force regenerates the same row; a later IST day creates a new report', async () => {
  const e = await fresh(); try {
    const a = await gen(e), b = await gen(e); assert.equal(a.outcome, 'CREATED'); assert.equal(b.outcome, 'DUPLICATE'); assert.equal(b.reportId, a.reportId)
    assert.equal((await e.q(`SELECT count(*)::int n FROM seo_reports`))[0].n, 1); assert.equal((await e.q(`SELECT count(*)::int n FROM seo_agent_runs`))[0].n, 1)
    const c = await gen(e, { force: true }); assert.equal(c.outcome, 'REGENERATED'); assert.equal(c.reportId, a.reportId); assert.equal((await e.q(`SELECT count(*)::int n FROM seo_reports`))[0].n, 1)
    const d = await gen(e, { now: new Date('2026-11-12T02:30:00Z') }); assert.equal(d.outcome, 'CREATED'); assert.notEqual(d.reportId, a.reportId)
    const edge = await gen(e, { now: new Date('2026-11-11T18:29:00Z') }); assert.equal(edge.outcome, 'DUPLICATE') // still 2026-11-11 (IST) -> wait: 18:29Z is 23:59 IST on 11-11
  } finally { await e.done() }
})
await t('concurrency: simultaneous generation calls produce exactly one report; an overlapping run is refused as BUSY while the lock is held', async () => {
  const e = await fresh(); try {
    const rs = await Promise.all([gen(e), gen(e), gen(e), gen(e)]); const outcomes = rs.map((r) => r.outcome); assert.equal(outcomes.filter((o) => o === 'CREATED').length, 1, outcomes.join()); assert.ok(outcomes.every((o) => ['CREATED', 'DUPLICATE', 'BUSY'].includes(o)))
    assert.equal((await e.q(`SELECT count(*)::int n FROM seo_reports`))[0].n, 1)
    const holder = await e.pool.connect(); try { await holder.query('BEGIN'); await holder.query(`SELECT pg_advisory_xact_lock(hashtext('seo-daily-report:site1'))`); assert.equal((await gen(e, { now: new Date('2026-11-13T02:30:00Z') })).outcome, 'BUSY'); await holder.query('ROLLBACK') } finally { holder.release() }
    assert.equal((await gen(e, { now: new Date('2026-11-13T02:30:00Z') })).outcome, 'CREATED')
  } finally { await e.done() }
})
await t('failure injection: one unreadable section is reported as UNAVAILABLE with an error note while all other sections are kept; a total failure is logged as FAILED and stores no report', async () => {
  const e = await fresh(); try {
    await seedGsc(e); await e.q(`DROP TABLE seo_sitemap_status CASCADE`)
    const r = await gen(e); const d = (await e.q(`SELECT data,"summaryMd" FROM seo_reports WHERE id=$1`, [r.reportId]))[0]
    assert.equal(d.data.sitemap.status, 'UNAVAILABLE'); assert.match(d.data.sitemap.note, /could not be read/); assert.equal(d.data.gsc.status, 'OK'); assert.ok(d.data.system.errors.some((x) => x.startsWith('sitemap'))); assert.equal(r.status, 'PARTIAL'); assert.match(d.summaryMd, /could not be read/)
    const e2 = await fresh(); try { await e2.q(`DROP TABLE seo_reports CASCADE`); const f = await gen(e2); assert.equal(f.outcome, 'FAILED'); const run = (await e2.q(`SELECT status::text, error FROM seo_agent_runs`))[0]; assert.equal(run.status, 'FAILED'); assert.match(run.error, /generation failed/) } finally { await e2.done() }
  } finally { await e.done() }
})

// ---- GA4 sync against the scratch database with a fake Google API (the fake only stands in for the network; no figure reaches a report unless it was written by the sync)
const fakeGoogle = (script) => { const calls = { token: 0, report: 0, bodies: [] }; const f = async (url, init) => { if (String(url).includes('oauth2.googleapis.com')) { calls.token++; return script.token ? script.token(calls) : new Response(JSON.stringify({ access_token: 'tok' }), { status: 200 }) } calls.report++; calls.bodies.push(JSON.parse(init.body)); return script.report(calls) }; return { f, calls } }
const rowsResp = (rows) => new Response(JSON.stringify({ rowCount: rows.length, rows: rows.map((r) => ({ dimensionValues: [{ value: r[0] }, { value: r[1] }, { value: 'Organic Search' }, { value: r[2] }, { value: r[3] }], metricValues: [{ value: String(r[4]) }, { value: String(r[5]) }, { value: String(r[6]) }] })) }), { status: 200 })
const GA_ROWS = [['20261108', '/jute', 'India', 'mobile', 10, 7, 1], ['20261108', '/jute', 'United States', 'desktop', 4, 2, 0], ['20261107', '/coir', 'India', 'mobile', 6, 3, 0]]
await t('GA4 sync: not configured writes no rows and records NOT_CONFIGURED; configured sync is idempotent (same rows, no duplicates) and updates changed values', async () => {
  const e = await fresh(); try {
    const nc = await ga.syncGa4(e.q, { siteId: 'site1', startDate: '2026-11-04', endDate: '2026-11-08', env: {} }); assert.equal(nc.status, 'NOT_CONFIGURED'); assert.equal((await e.q(`SELECT count(*)::int n FROM seo_ga4_landing_daily`))[0].n, 0); assert.equal((await e.q(`SELECT status::text s FROM seo_integrations WHERE provider='GA4'`))[0].s, 'NOT_CONFIGURED')
    const g = fakeGoogle({ report: () => rowsResp(GA_ROWS) }); const a = await ga.syncGa4(e.q, { siteId: 'site1', startDate: '2026-11-04', endDate: '2026-11-08', env: GA_ENV, fetchImpl: g.f }); assert.equal(a.status, 'SUCCEEDED'); assert.equal(a.rowsWritten, 3)
    await ga.syncGa4(e.q, { siteId: 'site1', startDate: '2026-11-04', endDate: '2026-11-08', env: GA_ENV, fetchImpl: g.f }); assert.equal((await e.q(`SELECT count(*)::int n FROM seo_ga4_landing_daily`))[0].n, 3)
    const g2 = fakeGoogle({ report: () => rowsResp([['20261108', '/jute', 'India', 'mobile', 12, 8, 1]]) }); await ga.syncGa4(e.q, { siteId: 'site1', startDate: '2026-11-08', endDate: '2026-11-08', env: GA_ENV, fetchImpl: g2.f })
    assert.equal((await e.q(`SELECT sessions FROM seo_ga4_landing_daily WHERE "rowKey"='2026-11-08|/jute|Organic Search|India|mobile'`))[0].sessions, 12); assert.equal((await e.q(`SELECT status::text s,"lastSyncAt" t FROM seo_integrations WHERE provider='GA4'`))[0].s, 'CONFIGURED'); assert.equal((await e.q(`SELECT count(*)::int n FROM seo_integrations WHERE provider='GA4'`))[0].n, 1)
    assert.equal(g.calls.bodies[0].dimensionFilter.filter.stringFilter.value, 'Organic Search')
  } finally { await e.done() }
})
await t('GA4 sync: transient 500 is retried then succeeds; 403 permission error is NOT retried and records only a safe code; a token failure writes nothing; malformed rows give PARTIAL', async () => {
  const e = await fresh(); try {
    let n = 0; const g = fakeGoogle({ report: () => (++n < 3 ? new Response('{}', { status: 503 }) : rowsResp(GA_ROWS)) }); const ok = await ga.syncGa4(e.q, { siteId: 'site1', startDate: '2026-11-04', endDate: '2026-11-08', env: GA_ENV, fetchImpl: g.f, sleep: async () => {} }); assert.equal(ok.status, 'SUCCEEDED'); assert.equal(g.calls.report, 3)
    const e2 = await fresh(); try {
      const g2 = fakeGoogle({ report: () => new Response(JSON.stringify({ error: { status: 'PERMISSION_DENIED', message: 'secret details user@example.com' } }), { status: 403 }) }); const f = await ga.syncGa4(e2.q, { siteId: 'site1', startDate: '2026-11-04', endDate: '2026-11-08', env: GA_ENV, fetchImpl: g2.f, sleep: async () => {} })
      assert.equal(f.status, 'FAILED'); assert.equal(f.code, 'PERMISSION_DENIED'); assert.equal(g2.calls.report, 1); const i = (await e2.q(`SELECT status::text s,"lastError" l FROM seo_integrations WHERE provider='GA4'`))[0]; assert.deepEqual(i, { s: 'ERROR', l: 'PERMISSION_DENIED' })
      const g3 = fakeGoogle({ token: () => new Response(JSON.stringify({ error: 'invalid_grant' }), { status: 400 }), report: () => rowsResp(GA_ROWS) }); const t3 = await ga.syncGa4(e2.q, { siteId: 'site1', startDate: '2026-11-04', endDate: '2026-11-08', env: GA_ENV, fetchImpl: g3.f }); assert.equal(t3.status, 'FAILED'); assert.equal(t3.code, 'INVALID_GRANT'); assert.equal(g3.calls.report, 0); assert.equal((await e2.q(`SELECT count(*)::int n FROM seo_ga4_landing_daily`))[0].n, 0)
      const g4 = fakeGoogle({ report: () => rowsResp([...GA_ROWS, ['bad', '/z', 'India', 'mobile', 1, 1, 0]]) }); assert.equal((await ga.syncGa4(e2.q, { siteId: 'site1', startDate: '2026-11-04', endDate: '2026-11-08', env: GA_ENV, fetchImpl: g4.f })).status, 'PARTIAL')
    } finally { await e2.done() }
  } finally { await e.done() }
})
await t('GA4 in the report: sessions, engaged sessions, engagement rate and key events come only from synced rows, are labelled organic, never mixed with Search Console clicks, and "users" is marked unavailable', async () => {
  const e = await fresh(); try {
    await seedGsc(e); const g = fakeGoogle({ report: () => rowsResp(GA_ROWS) }); await ga.syncGa4(e.q, { siteId: 'site1', startDate: '2026-11-04', endDate: '2026-11-08', env: GA_ENV, fetchImpl: g.f })
    const r = await gen(e); const d = (await e.q(`SELECT data,"summaryMd" FROM seo_reports WHERE id=$1`, [r.reportId]))[0]; const a = d.data.ga4
    assert.equal(a.status, 'OK'); assert.equal(a.data.last7.sessions, 20); assert.equal(a.data.last7.engagedSessions, 12); assert.equal(a.data.last7.engagementRatePct, 60); assert.equal(a.data.last7.keyEvents, 1); assert.equal(a.data.topLandingPages[0].page, '/jute'); assert.match(a.source, /Organic Search/)
    assert.match(d.summaryMd, /different measure from Search Console clicks/); assert.match(d.summaryMd, /Organic users: not available/); assert.equal(d.data.gsc.data.last7.clicks, 21)
  } finally { await e.done() }
})

// ---- pipeline: ordering, delivery as a separate status, no duplicate email
await t('pipeline: scheduled run generates once, records delivery separately (NOT_CONFIGURED without a recipient), and a repeat the same day is a no-op; with a confirmed recipient the email is sent exactly once and a delivery failure leaves the report intact', async () => {
  if (!pipeline) throw new Error('daily-pipeline.ts failed to load')
  const e = await fresh(); try {
    const base = { trigger: 'SCHEDULE', triggeredBy: 'test', q: e.q, withTx: e.withTx, siteId: 'site1', now: NOW }
    const a = await pipeline.runDailyPipeline({ ...base, env: {} }); assert.equal(a.report.outcome, 'CREATED'); assert.equal(a.delivery.status, 'NOT_CONFIGURED'); assert.equal(a.ga4.status, 'SKIPPED')
    assert.equal((await e.q(`SELECT data->'delivery'->>'status' s FROM seo_reports`))[0].s, 'NOT_CONFIGURED')
    const env = { SEO_REPORT_RECIPIENT: 'boss@example.com', SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p', SMTP_FROM: 'a@b.co' }; let sends = 0
    const b = await pipeline.runDailyPipeline({ ...base, env, send: async () => { sends++; return { messageId: 'm' } } }); assert.equal(b.report.outcome, 'DUPLICATE'); assert.equal(b.delivery.status, 'SENT'); assert.equal(sends, 1)
    const c = await pipeline.runDailyPipeline({ ...base, env, send: async () => { sends++; return {} } }); assert.equal(c.delivery.status, 'SKIPPED_ALREADY_SENT'); assert.equal(sends, 1); assert.equal((await e.q(`SELECT count(*)::int n FROM seo_reports`))[0].n, 1)
    const e2 = await fresh(); try { const f = await pipeline.runDailyPipeline({ ...base, q: e2.q, withTx: e2.withTx, env, send: async () => { const x = new Error('down'); x.code = 'ETIMEDOUT'; throw x } }); assert.equal(f.report.outcome, 'CREATED'); assert.equal(f.delivery.status, 'FAILED'); assert.equal((await e2.q(`SELECT data->'delivery'->>'status' s, data->'delivery'->>'code' c FROM seo_reports`))[0].s, 'FAILED'); assert.equal((await e2.q(`SELECT status::text s FROM seo_agent_runs ORDER BY "createdAt" DESC LIMIT 1`))[0].s, 'PARTIAL') } finally { await e2.done() }
    const m = await pipeline.runDailyPipeline({ ...base, q: e.q, withTx: e.withTx, env, trigger: 'MANUAL', deliver: false, now: new Date('2026-11-14T02:30:00Z'), send: async () => { throw new Error('manual runs do not email unless asked') } }); assert.equal(m.delivery.status, 'NOT_ATTEMPTED')
  } finally { await e.done() }
})
await t('pipeline with GA4 configured: a GA4 sync failure is disclosed (status in the result and the report) and does not stop the report', async () => {
  const e = await fresh(); try {
    const g = fakeGoogle({ report: () => new Response(JSON.stringify({ error: { status: 'PERMISSION_DENIED' } }), { status: 403 }) })
    const r = await pipeline.runDailyPipeline({ trigger: 'SCHEDULE', triggeredBy: 'test', q: e.q, withTx: e.withTx, siteId: 'site1', now: NOW, env: GA_ENV, fetchImpl: g.f }); assert.equal(r.ga4.status, 'FAILED'); assert.equal(r.report.outcome, 'CREATED')
    const d = (await e.q(`SELECT data,"summaryMd" FROM seo_reports`))[0]; assert.ok(d.data.system.integrations.some((i) => i.provider === 'GA4' && i.status === 'ERROR' && i.lastError === 'PERMISSION_DENIED')); assert.match(d.summaryMd, /GA4: ERROR/)
  } finally { await e.done() }
})
await t('manual report preview: the stored markdown is complete (all nine sections) and contains no secrets, tokens or connection strings', async () => {
  const e = await fresh(); try {
    await seedGsc(e); await seedTech(e); const r = await gen(e); const md = (await e.q(`SELECT "summaryMd" FROM seo_reports WHERE id=$1`, [r.reportId]))[0].summaryMd
    for (const h of ['## 1. Executive summary', '## 2. Google Search Console', '## 3. Google Analytics 4', '## 4. Technical SEO', '## 5. Indexing and sitemap health', '## 6. Keyword performance', '## 7. Competitor intelligence', '## 8. AI findings', '## 9. System and integration health']) assert.ok(md.includes(h), h)
    assert.ok(!/postgres(ql)?:\/\/|Bearer |refresh_token|client_secret|PRIVATE KEY|password/i.test(md)); assert.match(md, /\/admin\/seo\/recommendations/)
  } finally { await e.done() }
})

await root.end().catch(() => {})
console.log(`\nSUMMARY: ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
