// Temporary read-only 90-day Search Console dry-run: windows, paging, truncation flags, privacy (no query text / URLs / tokens in
// results), approved calls only, and static guarantees that the route writes nothing. Fake Google, no network, no database.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const g = jiti('../lib/seo-command/gsc-oauth.ts')
const d = jiti('../lib/seo-command/gsc-dryrun.ts')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const cfg = { clientId: 'cid', clientSecret: 'CLIENT-SECRET-VALUE', property: d.DRYRUN_PROPERTY }
const RT = '1//0gREFRESH-TOKEN-PLAINTEXT-VALUE'
const AT = 'ya29.SECRET-ACCESS'
const SECRET_QUERY = 'secret customer query text'
const SECRET_PAGE = 'https://www.tapisglobalinternational.com/private-page'

/** Fake Google. `detail(body)` returns the rows for a detail request. */
function fake({ detail, daily, sitemaps, status } = {}) {
  const calls = []
  const f = async (url, init) => {
    const u = String(url)
    const body = typeof init.body === 'string' ? JSON.parse(init.body) : null
    calls.push({ url: u, method: init.method, auth: init.headers?.authorization, body })
    if (u === g.GSC_TOKEN_ENDPOINT) return { status: 200, json: async () => ({ access_token: AT, expires_in: 3600 }) }
    if (status) return { status, json: async () => ({ error: { status: 'PERMISSION_DENIED', message: 'nope' } }) }
    if (u.endsWith('/sitemaps')) return { status: 200, json: async () => ({ sitemap: sitemaps ?? [{ path: 'https://www.tapisglobalinternational.com/sitemap.xml', type: 'sitemap', errors: '0', warnings: '0', isPending: false, contents: [{ type: 'web', submitted: '280', indexed: '0' }] }] }) }
    if (u.endsWith('/searchAnalytics/query')) {
      if (body.dimensions.length === 1) return { status: 200, json: async () => ({ rows: daily ?? [{ keys: ['2026-11-08'], clicks: 3, impressions: 131, ctr: 0.0229, position: 20.9 }], responseAggregationType: 'byProperty' }) }
      return { status: 200, json: async () => ({ rows: (detail ?? (() => []))(body), responseAggregationType: 'byPage' }) }
    }
    return { status: 404, json: async () => ({}) }
  }
  return { f, calls }
}
const row = (i, date = '2026-08-11') => ({ keys: [date, SECRET_PAGE + '/' + (i % 7), SECRET_QUERY + ' ' + i, 'ind', 'MOBILE'], clicks: 1, impressions: 10, ctr: 0.1, position: 5 })
const run = (req, fk, extra = {}) => d.runDryRunStep({ refreshToken: RT, cfg, req, fetchImpl: fk.f, now: new Date('2026-11-10T17:00:00Z'), ...extra })
const detailCalls = (fk) => fk.calls.filter((c) => c.url.endsWith('/searchAnalytics/query') && c.body.dimensions.length === 5)

await t('range: 2026-08-11..2026-11-08 inclusive is exactly 90 days; 13 windows, contiguous, no gaps or overlap', () => {
  const w = d.buildWindows(), days = d.expectedDates()
  assert.equal(days.length, 90); assert.equal(days[0], '2026-08-11'); assert.equal(days[89], '2026-11-08')
  assert.equal(w.length, 13); assert.equal(w[0].startDate, '2026-08-11'); assert.equal(w[12].endDate, '2026-11-08')
  assert.deepEqual(w.map((x) => x.days), [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 6])
  assert.equal(w.reduce((s, x) => s + x.days, 0), 90)
  for (let i = 1; i < w.length; i++) assert.equal(Date.parse(w[i].startDate) - Date.parse(w[i - 1].endDate), 86_400_000)
})

await t('daily: one call, final data, date dimension, fixed range; reports missing days; hit-limit false', async () => {
  const fk = fake()
  const r = await run({ step: 'daily' }, fk)
  assert.equal(r.ok, true); assert.equal(r.apiRequests, 1)
  const q = fk.calls.filter((c) => c.url.endsWith('/searchAnalytics/query'))
  assert.equal(q.length, 1); assert.deepEqual(q[0].body, { startDate: '2026-08-11', endDate: '2026-11-08', dimensions: ['date'], type: 'web', dataState: 'final', rowLimit: 25000 })
  assert.equal(r.daysWithData, 1); assert.equal(r.expectedDays, 90); assert.equal(r.missingDates.length, 89); assert.equal(r.hitRowLimit, false)
  assert.equal(r.lastDate, '2026-11-08'); assert.equal(r.tokenRefreshes, 1)
})

