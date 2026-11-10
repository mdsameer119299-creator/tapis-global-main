// Integration tests against a REAL PostgreSQL. Never run against a shared database:
// requires SEO_TEST_DATABASE_URL pointing at a throwaway DB with both db/seo migrations applied.
import assert from 'node:assert/strict'
import http from 'node:http'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const url = process.env.SEO_TEST_DATABASE_URL
if (!url) {
  console.log('SKIP seo-command-db tests: SEO_TEST_DATABASE_URL not set')
  process.exit(0)
}
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) throw new Error('refusing to run DB tests against a non-local database')

const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true })
process.env.SEO_DATABASE_URL = url
delete process.env.DATABASE_URL
const db = jiti('../lib/seo-command/db.ts')
const store = jiti('../lib/seo-command/store.ts')
const q = jiti('../lib/seo-command/queries.ts')
const { decideRecommendation, ApprovalError, isSeoOwner } = jiti('../lib/seo-command/approvals.ts')
const trk = jiti('../lib/seo-command/tracking.ts')
const { parsePsi, measurePageSpeed } = jiti('../lib/seo-command/psi.ts')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const admin = new pg.Client({ connectionString: url })
await admin.connect()
const sql = async (text, params) => (await admin.query(text, params)).rows
await admin.query('TRUNCATE seo_audit_log, seo_technical_issues, seo_crawl_pages, seo_crawl_runs, seo_recommendations, seo_approval_requests, seo_keywords, seo_competitors, seo_page_speed, seo_sites CASCADE')

// ---------------------------------------------------------------- DB URL guard
await t('assertSafeSeoDbUrl blocks unsafe targets without leaking the URL', () => {
  const a = db.assertSafeSeoDbUrl
  assert.throws(() => a(undefined), /not configured/)
  assert.throws(() => a('mysql://x'), /postgres/)
  assert.throws(() => a('postgres://u:SECRETPW@h.example:5432/postgres', 'postgres://u:SECRETPW@h.example:5432/postgres'), (e) => /same database/.test(e.message) && !/SECRETPW/.test(e.message))
  assert.throws(() => a('postgres://u:p@db.qgltrhszzqtgmaaglbfz.supabase.co:5432/postgres', 'postgres://x@other/db'), /not allowed/)
  assert.throws(() => a('postgres://u:p@db.sliftmuqfxzcafedlbat.supabase.co:5432/postgres', undefined), /not allowed/)
  assert.equal(a('postgres://u:p@seo.example:5432/postgres', 'postgres://x@main.example:5432/postgres'), 'postgres://u:p@seo.example:5432/postgres')
  process.env.SEO_DATABASE_EXPECTED_REF = 'abc'
  assert.throws(() => a('postgres://u:p@seo.example:5432/postgres', undefined), /EXPECTED_REF/)
  delete process.env.SEO_DATABASE_EXPECTED_REF
})

// ---------------------------------------------------------------- schema security
await t('every seo_* table has RLS enabled and no grants to PUBLIC/anon/authenticated', async () => {
  const tables = await sql(`SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relname LIKE 'seo\\_%'`)
  assert.ok(tables.length >= 20, 'expected 20 tables, got ' + tables.length)
  assert.deepEqual(tables.filter((r) => !r.relrowsecurity).map((r) => r.relname), [])
  const grants = await sql(`SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name LIKE 'seo\\_%' AND grantee IN ('PUBLIC','anon','authenticated')`)
  assert.deepEqual(grants, [])
  const colGrants = await sql(`SELECT table_name, grantee FROM information_schema.column_privileges WHERE table_schema='public' AND table_name LIKE 'seo\\_%' AND grantee IN ('PUBLIC','anon','authenticated')`)
  assert.deepEqual(colGrants, [])
})

await t('anon and authenticated roles cannot read or write any seo table', async () => {
  for (const role of ['anon', 'authenticated']) {
    for (const tbl of ['seo_sites', 'seo_recommendations', 'seo_audit_log', 'seo_keywords']) {
      await admin.query('BEGIN'); await admin.query(`SET LOCAL ROLE ${role}`)
      await assert.rejects(admin.query(`SELECT * FROM ${tbl}`), /permission denied/, `${role} read ${tbl}`)
      await admin.query('ROLLBACK')
    }
  }
})

