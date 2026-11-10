// Token exchange / refresh / revoke (fake Google, no network), connection lifecycle, Testing-mode expiry, and static
// guarantees. DB parts need SEO_TEST_DATABASE_URL (throwaway local Postgres with db/seo 0001-0003 applied).
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import pg from 'pg'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const g = jiti('../lib/seo-command/gsc-oauth.ts')
const s = jiti('../lib/seo-command/gsc-state.ts')
const goog = jiti('../lib/seo-command/gsc-google.ts')
const conn = jiti('../lib/seo-command/gsc-connection.ts')
const ct = jiti('../lib/seo-command/gsc-connectivity.ts')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const k = () => randomBytes(32).toString('base64')
const env = { SEO_SESSION_SECRET: 'seo-secret-seo-secret-seo-secret-0123456789', NODE_ENV: 'production', GSC_TOKEN_ENCRYPTION_KEY: k(), GSC_TOKEN_KEY_VERSION: '1' }
const cfg = { clientId: 'cid.apps.googleusercontent.com', clientSecret: 'CLIENT-SECRET-VALUE', redirectUri: 'https://x.vercel.app/api/admin/seo/gsc/callback', property: 'sc-domain:example.com' }
const RT = '1//0gREFRESH-TOKEN-PLAINTEXT-VALUE'

/** Fake Google: records every request, replies from a queue. */
function fakeGoogle(...replies) {
  const calls = []
  const f = async (url, init) => {
    calls.push({ url: String(url), body: Object.fromEntries(new URLSearchParams(init.body)) })
    const r = replies.shift() ?? { status: 500, json: {} }
    if (r === 'throw') throw new Error('ECONNRESET')
    return { status: r.status, json: async () => r.json }
  }
  return { f, calls }
}

// ── token exchange ──────────────────────────────────────────────────────────
await t('exchange: sends code + PKCE verifier + exact redirect URI; returns only the refresh token', async () => {
  const gg = fakeGoogle({ status: 200, json: { refresh_token: RT, access_token: 'ya29.ACCESS', scope: g.GSC_SCOPE, expires_in: 3599 } })
  const r = await goog.exchangeCode(cfg, 'auth-code', 'verifier-123', gg.f)
  assert.deepEqual(r, { ok: true, refreshToken: RT, scope: g.GSC_SCOPE })
  assert.equal(gg.calls[0].url, g.GSC_TOKEN_ENDPOINT)
  assert.equal(gg.calls[0].body.code_verifier, 'verifier-123')
  assert.equal(gg.calls[0].body.redirect_uri, cfg.redirectUri)
  assert.equal(gg.calls[0].body.grant_type, 'authorization_code')
  assert.ok(!JSON.stringify(r).includes('ya29'), 'access token is discarded')
})

await t('exchange: extra or different scope is refused and the grant is revoked', async () => {
  const gg = fakeGoogle({ status: 200, json: { refresh_token: RT, scope: g.GSC_SCOPE + ' https://www.googleapis.com/auth/analytics.readonly' } }, { status: 200, json: {} })
  assert.deepEqual(await goog.exchangeCode(cfg, 'c', 'v', gg.f), { ok: false, error: 'scope_mismatch' })
  assert.equal(gg.calls[1].url, g.GSC_REVOKE_ENDPOINT)
  assert.equal(gg.calls[1].body.token, RT)
})

await t('exchange: missing refresh token, Google errors and network failure give fixed codes (no free text)', async () => {
  assert.deepEqual(await goog.exchangeCode(cfg, 'c', 'v', fakeGoogle({ status: 200, json: { scope: g.GSC_SCOPE } }).f), { ok: false, error: 'no_refresh_token' })
  assert.deepEqual(await goog.exchangeCode(cfg, 'c', 'v', fakeGoogle({ status: 400, json: { error: 'invalid_grant', error_description: 'Bad Request <script>' } }).f), { ok: false, error: 'invalid_grant' })
  assert.deepEqual(await goog.exchangeCode(cfg, 'c', 'v', fakeGoogle({ status: 400, json: { error: 'Some free text <b>' } }).f), { ok: false, error: 'token_error' })
  assert.deepEqual(await goog.exchangeCode(cfg, 'c', 'v', fakeGoogle('throw').f), { ok: false, error: 'network' })
})