await t('window: five-dimension request with the window dates; short page = complete, one request', async () => {
  const fk = fake({ detail: () => [row(1), row(2), row(3)] })
  const r = await run({ step: 'window', index: 2 }, fk)
  assert.equal(r.ok, true); assert.equal(r.complete, true); assert.equal(r.rowsReturned, 3); assert.equal(r.apiRequests, 1)
  const c = detailCalls(fk)
  assert.equal(c.length, 1)
  assert.deepEqual(c[0].body, { startDate: '2026-08-18', endDate: '2026-08-24', dimensions: ['date', 'page', 'query', 'country', 'device'], type: 'web', dataState: 'final', rowLimit: 25000, startRow: 0 })
  assert.equal(r.nextStartRow, null); assert.equal(r.hitRowLimitOnAnyPage, false); assert.equal(r.distinctQueries, 3)
})

await t('paging: full pages advance startRow by rows returned until a short page; counts add up; limit flagged', async () => {
  const pages = [25000, 25000, 4000]
  const fk = fake({ detail: (b) => Array.from({ length: pages[b.startRow / 25000] }, (_, i) => row(b.startRow + i)) })
  const r = await run({ step: 'window', index: 1 }, fk)
  assert.deepEqual(detailCalls(fk).map((c) => c.body.startRow), [0, 25000, 50000])
  assert.deepEqual(r.pages, [{ startRow: 0, rows: 25000 }, { startRow: 25000, rows: 25000 }, { startRow: 50000, rows: 4000 }])
  assert.equal(r.rowsReturned, 54000); assert.equal(r.complete, true); assert.equal(r.hitRowLimitOnAnyPage, true); assert.equal(r.duplicateKeys, 0); assert.equal(r.apiRequests, 3)
  assert.equal(r.detailTotals.clicks, 54000); assert.equal(r.detailTotals.impressions, 540000)
})

await t('paging: stops at the per-call page cap, says NOT complete and where to resume; resume starts at that row', async () => {
  const fk = fake({ detail: (b) => Array.from({ length: 25000 }, (_, i) => row(b.startRow + i)) })
  const r = await run({ step: 'window', index: 3 }, fk)
  assert.equal(r.complete, false); assert.equal(r.apiRequests, d.MAX_PAGES_PER_CALL); assert.equal(r.nextStartRow, d.MAX_PAGES_PER_CALL * 25000)
  const fk2 = fake({ detail: () => [row(1)] })
  await run({ step: 'window', index: 3, startRow: r.nextStartRow }, fk2)
  assert.equal(detailCalls(fk2)[0].body.startRow, r.nextStartRow)
})

await t('duplicate keys are counted, never silently merged', async () => {
  const fk = fake({ detail: () => [row(1), row(1), row(2)] })
  const r = await run({ step: 'window', index: 1 }, fk)
  assert.equal(r.duplicateKeys, 1); assert.equal(r.rowsReturned, 3)
})

await t('privacy: no query text, page URL, token, secret or refresh token in ANY result', async () => {
  const fk = fake({ detail: () => [row(1), row(2)] })
  for (const req of [{ step: 'daily' }, { step: 'window', index: 1 }, { step: 'sitemaps' }]) {
    const s = JSON.stringify(await run(req, fk))
    for (const bad of [SECRET_QUERY, '/private-page', AT, RT, 'CLIENT-SECRET-VALUE', 'Bearer']) assert.ok(!s.includes(bad), `${req.step} leaks ${bad}`)
  }
})

await t('sitemaps: one GET; numeric fields parsed; no other API touched', async () => {
  const fk = fake()
  const r = await run({ step: 'sitemaps' }, fk)
  assert.equal(r.ok, true); assert.equal(r.apiRequests, 1); assert.equal(r.sitemaps[0].contents[0].submitted, 280); assert.equal(r.sitemaps[0].errors, 0)
  const api = fk.calls.filter((c) => c.url !== g.GSC_TOKEN_ENDPOINT)
  assert.equal(api.length, 1); assert.equal(api[0].method, 'GET')
})