await t('seo_worker is least-privilege: cannot approve, edit audit, or touch sites', async () => {
  const siteId = await store.getOrCreateSiteId('https://worker-test.example')
  await sql(`INSERT INTO seo_recommendations (id,"siteId",agent,"changeType","riskTier",title,rationale,evidence,"dedupeKey","updatedAt") VALUES ('r-w1',$1,'TECHNICAL','x','ROUTINE','t','r','{}','w1',now())`, [siteId])
  const as = async (fn) => { await admin.query('BEGIN'); await admin.query('SET LOCAL ROLE seo_worker'); try { await fn() } finally { await admin.query('ROLLBACK') } }
  await as(async () => assert.rejects(admin.query(`UPDATE seo_recommendations SET status='APPROVED' WHERE id='r-w1'`), /permission denied/))
  await as(async () => assert.rejects(admin.query(`UPDATE seo_recommendations SET "decidedBy"='me' WHERE id='r-w1'`), /permission denied/))
  await as(async () => assert.rejects(admin.query(`INSERT INTO seo_recommendations (id,"siteId",agent,"changeType","riskTier",title,rationale,evidence,"dedupeKey","updatedAt",status) VALUES ('r-w2',$1,'TECHNICAL','x','ROUTINE','t','r','{}','w2',now(),'APPROVED')`, [siteId]), /row-level security|permission denied/))
  await as(async () => { await admin.query(`INSERT INTO seo_recommendations (id,"siteId",agent,"changeType","riskTier",title,rationale,evidence,"dedupeKey","updatedAt") VALUES ('r-w3',$1,'TECHNICAL','x','ROUTINE','t','r','{}','w3',now())`, [siteId]) })
  await as(async () => assert.rejects(admin.query(`UPDATE seo_sites SET domain='evil'`), /permission denied/))
  await as(async () => assert.rejects(admin.query(`DELETE FROM seo_audit_log`), /permission denied/))
  await as(async () => assert.rejects(admin.query(`UPDATE seo_audit_log SET actor='x'`), /permission denied/))
  await as(async () => assert.rejects(admin.query(`INSERT INTO seo_keywords (id,"siteId",keyword,"updatedAt") VALUES ('k1',$1,'x',now())`, [siteId]), /permission denied/))
  await as(async () => { await admin.query(`INSERT INTO seo_keyword_ranks (id,"keywordId",date,position,source) SELECT 'rk',id,current_date,1,'GSC' FROM seo_keywords LIMIT 0`) })
  await sql(`DELETE FROM seo_recommendations WHERE id='r-w1'`)
})

await t('only one pending approval request per recommendation', async () => {
  const [{ id: siteId }] = await sql(`SELECT id FROM seo_sites LIMIT 1`)
  await sql(`INSERT INTO seo_recommendations (id,"siteId",agent,"changeType","riskTier",title,rationale,evidence,"dedupeKey","updatedAt") VALUES ('r-p',$1,'TECHNICAL','x','ROUTINE','t','r','{}','p',now())`, [siteId])
  await sql(`INSERT INTO seo_approval_requests (id,"recommendationId","requiredRole") VALUES ('a1','r-p','PUBLISHER')`)
  await assert.rejects(admin.query(`INSERT INTO seo_approval_requests (id,"recommendationId","requiredRole") VALUES ('a2','r-p','PUBLISHER')`), /seo_one_pending_approval|duplicate key/)
  await sql(`DELETE FROM seo_approval_requests`); await sql(`DELETE FROM seo_recommendations WHERE id='r-p'`)
})