// ── refresh / revoke ────────────────────────────────────────────────────────
await t('refresh: success, permanent invalid_grant, and transient failures are told apart', async () => {
  const ok = await goog.refreshAccessToken(cfg, RT, fakeGoogle({ status: 200, json: { access_token: 'ya29.A', expires_in: 3600 } }).f)
  assert.deepEqual(ok, { ok: true, accessToken: 'ya29.A', expiresIn: 3600 })
  assert.deepEqual(await goog.refreshAccessToken(cfg, RT, fakeGoogle({ status: 400, json: { error: 'invalid_grant' } }).f), { ok: false, error: 'invalid_grant', transient: false })
  for (const r of [{ status: 503, json: {} }, { status: 429, json: {} }, 'throw']) assert.equal((await goog.refreshAccessToken(cfg, RT, fakeGoogle(r).f)).transient, true)
})

await t('revoke: true only on HTTP 200', async () => {
  assert.equal(await goog.revokeToken(RT, fakeGoogle({ status: 200, json: {} }).f), true)
  assert.equal(await goog.revokeToken(RT, fakeGoogle({ status: 400, json: {} }).f), false)
  assert.equal(await goog.revokeToken(RT, fakeGoogle('throw').f), false)
})

// ── Testing-mode expiry ─────────────────────────────────────────────────────
await t('testing expiry: 7 days from grant; warns inside 48h; expired after', () => {
  const now = Date.UTC(2026, 10, 10, 12, 0, 0), granted = now / 1000
  assert.equal(conn.testingExpiry(granted, now).level, 'ok')
  assert.equal(conn.testingExpiry(granted, now).expiresAtMs, now + 7 * 86400e3)
  assert.equal(conn.testingExpiry(granted, now + 5.5 * 86400e3).level, 'soon')
  assert.equal(conn.testingExpiry(granted, now + 7 * 86400e3 + 1).level, 'expired')
  assert.equal(conn.testingExpiry(null, now), null)
})

