import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { randomBytes } from 'node:crypto'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const g = jiti('../lib/seo-command/gsc-oauth.ts')
const sess = jiti('../lib/seo-command/auth-session.ts')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const SECRET = 'seo-secret-seo-secret-seo-secret-0123456789'
const KEY = randomBytes(32).toString('base64')
const REDIRECT = 'https://tapis-global-main-git-feat-seo-29ee74-sameers-projects-2cf742c9.vercel.app/api/admin/seo/gsc/callback'
const env = { SEO_SESSION_SECRET: SECRET, NODE_ENV: 'production', GSC_TOKEN_ENCRYPTION_KEY: KEY, GSC_OAUTH_CLIENT_ID: 'id', GSC_OAUTH_CLIENT_SECRET: 'sec', GSC_OAUTH_REDIRECT_URI: REDIRECT, GSC_SITE_URL: 'sc-domain:tapisglobalinternational.com' }

await t('PKCE S256 matches the RFC 7636 test vector', () => {
  assert.equal(g.codeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'), 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
  const v = g.newCodeVerifier(); assert.ok(v.length >= 43 && v.length <= 128)
  assert.notEqual(g.newState(), g.newState())
})

await t('auth URL requests only the read-only scope, offline access, PKCE and exactly the registered redirect', () => {
  const u = new URL(g.buildAuthUrl({ clientId: 'id', redirectUri: REDIRECT }, 'st', 'ver'))
  assert.equal(u.searchParams.get('scope'), 'https://www.googleapis.com/auth/webmasters.readonly')
  assert.equal(u.searchParams.get('access_type'), 'offline')
  assert.equal(u.searchParams.get('code_challenge_method'), 'S256')
  assert.equal(u.searchParams.get('redirect_uri'), REDIRECT)
  assert.equal(u.searchParams.get('state'), 'st')
  assert.ok(!u.search.includes('ver&') && u.searchParams.get('code_verifier') === null, 'verifier never in the URL')
})

await t('config requires every variable, https, and the exact callback path', () => {
  assert.ok(g.gscOAuthConfig(env))
  for (const k of ['GSC_OAUTH_CLIENT_ID', 'GSC_OAUTH_CLIENT_SECRET', 'GSC_OAUTH_REDIRECT_URI', 'GSC_SITE_URL', 'GSC_TOKEN_ENCRYPTION_KEY']) assert.equal(g.gscOAuthConfig({ ...env, [k]: undefined }), null, k)
  assert.equal(g.gscOAuthConfig({ ...env, GSC_OAUTH_REDIRECT_URI: 'http://x.test/api/admin/seo/gsc/callback' }), null)
  assert.equal(g.gscOAuthConfig({ ...env, GSC_OAUTH_REDIRECT_URI: 'https://x.test/other' }), null)
  assert.equal(g.gscOAuthConfig({ ...env, GSC_TOKEN_ENCRYPTION_KEY: 'short' }), null)
  assert.ok(g.isAllowedRedirectUri(REDIRECT, REDIRECT) && !g.isAllowedRedirectUri(REDIRECT + '/', REDIRECT))
})

await t('the admin session cookie stays SameSite=Strict; the flow cookie is Lax, HttpOnly, Secure and callback-path only', () => {
  assert.equal(sess.seoCookieOptions(env).sameSite, 'strict')
  const f = g.flowCookieOptions(env)
  assert.deepEqual([f.sameSite, f.httpOnly, f.secure, f.path, f.maxAge], ['lax', true, true, '/api/admin/seo/gsc/callback', 600])
})

await t('flow cookie verifies only with the matching state', async () => {
  const state = g.newState()
  const c = await g.signFlowCookie(state, 'Owner@Tapis.test', { env })
  const claims = await g.verifyFlowCookie(c, state, { env })
  assert.equal(claims.stateHash, g.hashState(state))
  assert.equal(claims.adminHash, g.adminBinding('owner@tapis.test', env))
  assert.equal(await g.verifyFlowCookie(c, g.newState(), { env }), null, 'state from another attempt')
  assert.equal(await g.verifyFlowCookie(c, null, { env }), null)
  assert.equal(await g.verifyFlowCookie(undefined, state, { env }), null)
})

await t('flow cookie expires after 10 minutes and rejects tampering', async () => {
  const state = g.newState(), start = new Date('2026-11-10T00:00:00Z')
  const c = await g.signFlowCookie(state, 'a@b.test', { env, now: start })
  assert.ok(await g.verifyFlowCookie(c, state, { env, now: new Date(start.getTime() + 9 * 60_000) }))
  assert.equal(await g.verifyFlowCookie(c, state, { env, now: new Date(start.getTime() + 11 * 60_000) }), null)
  const bad = c.slice(0, -3) + (c.endsWith('AAA') ? 'BBB' : 'AAA')
  assert.equal(await g.verifyFlowCookie(bad, state, { env }), null)
})

await t('a session token is never accepted as a flow cookie, and a flow cookie is never accepted as a session', async () => {
  const state = g.newState()
  const session = await sess.signSeoSession('a@b.test', { env })
  assert.equal(await g.verifyFlowCookie(session, state, { env }), null)
  const flow = await g.signFlowCookie(state, 'a@b.test', { env })
  assert.equal(await sess.verifySeoSession(flow, { env }), null)
})

await t('refresh-token encryption: round trip, unique nonce, tamper/wrong-key/truncation all fail closed', () => {
  const secret = '1//0g-example-refresh-token'
  const a = g.sealSecret(secret, env), b = g.sealSecret(secret, env)
  assert.notEqual(a.iv.toString('hex'), b.iv.toString('hex'))
  assert.ok(!a.cipher.toString('utf8').includes('refresh'))
  assert.equal(g.openSecret(a, env), secret)
  const flipped = Buffer.from(a.cipher); flipped[0] ^= 1
  assert.equal(g.openSecret({ ...a, cipher: flipped }, env), null)
  assert.equal(g.openSecret({ ...a, tag: randomBytes(16) }, env), null)
  assert.equal(g.openSecret({ ...a, iv: a.iv.subarray(0, 8) }, env), null)
  assert.equal(g.openSecret(a, { ...env, GSC_TOKEN_ENCRYPTION_KEY: randomBytes(32).toString('base64') }), null)
  assert.equal(g.openSecret(a, { ...env, GSC_TOKEN_ENCRYPTION_KEY: undefined }), null)
  assert.throws(() => g.sealSecret('x', { ...env, GSC_TOKEN_ENCRYPTION_KEY: 'short' }))
})

await t('token errors map to the right connection state (invalid_grant => reconnect required)', () => {
  assert.deepEqual(g.stateForTokenError('invalid_grant'), { state: 'RECONNECT_REQUIRED', code: 'invalid_grant' })
  assert.equal(g.stateForTokenError('invalid_client').state, 'ERROR')
  assert.equal(g.stateForTokenError(undefined).code, 'unknown')
})

await t('callback result page is escaped, noindex, and links back with a same-site navigation', () => {
  const h = g.callbackResultHtml({ ok: false, message: '<script>x</script>', continueHref: '/admin/seo' })
  assert.ok(!h.includes('<script>') && h.includes('noindex') && h.includes('href="/admin/seo"'))
})

// ---- the real route handler, fail-closed ordering (no DB, no Google call is possible in these cases)
const { NextRequest } = jiti('next/server')
const route = jiti('../app/api/admin/seo/gsc/callback/route.ts')
const call = async (qs, cookie, e = env) => {
  const old = { ...process.env }; Object.assign(process.env, e)
  for (const k of Object.keys(e)) if (e[k] === undefined) delete process.env[k]
  try {
    return await route.GET(new NextRequest('https://x.vercel.app/api/admin/seo/gsc/callback' + qs, { headers: cookie ? { cookie: `seo_gsc_flow=${cookie}` } : {} }))
  } finally { process.env = old }
}
await t('callback: not configured => 503; Google error => 400; missing params => 400; no/invalid cookie => 400; always clears the flow cookie', async () => {
  assert.equal((await call('?code=c&state=s', null, { ...env, GSC_OAUTH_CLIENT_ID: undefined })).status, 503)
  assert.equal((await call('?error=access_denied&state=s')).status, 400)
  assert.equal((await call('?state=s')).status, 400)
  assert.equal((await call('?code=c')).status, 400)
  const noCookie = await call('?code=c&state=s'); assert.equal(noCookie.status, 400)
  assert.match(noCookie.headers.get('set-cookie') ?? '', /seo_gsc_flow=;/)
  const state = g.newState()
  const other = await g.signFlowCookie(g.newState(), 'a@b.test', { env })
  assert.equal((await call(`?code=c&state=${state}`, other)).status, 400, 'cookie for a different attempt')
  assert.equal((await call(`?code=c&state=${state}`, 'garbage')).status, 400)
})
await t('callback: a valid cookie+state passes the gate but storage stays disabled until the migration is approved (503, no DB touched)', async () => {
  const state = g.newState(), c = await g.signFlowCookie(state, 'a@b.test', { env })
  const r = await call(`?code=c&state=${state}`, c)
  assert.equal(r.status, 503)
  assert.equal(r.headers.get('cache-control'), 'no-store')
  assert.match(await r.text(), /not enabled yet/)
})

console.log(`\n${n} gsc oauth tests passed`)