// ---------------------------------------------------------------- crawl persistence against a mutable mock site
const home = (extra = '', title = 'Home page of the mock rug store') => `<html lang="en"><head><title>${title}</title><meta name="description" content="${'d'.repeat(90)}"><meta name="viewport" content="x"><link rel="canonical" href="ORIGIN/"><meta property="og:title" content="t"><meta property="og:image" content="i"></head><body><h1>Home</h1><a href="/about">about</a>${extra}<p>${'word '.repeat(200)}</p></body></html>`
const about = (title) => `<html lang="en"><head><title>${title}</title><meta name="description" content="${'a'.repeat(90)}"><meta name="viewport" content="x"><link rel="canonical" href="ORIGIN/about"><meta property="og:title" content="t"><meta property="og:image" content="i"></head><body><h1>About</h1><a href="/">home</a><p>${'other '.repeat(200)}</p></body></html>`
let pages = {}
const reset = () => {
  pages = {
    '/robots.txt': { t: 'text/plain', b: 'User-agent: *\nDisallow: /secret\nSitemap: ORIGIN/sitemap.xml' },
    '/sitemap.xml': { t: 'application/xml', b: '<urlset><url><loc>ORIGIN/</loc></url><url><loc>ORIGIN/about</loc></url><url><loc>ORIGIN/missing</loc></url></urlset>' },
    '/': { t: 'text/html', b: home('<a href="/missing">m</a><img src="a.jpg">') },
    '/about': { t: 'text/html', b: about('About') },
  }
}
reset()
let origin = ''
const server = http.createServer((req, res) => {
  const p = pages[req.url.split('?')[0]]
  if (!p) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<title>x</title>') }
  res.writeHead(200, { 'content-type': p.t }); res.end(p.b.replaceAll('ORIGIN', origin))
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
origin = `http://127.0.0.1:${server.address().port}`
const crawl = (o = {}) => store.runAndStoreCrawl({ baseUrl: origin, triggeredBy: 'test@tapis.test', crawlOverrides: { allowInsecureOrigin: true, timeoutMs: 3000 }, ...o })
let siteId

await t('first crawl persists run, pages, issues, recommendations, audit log', async () => {
  const r = await crawl()
  assert.equal(r.status, 'SUCCEEDED', r.error)
  siteId = r.siteId
  const run = (await sql(`SELECT * FROM seo_crawl_runs WHERE id=$1`, [r.runId]))[0]
  assert.equal(run.status, 'SUCCEEDED'); assert.ok(run.finishedAt); assert.ok(run.healthScore >= 0 && run.healthScore <= 100)
  assert.equal(run.triggeredBy, 'test@tapis.test')
  const pgs = await sql(`SELECT url,"statusCode",title FROM seo_crawl_pages WHERE "crawlRunId"=$1`, [r.runId])
  assert.equal(pgs.length, 3)
  const issues = await sql(`SELECT code,severity::text,status::text,url FROM seo_technical_issues WHERE "siteId"=$1`, [siteId])
  assert.ok(issues.find((i) => i.code === 'BROKEN_LINK' && i.url === `${origin}/missing` && i.severity === 'CRITICAL'))
  assert.ok(issues.find((i) => i.code === 'IMAGES_MISSING_ALT' && i.url === `${origin}/`))
  const recs = await sql(`SELECT "dedupeKey",status::text,"riskTier"::text FROM seo_recommendations WHERE "siteId"=$1`, [siteId])
  assert.ok(recs.find((x) => x.dedupeKey === 'issue:BROKEN_LINK' && x.status === 'PROPOSED' && x.riskTier === 'HIGH_IMPACT'))
  assert.ok(recs.find((x) => x.dedupeKey === 'issue:IMAGES_MISSING_ALT' && x.riskTier === 'ROUTINE'))
  assert.ok((await sql(`SELECT 1 FROM seo_audit_log WHERE action IN ('crawl.started','crawl.completed')`)).length >= 2)
})

await t('second identical crawl does not duplicate issues; first/last seen tracked', async () => {
  const before = (await sql(`SELECT count(*)::int n FROM seo_technical_issues WHERE "siteId"=$1`, [siteId]))[0].n
  const r = await crawl()
  assert.equal(r.status, 'SUCCEEDED', r.error)
  assert.equal(r.newIssues, 0)
  const after = (await sql(`SELECT count(*)::int n FROM seo_technical_issues WHERE "siteId"=$1`, [siteId]))[0].n
  assert.equal(after, before)
  assert.equal((await sql(`SELECT count(*)::int n FROM seo_crawl_runs WHERE "siteId"=$1`, [siteId]))[0].n, 2)
})

await t('fixing the site resolves issues and supersedes recommendations; history preserved', async () => {
  pages['/'].b = home('<a href="/about">again</a><img src="a.jpg" alt="a rug">')
  pages['/sitemap.xml'].b = '<urlset><url><loc>ORIGIN/</loc></url><url><loc>ORIGIN/about</loc></url></urlset>'
  const r = await crawl()
  assert.equal(r.status, 'SUCCEEDED', r.error)
  assert.ok(r.resolvedIssues >= 2, 'resolved ' + r.resolvedIssues)
  const broken = (await sql(`SELECT status::text,"resolvedAt","firstSeenAt" FROM seo_technical_issues WHERE code='BROKEN_LINK'`))
  assert.ok(broken.every((b) => b.status === 'RESOLVED' && b.resolvedAt))
  const rec = (await sql(`SELECT status::text FROM seo_recommendations WHERE "dedupeKey"='issue:BROKEN_LINK'`))[0]
  assert.equal(rec.status, 'SUPERSEDED')
  const ch = await q.getChanges(siteId)
  assert.ok(ch && ch.resolvedIssues.length >= 2)
  const trend = await q.getTrend(siteId)
  assert.equal(trend.length, 3)
  assert.ok(trend[2].healthScore >= trend[0].healthScore, 'score should not drop after fixes')
})

await t('regression re-opens a resolved issue instead of duplicating it', async () => {
  pages['/'].b = home('<a href="/missing">m</a><img src="a.jpg">')
  const r = await crawl()
  assert.equal(r.status, 'SUCCEEDED', r.error)
  const rows = await sql(`SELECT status::text FROM seo_technical_issues WHERE code='IMAGES_MISSING_ALT'`)
  assert.equal(rows.length, 1); assert.equal(rows[0].status, 'OPEN')
  assert.equal((await sql(`SELECT status::text FROM seo_recommendations WHERE "dedupeKey"='issue:IMAGES_MISSING_ALT'`))[0].status, 'PROPOSED')
})

await t('IGNORED/ACKNOWLEDGED statuses survive re-crawl', async () => {
  await sql(`UPDATE seo_technical_issues SET status='IGNORED' WHERE code='IMAGES_MISSING_ALT'`)
  await crawl()
  assert.equal((await sql(`SELECT status::text FROM seo_technical_issues WHERE code='IMAGES_MISSING_ALT'`))[0].status, 'IGNORED')
  await sql(`UPDATE seo_technical_issues SET status='OPEN' WHERE code='IMAGES_MISSING_ALT'`)
})

await t('a total outage FAILS the run and resolves nothing', async () => {
  const open = (await sql(`SELECT count(*)::int n FROM seo_technical_issues WHERE status='OPEN'`))[0].n
  const r = await store.runAndStoreCrawl({ baseUrl: 'http://127.0.0.1:1', triggeredBy: 'test@tapis.test', crawlOverrides: { allowInsecureOrigin: true, timeoutMs: 500 } })
  assert.equal(r.status, 'FAILED')
  const other = (await sql(`SELECT count(*)::int n FROM seo_technical_issues WHERE status='OPEN'`))[0].n
  assert.ok(other >= open, 'outage must not resolve existing issues')
  const failed = (await sql(`SELECT status::text, error FROM seo_crawl_runs WHERE id=$1`, [r.runId]))[0]
  assert.equal(failed.status, 'FAILED'); assert.ok(failed.error)
})

await t('concurrent crawl for the same site is refused; stale RUNNING rows are recovered', async () => {
  await sql(`INSERT INTO seo_crawl_runs (id,"siteId","baseUrl",status) VALUES ('busy',$1,$2,'RUNNING')`, [siteId, origin])
  await assert.rejects(crawl(), (e) => e.name === 'CrawlBusyError')
  const racing = await Promise.allSettled([crawl(), crawl()])
  assert.equal(racing.filter((x) => x.status === 'rejected').length, 2, 'both refused while a fresh RUNNING row exists')
  await sql(`UPDATE seo_crawl_runs SET "startedAt"=now()-interval '1 hour' WHERE id='busy'`)
  const ok = await crawl()
  assert.equal(ok.status, 'SUCCEEDED', ok.error)
  assert.equal((await sql(`SELECT status::text FROM seo_crawl_runs WHERE id='busy'`))[0].status, 'FAILED')
})

await t('read queries return coherent data', async () => {
  const ov = await q.getOverview(siteId)
  assert.ok(ov.latest && ov.latest.healthScore !== null)
  assert.equal(ov.connections.GSC, 'PENDING'); assert.equal(ov.connections.GA4, 'PENDING')
  assert.ok(ov.pages.total >= 3)
  assert.ok(ov.topCodes.length > 0)
  const list = await q.listIssues(siteId, { severity: 'CRITICAL' })
  assert.ok(list.every((i) => i.severity === 'CRITICAL'))
  const injected = await q.listIssues(siteId, { q: "'; DROP TABLE seo_sites;--" })
  assert.deepEqual(injected, [])
  assert.equal((await sql(`SELECT count(*)::int n FROM seo_sites`))[0].n >= 1, true)
  const pg1 = await q.listPages(siteId, { status: 'error' })
  assert.ok(pg1.pages.some((p) => p.statusCode === 404))
  const detail = await q.getPageDetail(siteId, `${origin}/missing`)
  assert.ok(detail.history.length >= 1)
  const rep = await q.buildReport(siteId, 30)
  assert.ok(rep.runs >= 3 && rep.issuesOpened > 0)
})

// ---------------------------------------------------------------- approvals
await t('approval workflow: roles, notes, conflicts, audit, no website mutation', async () => {
  const recs = await sql(`SELECT id,"riskTier"::text t,status::text s FROM seo_recommendations WHERE "siteId"=$1 AND status='PROPOSED'`, [siteId])
  const routine = recs.find((r) => r.t === 'ROUTINE'); const high = recs.find((r) => r.t === 'HIGH_IMPACT')
  assert.ok(routine && high, 'need one of each tier')
  delete process.env.SEO_OWNER_EMAILS
  assert.equal(isSeoOwner('boss@tapis.test'), false)
  await assert.rejects(decideRecommendation({ id: high.id, decision: 'APPROVE', actorEmail: 'boss@tapis.test' }), (e) => e instanceof ApprovalError && e.code === 'FORBIDDEN')
  await assert.rejects(decideRecommendation({ id: routine.id, decision: 'REJECT', actorEmail: 'a@t.test' }), (e) => e.code === 'INVALID')
  await assert.rejects(decideRecommendation({ id: 'nope', decision: 'APPROVE', actorEmail: 'a@t.test' }), (e) => e.code === 'NOT_FOUND')
  assert.equal((await decideRecommendation({ id: routine.id, decision: 'APPROVE', note: 'ok', actorEmail: 'a@t.test' })).status, 'APPROVED')
  await assert.rejects(decideRecommendation({ id: routine.id, decision: 'REJECT', note: 'x', actorEmail: 'a@t.test' }), (e) => e.code === 'CONFLICT')
  process.env.SEO_OWNER_EMAILS = ' Boss@Tapis.test , other@x.test '
  assert.equal(isSeoOwner('boss@tapis.test'), true)
  assert.equal((await decideRecommendation({ id: high.id, decision: 'DEFER', actorEmail: 'a@t.test' })).status, 'DEFERRED')
  assert.equal((await decideRecommendation({ id: high.id, decision: 'APPROVE', actorEmail: 'boss@tapis.test' })).status, 'APPROVED')
  const row = (await sql(`SELECT status::text,"decidedBy","decidedAt" FROM seo_recommendations WHERE id=$1`, [high.id]))[0]
  assert.equal(row.status, 'APPROVED'); assert.equal(row.decidedBy, 'boss@tapis.test'); assert.ok(row.decidedAt)
  assert.equal((await sql(`SELECT count(*)::int n FROM seo_approval_requests WHERE "recommendationId"=ANY($1)`, [[routine.id, high.id]]))[0].n, 2)
  assert.ok((await sql(`SELECT 1 FROM seo_audit_log WHERE action='recommendation.approved' AND "entityId"=$1`, [high.id])).length === 1)
  // a later crawl must not reopen or touch decided items
  await crawl()
  assert.equal((await sql(`SELECT status::text FROM seo_recommendations WHERE id=$1`, [high.id]))[0].status, 'APPROVED')
  delete process.env.SEO_OWNER_EMAILS
})

await t('concurrent decisions on one recommendation: exactly one wins', async () => {
  await sql(`INSERT INTO seo_recommendations (id,"siteId",agent,"changeType","riskTier",title,rationale,evidence,"dedupeKey","updatedAt") VALUES ('race',$1,'TECHNICAL','x','ROUTINE','t','r','{}','race',now())`, [siteId])
  const res = await Promise.allSettled([1, 2, 3, 4].map((i) => decideRecommendation({ id: 'race', decision: i % 2 ? 'APPROVE' : 'REJECT', note: 'n', actorEmail: `u${i}@t.test` })))
  assert.equal(res.filter((r) => r.status === 'fulfilled').length, 1)
  assert.equal((await sql(`SELECT count(*)::int n FROM seo_approval_requests WHERE "recommendationId"='race'`))[0].n, 1)
})

// ---------------------------------------------------------------- keywords / competitors / psi
await t('keywords: dedupe, cleaning, on-page coverage; no fabricated rankings', async () => {
  const r = await trk.addKeywords(siteId, 'a@t.test', ['  Home Page  ', 'home page', 'Mock RUG store', 'x'])
  assert.equal(r.added, 2)
  const ks = await q.listKeywords(siteId)
  const kw = ks.find((k) => k.keyword === 'home page')
  assert.ok(kw.inTitle >= 1)
  assert.equal(kw.latestPosition, null, 'rank must stay null without Search Console data')
  assert.equal((await trk.removeKeyword(siteId, kw.id, 'a@t.test')).removed, 1)
})

await t('competitors: SSRF guard blocks private/internal targets', async () => {
  const pub = async () => ['93.184.216.34']
  const priv = async () => ['10.0.0.5']
  const loop = async () => ['127.0.0.1']
  const v6 = async () => ['::1']
  await assert.rejects(trk.addCompetitor(siteId, 'a', 'http://127.0.0.1/', null, pub), /valid public domain/)
  await assert.rejects(trk.addCompetitor(siteId, 'a', 'localhost', null, pub), /valid public domain/)
  await assert.rejects(trk.addCompetitor(siteId, 'a', 'foo.internal', null, pub), /Internal/)
  await assert.rejects(trk.addCompetitor(siteId, 'a', 'evil.example.com', null, priv), /non-public/)
  await assert.rejects(trk.addCompetitor(siteId, 'a', 'evil.example.com', null, loop), /non-public/)
  await assert.rejects(trk.addCompetitor(siteId, 'a', 'evil.example.com', null, v6), /non-public/)
  await assert.rejects(trk.addCompetitor(siteId, 'a', 'nx.example.com', null, async () => { throw new Error('ENOTFOUND') }), /resolve/)
  const ok = await trk.addCompetitor(siteId, 'a', 'https://WWW.Rival-Rugs.com/path?x=1', ' Rival ', pub)
  assert.equal(ok.domain, 'rival-rugs.com'); assert.equal(ok.created, true)
  assert.equal((await trk.addCompetitor(siteId, 'a', 'rival-rugs.com', null, pub)).created, false)
})

await t('competitor snapshot stores public facts, re-validates redirect hops, never hits private hosts', async () => {
  const [{ id }] = await sql(`SELECT id FROM seo_competitors LIMIT 1`)
  const calls = []
  const fakeFetch = async (u) => {
    calls.push(u)
    const h = (b, s = 200, hd = {}) => new Response(b, { status: s, headers: hd })
    if (u.endsWith('/robots.txt')) return h('User-agent: *\nSitemap: https://rival-rugs.com/sm.xml')
    if (u.endsWith('/sm.xml')) return h('<urlset><url><loc>https://rival-rugs.com/a</loc></url><url><loc>https://rival-rugs.com/b</loc></url></urlset>')
    return h('<html lang="en"><head><title>Rival Rugs | Handmade</title><meta name="description" content="Rival desc"><script type="application/ld+json">{"@type":"Organization"}</script></head><body><h1>Rival</h1><p>one two three</p></body></html>', 200, { 'content-type': 'text/html' })
  }
  const s = await trk.snapshotCompetitor(siteId, id, 'a', fakeFetch, async () => ['93.184.216.34'])
  assert.equal(s.httpStatus, 200); assert.equal(s.title, 'Rival Rugs | Handmade'); assert.equal(s.sitemapUrlCount, 2); assert.equal(s.robotsFound, true)
  assert.deepEqual(s.jsonLdTypes, ['Organization'])
  const stored = await q.listCompetitors(siteId)
  assert.equal(stored[0].latest.title, 'Rival Rugs | Handmade')
  // redirect into a private host must be refused
  const resolveByHost = async (h) => (h === 'rival-rugs.com' ? ['93.184.216.34'] : ['10.1.2.3'])
  const redirecting = async (u) => new Response('', { status: 302, headers: { location: 'http://internal.corp.example/admin' } })
  const bad = await trk.fetchCompetitorSnapshot('rival-rugs.com', redirecting, resolveByHost)
  assert.match(bad.error ?? '', /non-public/); assert.equal(bad.title, null)
})

await t('PageSpeed: parses lab data, stores errors honestly as UNAVAILABLE', async () => {
  const sample = { lighthouseResult: { categories: { performance: { score: 0.87 } }, audits: { 'largest-contentful-paint': { numericValue: 2310.4 }, 'cumulative-layout-shift': { numericValue: 0.04 }, 'total-blocking-time': { numericValue: 120 }, 'first-contentful-paint': { numericValue: 1200 } } } }
  const m = parsePsi(sample)
  assert.deepEqual(m, { perfScore: 87, lcpMs: 2310, cls: 0.04, inpMs: null, tbtMs: 120, fcpMs: 1200, fieldDataAvailable: false })
  assert.equal(parsePsi({}).perfScore, null)
  const okRes = await measurePageSpeed({ siteId, url: `${origin}/`, strategy: 'mobile', actor: 'a', fetchImpl: async () => new Response(JSON.stringify(sample)) })
  assert.equal(okRes.metrics.perfScore, 87)
  const bad = await measurePageSpeed({ siteId, url: `${origin}/about`, strategy: 'mobile', actor: 'a', fetchImpl: async () => new Response(JSON.stringify({ error: { message: 'Quota exceeded' } }), { status: 429 }) })
  assert.equal(bad.metrics, null); assert.match(bad.error, /429/)
  const rows = await q.latestPageSpeed(siteId)
  assert.equal(rows.find((r) => r.url.endsWith('/about')).dataQuality, 'UNAVAILABLE')
  assert.equal(rows.find((r) => r.url.endsWith('/')).dataQuality, 'VERIFIED')
})

await t('no secrets are written to the audit log or errors', async () => {
  const dump = JSON.stringify(await sql(`SELECT * FROM seo_audit_log`)) + JSON.stringify(await sql(`SELECT error FROM seo_crawl_runs`))
  assert.ok(!dump.includes('postgres://'))
})

server.close(); await admin.end(); await db.getSeoPool().end().catch(() => undefined)
console.log(`\n${n} DB tests passed`)