// ── static guarantees ───────────────────────────────────────────────────────
await t('static: no Search Console / Analytics / PageSpeed API call exists in the GSC code; no token logging', () => {
  const files = ['lib/seo-command/gsc-google.ts', 'lib/seo-command/gsc-connection.ts', 'lib/seo-command/gsc-state.ts', 'app/api/admin/seo/gsc/callback/route.ts', 'app/api/admin/seo/gsc/connect/route.ts', 'app/api/admin/seo/gsc/disconnect/route.ts']
  for (const f of files) {
    const src = readFileSync(path.join(ROOT, f), 'utf8')
    assert.ok(!/searchconsole\.googleapis\.com|webmasters\/v3|analyticsdata|pagespeedonline|searchAnalytics|urlInspection/i.test(src), f + ' must not call Google data APIs')
    for (const line of src.split('\n').filter((l) => /console\.(log|error|warn)/.test(l))) assert.ok(!/token|secret|verifier|code\b|state\b/i.test(line.replace(/'[^']*'/g, '')), 'logging must not include secrets: ' + line.trim())
  }
  const cb = readFileSync(path.join(ROOT, 'app/api/admin/seo/gsc/callback/route.ts'), 'utf8')
  assert.ok(cb.indexOf('verifyFlowCookie') < cb.indexOf('consumeOAuthState') && cb.indexOf('consumeOAuthState') < cb.indexOf('exchangeCode'), 'cookie check, then state burn, then Google')
  const nonRoute = /export (const|function|async function) (?!GET\b|POST\b|dynamic\b|maxDuration\b)/
  for (const f of files.filter((x) => x.includes('/route.ts'))) assert.ok(!nonRoute.test(readFileSync(path.join(ROOT, f), 'utf8')), f + ' exports only route handlers')
})

await t('static: Google data APIs are called ONLY from gsc-connectivity.ts, which is read-only and limited to the 3 approved calls', () => {
  const src = readFileSync(path.join(ROOT, 'lib/seo-command/gsc-connectivity.ts'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.ok(!/INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE/i.test(src.replace(/ownership|updated/gi, '')), 'no write SQL')
  assert.ok(!/urlInspection|inspection|analyticsdata|analyticsadmin|pagespeedonline|searchAnalytics\/query`, \{ *method: 'GET'/i.test(src), 'no URL Inspection / GA4 / PageSpeed')
  assert.deepEqual([...src.matchAll(/\$\{API\}(\/[^`'"]*)/g)].map((m) => m[1].replace(/\$\{site\}/, '{site}')), ['/sites', '/sites/{site}/searchAnalytics/query', '/sites/{site}/sitemaps'])
  const route = readFileSync(path.join(ROOT, 'app/api/admin/seo/gsc/connectivity-test/route.ts'), 'utf8')
  assert.ok(!/audit\(|storeConnection|recordTokenError|recordRevoked|INSERT|UPDATE |DELETE /i.test(route), 'route writes nothing')
  for (const f of ['lib/seo-command/gsc-state.ts', 'lib/seo-command/gsc-connection.ts', 'lib/seo-command/gsc-google.ts']) assert.ok(!/googleapis\.com\/webmasters/.test(readFileSync(path.join(ROOT, f), 'utf8')), f)
})

await t('static: dashboard panel and client buttons never receive token material', () => {
  const panel = readFileSync(path.join(ROOT, 'components/seo-command/gsc-panel.tsx'), 'utf8')
  assert.ok(!/refreshToken|Cipher|clientSecret|ENCRYPTION_KEY/.test(panel))
  const view = readFileSync(path.join(ROOT, 'lib/seo-command/gsc-connection.ts'), 'utf8')
  const sel = view.slice(view.indexOf('export async function getConnectionView'), view.indexOf('export type AccessResult'))
  assert.ok(!/refreshToken/.test(sel), 'status query selects no token columns')
})

// ── connectivity test (fake Google) ─────────────────────────────────────────
const route = (opts = {}) => async (url, init) => {
  calls.push({ url: String(url), method: init.method, auth: init.headers.authorization, body: typeof init.body === 'string' ? JSON.parse(init.body) : null })
  const u = String(url)
  if (u === g.GSC_TOKEN_ENDPOINT) return { status: 200, json: async () => ({ access_token: 'ya29.SECRET-ACCESS', expires_in: 3600 }) }
  if (u.endsWith('/sites')) return { status: 200, json: async () => ({ siteEntry: opts.sites ?? [{ siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' }, { siteUrl: 'https://other.example/', permissionLevel: 'siteFullUser' }] }) }
  if (u.endsWith('/searchAnalytics/query')) return { status: opts.saStatus ?? 200, json: async () => opts.saStatus ? { error: { status: 'PERMISSION_DENIED', message: 'User does not have sufficient permission' } } : { rows: opts.rows ?? [{ keys: ['2026-11-07'], clicks: 3, impressions: 120, ctr: 0.025, position: 14.2 }] } }
  if (u.endsWith('/sitemaps')) return { status: 200, json: async () => ({ sitemap: [{ path: 'https://www.example.com/sitemap.xml', lastSubmitted: '2026-10-01T00:00:00Z', isPending: false, isSitemapsIndex: false, type: 'sitemap', errors: '0', warnings: '1', contents: [{ type: 'web', submitted: '280', indexed: '0' }] }] }) }
  return { status: 404, json: async () => ({}) }
}
let calls = []
const NOW = new Date(Date.UTC(2026, 10, 10, 16, 0, 0))
await t('connectivity: exactly the 3 approved calls; <=10 rows; date window; token never in the report', async () => {
  calls = []
  const r = await ct.runConnectivityTest({ refreshToken: RT, cfg: { ...cfg, property: 'sc-domain:example.com' }, fetchImpl: route(), now: NOW })
  assert.deepEqual(calls.map((c) => c.method + ' ' + c.url.replace('https://www.googleapis.com/webmasters/v3', '')), ['POST https://oauth2.googleapis.com/token', 'GET /sites', 'POST /sites/sc-domain%3Aexample.com/searchAnalytics/query', 'GET /sites/sc-domain%3Aexample.com/sitemaps'])
  assert.deepEqual(calls[2].body, { startDate: '2026-11-05', endDate: '2026-11-07', dimensions: ['date'], rowLimit: 10, dataState: 'final' })
  assert.ok(calls.slice(1).every((c) => c.auth === 'Bearer ya29.SECRET-ACCESS'))
  assert.equal(r.sites.propertyAccessible, true); assert.equal(r.sites.permissionLevel, 'siteOwner'); assert.equal(r.sites.propertiesVisibleToAccount, 2)
  assert.deepEqual(r.searchAnalytics.rows, [{ date: '2026-11-07', clicks: 3, impressions: 120, ctr: 0.025, position: 14.2 }])
  assert.equal(r.sitemaps.sitemaps[0].warnings, 1); assert.equal(r.sitemaps.sitemaps[0].contents[0].submitted, 280)
  const dump = JSON.stringify(r)
  assert.ok(!dump.includes('ya29') && !dump.includes(RT) && !dump.includes('CLIENT-SECRET') && !dump.includes('other.example'), 'no tokens, no secrets, no other properties')
})

await t('connectivity: more than 10 rows are capped; property missing from the list is reported; Google errors are surfaced, not hidden', async () => {
  const many = Array.from({ length: 25 }, (_, i) => ({ keys: ['2026-11-0' + (i % 9)], clicks: i, impressions: i, ctr: 0, position: 1 }))
  const r1 = await ct.runConnectivityTest({ refreshToken: RT, cfg: { ...cfg, property: 'sc-domain:example.com' }, fetchImpl: route({ rows: many }), now: NOW })
  assert.equal(r1.searchAnalytics.rows.length, 10)
  const r2 = await ct.runConnectivityTest({ refreshToken: RT, cfg: { ...cfg, property: 'sc-domain:example.com' }, fetchImpl: route({ sites: [{ siteUrl: 'https://other.example/', permissionLevel: 'siteOwner' }] }), now: NOW })
  assert.equal(r2.sites.propertyAccessible, false); assert.equal(r2.sites.permissionLevel, null)
  const r3 = await ct.runConnectivityTest({ refreshToken: RT, cfg: { ...cfg, property: 'sc-domain:example.com' }, fetchImpl: route({ saStatus: 403 }), now: NOW })
  assert.equal(r3.searchAnalytics.ok, false); assert.equal(r3.searchAnalytics.httpStatus, 403); assert.equal(r3.searchAnalytics.googleStatus, 'PERMISSION_DENIED')
})

await t('connectivity: refresh failure stops before any Search Console call', async () => {
  calls = []
  const f = async (url, init) => { calls.push(String(url)); return { status: 400, json: async () => ({ error: 'invalid_grant' }) } }
  const r = await ct.runConnectivityTest({ refreshToken: RT, cfg: { ...cfg, property: 'sc-domain:example.com' }, fetchImpl: f, now: NOW })
  assert.deepEqual(r.token, { ok: false, error: 'invalid_grant' }); assert.equal(r.sites, undefined); assert.equal(calls.length, 1)
})

// ── integration (scratch DB) ────────────────────────────────────────────────
const url = process.env.SEO_TEST_DATABASE_URL
if (!url) { console.log(`SKIP db parts of seo-command-gsc-connection tests: SEO_TEST_DATABASE_URL not set (${n} tests passed)`); process.exit(0) }
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) throw new Error('refusing to run DB tests against a non-local database')
const pool = new pg.Pool({ connectionString: url, max: 4 })
const q = async (text, params) => (await pool.query(text, params)).rows
await q('TRUNCATE seo_oauth_states, seo_oauth_connections, seo_sites CASCADE')
await q(`INSERT INTO seo_sites (id,domain,"baseUrl","updatedAt") VALUES ('site1','example.com','https://www.example.com',now())`)
const view = () => conn.getConnectionView(q, 'site1')
const raw = async () => (await q(`SELECT * FROM seo_oauth_connections WHERE "siteId"='site1'`))[0]
const store = (token = RT, e = env) => conn.storeConnection(q, { siteId: 'site1', refreshToken: token, scope: g.GSC_SCOPE, property: cfg.property, env: e })

await t('db: no row means DISCONNECTED with no data', async () => {
  const v = await view()
  assert.equal(v.state, 'DISCONNECTED'); assert.equal(v.grantedAtEpoch, null)
})

await t('db: full flow: start -> consume -> exchange (fake) -> encrypted store; replay refused', async () => {
  const state = g.newState(), verifier = g.newCodeVerifier()
  await s.createOAuthState(q, { state, verifier, adminEmail: 'owner@tapis.test', env })
  const c = await s.consumeOAuthState(q, { state, adminHashFromCookie: g.adminBinding('owner@tapis.test', env), env })
  assert.equal(c.ok, true)
  const gg = fakeGoogle({ status: 200, json: { refresh_token: RT, scope: g.GSC_SCOPE } })
  const ex = await goog.exchangeCode(cfg, 'code', c.verifier, gg.f)
  assert.equal(gg.calls[0].body.code_verifier, verifier, 'verifier travels via the DB, decrypted')
  await store(ex.refreshToken)
  assert.equal((await s.consumeOAuthState(q, { state, adminHashFromCookie: g.adminBinding('owner@tapis.test', env), env })).ok, false, 'replay')
  const row = await raw()
  assert.equal(row.state, 'CONNECTED'); assert.equal(row.scope, g.GSC_SCOPE); assert.equal(row.propertyUrl, cfg.property); assert.equal(row.keyVersion, 1)
  const dump = JSON.stringify(row)
  assert.ok(!dump.includes(RT) && !Buffer.from(row.refreshTokenCipher).toString('utf8').includes('REFRESH'), 'ciphertext only')
  assert.equal(g.openSecret({ cipher: row.refreshTokenCipher, iv: row.refreshTokenIv, tag: row.refreshTokenTag, keyVersion: row.keyVersion }, env), RT)
  const v = await view()
  assert.equal(v.state, 'CONNECTED'); assert.ok(v.grantedAtEpoch > 0); assert.ok(!JSON.stringify(v).includes(RT))
})

await t('db: connectivity read is SELECT-only: no row changes (xmin), works in a READ ONLY transaction, never flags state', async () => {
  const x0 = (await q(`SELECT xmin::text x FROM seo_oauth_connections`))[0].x
  const c = await pool.connect()
  try {
    await c.query('BEGIN'); await c.query('SET TRANSACTION READ ONLY')
    const ro = (t, p) => c.query(t, p).then((r) => r.rows)
    assert.deepEqual(await ct.readRefreshTokenReadOnly(ro, 'site1', cfg.property, env), { ok: true, refreshToken: RT })
    assert.deepEqual(await ct.readRefreshTokenReadOnly(ro, 'site1', 'sc-domain:other.com', env), { ok: false, reason: 'property_mismatch' }, 'a different property is refused, not silently used')
    await assert.rejects(c.query(`UPDATE seo_oauth_connections SET state='ERROR'`), /read-only transaction/, 'Postgres itself blocks writes')
    await c.query('ROLLBACK')
    // wrong key: read-only path reports key_unavailable but must NOT mark the row
    const wrong = { ...env, GSC_TOKEN_ENCRYPTION_KEY: k() }
    assert.deepEqual(await ct.readRefreshTokenReadOnly(q, 'site1', cfg.property, wrong), { ok: false, reason: 'key_unavailable' })
  } finally { c.release() }
  assert.equal((await q(`SELECT xmin::text x FROM seo_oauth_connections`))[0].x, x0, 'row untouched')
  assert.equal((await view()).state, 'CONNECTED')
})

await t('db: access token refresh succeeds, records lastRefreshAt, stores no access token', async () => {
  const gg = fakeGoogle({ status: 200, json: { access_token: 'ya29.LIVE', expires_in: 3600 } })
  const r = await conn.getAccessToken(q, 'site1', { cfg, env, fetchImpl: gg.f })
  assert.deepEqual(r, { ok: true, accessToken: 'ya29.LIVE' })
  assert.equal(gg.calls[0].body.refresh_token, RT)
  assert.ok((await view()).lastRefreshEpoch > 0)
  assert.ok(!JSON.stringify(await raw()).includes('ya29'))
})

await t('db: transient Google failure changes nothing', async () => {
  const r = await conn.getAccessToken(q, 'site1', { cfg, env, fetchImpl: fakeGoogle({ status: 503, json: {} }).f })
  assert.deepEqual(r, { ok: false, state: 'CONNECTED', reason: 'transient' })
  assert.equal((await view()).state, 'CONNECTED')
})

await t('db: invalid_grant (7-day Testing expiry) -> RECONNECT_REQUIRED, visible, no further Google calls', async () => {
  const r = await conn.getAccessToken(q, 'site1', { cfg, env, fetchImpl: fakeGoogle({ status: 400, json: { error: 'invalid_grant' } }).f })
  assert.deepEqual(r, { ok: false, state: 'RECONNECT_REQUIRED', reason: 'reconnect_required' })
  const v = await view()
  assert.equal(v.state, 'RECONNECT_REQUIRED'); assert.equal(v.lastErrorCode, 'invalid_grant')
  const gg = fakeGoogle({ status: 200, json: { access_token: 'x' } })
  assert.equal((await conn.getAccessToken(q, 'site1', { cfg, env, fetchImpl: gg.f })).reason, 'reconnect_required')
  assert.equal(gg.calls.length, 0, 'no retry loop against Google')
})

await t('db: reconnect replaces the token and clears the error state', async () => {
  await store('1//NEW-REFRESH-TOKEN-VALUE-0000')
  const v = await view()
  assert.equal(v.state, 'CONNECTED'); assert.equal(v.lastErrorCode, null); assert.equal(v.revokedEpoch, null); assert.equal(v.lastRefreshEpoch, null)
  assert.equal((await q('SELECT count(*)::int n FROM seo_oauth_connections'))[0].n, 1, 'one row per site/provider')
})

await t('db: replaced encryption key -> KEY_UNAVAILABLE; ciphertext untouched; reconnect recovers', async () => {
  const before = await raw()
  const wrong = { ...env, GSC_TOKEN_ENCRYPTION_KEY: k() }
  const gg = fakeGoogle({ status: 200, json: { access_token: 'x' } })
  assert.deepEqual(await conn.getAccessToken(q, 'site1', { cfg, env: wrong, fetchImpl: gg.f }), { ok: false, state: 'KEY_UNAVAILABLE', reason: 'key_unavailable' })
  assert.equal(gg.calls.length, 0)
  const after = await raw()
  assert.ok(Buffer.compare(before.refreshTokenCipher, after.refreshTokenCipher) === 0 && Buffer.compare(before.refreshTokenTag, after.refreshTokenTag) === 0, 'ciphertext not modified')
  assert.equal(after.state, 'KEY_UNAVAILABLE')
  const d = await conn.disconnect(q, 'site1', { env: wrong, fetchImpl: fakeGoogle().f })
  assert.deepEqual(d, { ok: false, reason: 'key_unavailable' })
  assert.ok((await raw()).refreshTokenCipher, 'disconnect refuses to destroy an unreadable token')
  await store('1//RECOVERED-TOKEN-VALUE-00000', wrong)
  assert.equal((await view()).state, 'CONNECTED')
  await store(RT) // restore under the original key for the next tests
})

await t('db: key rotation keeps the connection usable with the previous key slot', async () => {
  const neu = k()
  const rot = { ...env, GSC_TOKEN_ENCRYPTION_KEY: neu, GSC_TOKEN_KEY_VERSION: '2', GSC_TOKEN_ENCRYPTION_KEY_PREVIOUS: env.GSC_TOKEN_ENCRYPTION_KEY, GSC_TOKEN_KEY_PREVIOUS_VERSION: '1' }
  const r = await conn.getAccessToken(q, 'site1', { cfg, env: rot, fetchImpl: fakeGoogle({ status: 200, json: { access_token: 'ya29.R' } }).f })
  assert.equal(r.ok, true)
})

await t('db: disconnect revokes at Google, wipes ciphertext, keeps the row and reports revocation', async () => {
  const gg = fakeGoogle({ status: 200, json: {} })
  const d = await conn.disconnect(q, 'site1', { env, fetchImpl: gg.f })
  assert.deepEqual(d, { ok: true, revokedAtGoogle: true })
  assert.equal(gg.calls[0].url, g.GSC_REVOKE_ENDPOINT); assert.equal(gg.calls[0].body.token, RT)
  const row = await raw()
  assert.equal(row.state, 'DISCONNECTED'); assert.equal(row.refreshTokenCipher, null); assert.ok(row.revokedAt)
  const gg2 = fakeGoogle()
  assert.equal((await conn.getAccessToken(q, 'site1', { cfg, env, fetchImpl: gg2.f })).reason, 'not_connected')
  assert.equal(gg2.calls.length, 0)
})

await t('db: disconnect still wipes locally when Google cannot confirm revocation', async () => {
  await store(RT)
  const d = await conn.disconnect(q, 'site1', { env, fetchImpl: fakeGoogle('throw').f })
  assert.deepEqual(d, { ok: true, revokedAtGoogle: false })
  assert.equal((await raw()).refreshTokenCipher, null)
})

await pool.end()
console.log(`${n} tests passed`)