await t('only the approved calls ever happen: token refresh + Search Analytics POST + sitemaps GET, always with the bearer token', async () => {
  const fk = fake({ detail: () => [row(1)] })
  for (const req of [{ step: 'daily' }, { step: 'window', index: 13 }, { step: 'sitemaps' }]) await run(req, fk)
  for (const c of fk.calls.filter((x) => x.url !== g.GSC_TOKEN_ENDPOINT)) {
    assert.ok(/^https:\/\/www\.googleapis\.com\/webmasters\/v3\/sites\/sc-domain%3Atapisglobalinternational\.com\/(searchAnalytics\/query|sitemaps)$/.test(c.url), c.url)
    assert.equal(c.auth, 'Bearer ' + AT)
  }
})

await t('errors: Google failures are surfaced with status, partial counts kept, nothing hidden or retried', async () => {
  const fk = fake({ status: 403 })
  const r = await run({ step: 'window', index: 1 }, fk)
  assert.equal(r.ok, false); assert.equal(r.httpStatus, 403); assert.equal(r.googleStatus, 'PERMISSION_DENIED'); assert.equal(r.apiRequests, 1)
  assert.equal(detailCalls(fk).length, 1)
})

await t('guards: wrong property or unknown window is refused before any Search Console call; refresh failure stops early', async () => {
  const fk = fake()
  const a = await d.runDryRunStep({ refreshToken: RT, cfg: { ...cfg, property: 'sc-domain:other.com' }, req: { step: 'daily' }, fetchImpl: fk.f })
  assert.equal(a.ok, false); assert.equal(fk.calls.length, 0)
  const b = await run({ step: 'window', index: 99 }, fk)
  assert.equal(b.ok, false); assert.equal(fk.calls.filter((c) => c.url !== g.GSC_TOKEN_ENDPOINT).length, 0)
  const bad = { f: async () => ({ status: 400, json: async () => ({ error: 'invalid_grant' }) }) }
  const c = await run({ step: 'daily' }, bad)
  assert.equal(c.ok, false); assert.equal(c.apiRequests, 0)
})

await t('static: module has no write SQL, no URL Inspection / GA4 / PageSpeed, and reaches only the two approved endpoints', () => {
  const src = readFileSync(path.join(ROOT, 'lib/seo-command/gsc-dryrun.ts'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.ok(!/INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|query\(|pg'/i.test(src.replace(/ownership|updated/gi, '')), 'no SQL at all')
  assert.ok(!/urlInspection|inspection|analyticsdata|analyticsadmin|pagespeedonline|console\.(log|info|warn|error)/i.test(src))
  assert.deepEqual([...src.matchAll(/\$\{API\}(\/[^`'"]*)/g)].map((m) => m[1].replace(/\$\{site\}/, '{site}')).sort(), ['/sites/{site}/searchAnalytics/query', '/sites/{site}/sitemaps'])
})

await t('static: the route is admin-only, same-origin, READ ONLY, writes nothing, and exports only POST', () => {
  const r = readFileSync(path.join(ROOT, 'app/api/admin/seo/gsc/dry-run/route.ts'), 'utf8')
  const code = r.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^import .*$/gm, '')
  assert.match(code, /verifySeoSession\(/); assert.match(code, /originMatchesHost\(/); assert.match(code, /SET TRANSACTION READ ONLY/)
  assert.ok(code.indexOf('verifySeoSession(') < code.indexOf('withSeoTx('), 'session checked before any database access')
  assert.ok(!/audit\(|storeConnection|recordTokenError|recordRevoked|loadRefreshToken|touch|INSERT|UPDATE |DELETE |seoApi\(/i.test(code), 'writes nothing')
  assert.deepEqual([...code.matchAll(/export (?:const|async function) (GET|POST|PUT|PATCH|DELETE)\b/g)].map((m) => m[1]), ['POST'])
  assert.ok(/no-store/.test(code))
})

await t('static: independently removable: no other module imports the dry-run files', async () => {
  const { execSync } = await import('node:child_process')
  const hits = execSync(`grep -rlE "gsc-dryrun|gsc/dry-run" app lib components --include=*.ts --include=*.tsx || true`, { cwd: ROOT }).toString().trim().split('\n').filter((x) => x && x !== 'lib/seo-command/gsc-dryrun.ts').sort()
  assert.deepEqual(hits, ['app/api/admin/seo/gsc/dry-run/route.ts'])
})

console.log(`\n${n} tests passed`)
