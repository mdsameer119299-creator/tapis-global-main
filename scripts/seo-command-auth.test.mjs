import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

const SEO_SECRET = 'seo-secret-seo-secret-seo-secret-0123456789'
const CT_SECRET = 'crafttrack-secret-crafttrack-secret-0123456789'
const sess = jiti('../lib/seo-command/auth-session.ts')
const pw = jiti('../lib/seo-command/auth-password.ts')
const rl = jiti('../lib/seo-command/auth-rate-limit.ts')
const ct = jiti('../lib/crafttrack/session.ts') // loaded ONLY to prove isolation

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const env = { SEO_SESSION_SECRET: SEO_SECRET, NODE_ENV: 'production' }

// A real hash produced by the real generator script (what the user will run locally).
const PASSWORD = 'correct horse battery staple'
const gen = spawnSync('node', [path.join(ROOT, 'scripts/seo-generate-admin-hash.mjs')], { input: PASSWORD + '\n', encoding: 'utf8' })
assert.equal(gen.status, 0, gen.stderr)
const HASH = gen.stdout.trim()
const loginEnv = { SEO_ADMIN_EMAIL: 'Owner@Tapis.test', SEO_ADMIN_PASSWORD_HASH: HASH }

// ------------------------------------------------------------------ session
await t('session round-trips and carries only email + expiry', async () => {
  const tok = await sess.signSeoSession('Owner@Tapis.test', { env })
  const s = await sess.verifySeoSession(tok, { env })
  assert.equal(s.email, 'owner@tapis.test')
  assert.ok(s.expiresAt > Date.now() / 1000)
})

await t('session expires after 8 hours exactly and not before', async () => {
  const start = new Date('2026-11-10T00:00:00Z')
  const tok = await sess.signSeoSession('a@b.test', { env, now: start })
  assert.ok(await sess.verifySeoSession(tok, { env, now: new Date(start.getTime() + 8 * 3600_000 - 2000) }))
  assert.equal(await sess.verifySeoSession(tok, { env, now: new Date(start.getTime() + 8 * 3600_000 + 2000) }), null)
  const short = await sess.signSeoSession('a@b.test', { env, now: start, ttlSeconds: 60 })
  assert.equal(await sess.verifySeoSession(short, { env, now: new Date(start.getTime() + 61_000) }), null)
  assert.equal(sess.SEO_SESSION_TTL_SECONDS, 8 * 3600)
})

await t('tampered, truncated, garbage, empty and oversized tokens are rejected', async () => {
  const tok = await sess.signSeoSession('a@b.test', { env })
  const [h, p, s] = tok.split('.')
  const forgedPayload = Buffer.from(JSON.stringify({ type: 'seo-admin', email: 'evil@x.test', iss: 'tapis-seo-command', aud: 'seo-admin', iat: 1, exp: 9999999999 })).toString('base64url')
  for (const bad of [`${h}.${forgedPayload}.${s}`, tok.slice(0, -4), 'abc', '', undefined, null, 'a'.repeat(5000), `${h}.${p}.`]) assert.equal(await sess.verifySeoSession(bad, { env }), null)
  // alg=none forgery
  const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${forgedPayload}.`
  assert.equal(await sess.verifySeoSession(none, { env }), null)
})

await t('wrong secret, missing secret and weak secret never validate or sign', async () => {
  const tok = await sess.signSeoSession('a@b.test', { env })
  assert.equal(await sess.verifySeoSession(tok, { env: { SEO_SESSION_SECRET: 'x'.repeat(40) } }), null)
  assert.equal(await sess.verifySeoSession(tok, { env: {} }), null)
  assert.equal(await sess.verifySeoSession(tok, { env: { SEO_SESSION_SECRET: 'short' } }), null)
  await assert.rejects(sess.signSeoSession('a@b.test', { env: { SEO_SESSION_SECRET: 'short' } }), /SEO_SESSION_SECRET/)
  assert.equal(sess.isSeoSessionConfigured({}), false)
  assert.equal(sess.isSeoSessionConfigured({ SEO_SESSION_SECRET: 'short' }), false)
  assert.equal(sess.isSeoSessionConfigured(env), true)
})

// ------------------------------------------------------------------ isolation
await t('a CraftTrack admin token can NOT open SEO (different secret)', async () => {
  process.env.CRAFTTRACK_SESSION_SECRET = CT_SECRET
  const ctTok = await ct.signAdminSession({ type: 'admin', adminId: 'a1', email: 'admin@tapis.test' })
  assert.equal(await sess.verifySeoSession(ctTok, { env }), null)
})

await t('a CraftTrack admin token can NOT open SEO even if both secrets were identical', async () => {
  process.env.CRAFTTRACK_SESSION_SECRET = SEO_SECRET
  const ctTok = await ct.signAdminSession({ type: 'admin', adminId: 'a1', email: 'admin@tapis.test' })
  assert.equal(await sess.verifySeoSession(ctTok, { env }), null, 'token type/issuer/audience must not match')
  const seoTok = await sess.signSeoSession('a@b.test', { env })
  assert.equal(await ct.verifyAdminSession(seoTok), null, 'SEO token must not pass CraftTrack admin verification')
  assert.equal(await ct.verifyCustomerSession(seoTok), null)
})

await t('a SEO token can NOT open CraftTrack (different secrets)', async () => {
  process.env.CRAFTTRACK_SESSION_SECRET = CT_SECRET
  const seoTok = await sess.signSeoSession('a@b.test', { env })
  assert.equal(await ct.verifyAdminSession(seoTok), null)
  assert.equal(await ct.verifyCustomerSession(seoTok), null)
})

await t('cookie names differ and the SEO cookie is never the CraftTrack cookie', () => {
  assert.equal(sess.SEO_SESSION_COOKIE, 'seo_admin_session')
  assert.notEqual(sess.SEO_SESSION_COOKIE, ct.ADMIN_SESSION_COOKIE)
  assert.notEqual(sess.SEO_SESSION_COOKIE, ct.CUSTOMER_SESSION_COOKIE)
})

// ------------------------------------------------------------------ cookie security
await t('cookie is HttpOnly, Secure, SameSite=Strict, site-wide path, 8h max-age', () => {
  const o = sess.seoCookieOptions({ NODE_ENV: 'production' })
  assert.deepEqual(o, { httpOnly: true, secure: true, sameSite: 'strict', path: '/', maxAge: 28800 })
  assert.equal(sess.seoCookieOptions({ NODE_ENV: 'preview' }).secure, true)
  assert.equal(sess.seoCookieOptions({}).secure, true, 'secure by default')
  assert.equal(sess.seoCookieOptions({ NODE_ENV: 'development' }).secure, false, 'only local http dev relaxes Secure')
  const c = sess.seoClearCookieOptions({ NODE_ENV: 'production' })
  assert.equal(c.maxAge, 0); assert.equal(c.httpOnly, true); assert.equal(c.secure, true)
})

// ------------------------------------------------------------------ credentials
await t('credentials: correct login passes, wrong password/email fail, case-insensitive email', () => {
  assert.equal(pw.verifyAdminCredentials('owner@tapis.test', PASSWORD, loginEnv), true)
  assert.equal(pw.verifyAdminCredentials('  OWNER@tapis.test ', PASSWORD, loginEnv), true)
  assert.equal(pw.verifyAdminCredentials('owner@tapis.test', PASSWORD + 'x', loginEnv), false)
  assert.equal(pw.verifyAdminCredentials('owner@tapis.test', '', loginEnv), false)
  assert.equal(pw.verifyAdminCredentials('other@tapis.test', PASSWORD, loginEnv), false)
  assert.equal(pw.verifyAdminCredentials('owner@tapis.test', 'x'.repeat(5000), loginEnv), false)
})

await t('credentials: unconfigured or malformed hash always denies', () => {
  assert.equal(pw.verifyAdminCredentials('owner@tapis.test', PASSWORD, {}), false)
  assert.equal(pw.verifyAdminCredentials('owner@tapis.test', PASSWORD, { SEO_ADMIN_EMAIL: 'owner@tapis.test' }), false)
  for (const bad of ['', 'plain-password', 'scrypt:1:1:1:aa:bb', 'scrypt:999999999:8:1:' + 'a'.repeat(32) + ':' + 'b'.repeat(64), '$2a$10$abcdefghijklmnopqrstuv']) {
    assert.equal(pw.verifyAdminCredentials('owner@tapis.test', PASSWORD, { SEO_ADMIN_EMAIL: 'owner@tapis.test', SEO_ADMIN_PASSWORD_HASH: bad }), false, bad)
    assert.equal(pw.isLoginConfigured({ SEO_ADMIN_EMAIL: 'owner@tapis.test', SEO_ADMIN_PASSWORD_HASH: bad }), false)
  }
  assert.equal(pw.isLoginConfigured(loginEnv), true)
})

await t('hash generator: salts differ per run, enforces min length, never prints the password', () => {
  const again = spawnSync('node', [path.join(ROOT, 'scripts/seo-generate-admin-hash.mjs')], { input: PASSWORD + '\n', encoding: 'utf8' })
  assert.notEqual(again.stdout.trim(), HASH)
  assert.equal(pw.verifyAdminCredentials('owner@tapis.test', PASSWORD, { SEO_ADMIN_EMAIL: 'owner@tapis.test', SEO_ADMIN_PASSWORD_HASH: again.stdout.trim() }), true)
  const short = spawnSync('node', [path.join(ROOT, 'scripts/seo-generate-admin-hash.mjs')], { input: 'short\n', encoding: 'utf8' })
  assert.notEqual(short.status, 0)
  assert.ok(!(gen.stdout + gen.stderr).includes(PASSWORD))
  const secret = spawnSync('node', [path.join(ROOT, 'scripts/seo-generate-admin-hash.mjs'), '--secret'], { encoding: 'utf8' }).stdout.trim()
  assert.ok(secret.length >= 32 && sess.isSeoSessionConfigured({ SEO_SESSION_SECRET: secret }))
})

// ------------------------------------------------------------------ rate limiting
await t('rate limiter: blocks after 5 failures in the window, recovers after it, reports Retry-After', () => {
  let now = 1_000_000
  const l = new rl.RateLimiter({ max: 5, windowMs: 900_000, now: () => now })
  for (let i = 0; i < 5; i++) { assert.equal(l.check('k').allowed, true); l.recordFailure('k'); now += 1000 }
  const blocked = l.check('k')
  assert.equal(blocked.allowed, false)
  assert.ok(blocked.retryAfterSeconds > 800 && blocked.retryAfterSeconds <= 900)
  assert.equal(l.check('other').allowed, true, 'keys are independent')
  now += 900_000
  assert.equal(l.check('k').allowed, true, 'window slides')
  l.recordFailure('k'); l.reset('k'); assert.equal(l.check('k').allowed, true)
})

await t('rate limiter: per-IP, per-email and instance-wide limits; success clears the email counter; memory is bounded', () => {
  rl.loginLimiter.clear(); rl.globalLoginLimiter.clear()
  for (let i = 0; i < 5; i++) rl.recordLoginFailure('1.1.1.1', 'v@t.test')
  assert.equal(rl.checkLogin('1.1.1.1', 'new@t.test').allowed, false, 'same IP blocked even with a new email')
  assert.equal(rl.checkLogin('9.9.9.9', 'V@t.test').allowed, false, 'same email blocked from a new IP (case-insensitive)')
  rl.recordLoginSuccess('v@t.test')
  assert.equal(rl.checkLogin('9.9.9.9', 'v@t.test').allowed, true)
  rl.loginLimiter.clear(); rl.globalLoginLimiter.clear()
  for (let i = 0; i < 40; i++) rl.recordLoginFailure(`10.0.0.${i}`, `u${i}@t.test`)
  assert.equal(rl.checkLogin('8.8.8.8', 'fresh@t.test').allowed, false, 'global cap')
  rl.loginLimiter.clear(); rl.globalLoginLimiter.clear()
  const small = new rl.RateLimiter({ max: 1, windowMs: 1000, maxKeys: 10 })
  for (let i = 0; i < 100; i++) small.recordFailure('k' + i)
  assert.ok(small.hits.size <= 10)
  assert.equal(rl.clientIp({ get: (k) => ({ 'x-vercel-forwarded-for': '5.5.5.5, 6.6.6.6' }[k] ?? null) }), '5.5.5.5')
})

// ------------------------------------------------------------------ login / logout routes
process.env.SEO_SESSION_SECRET = SEO_SECRET
process.env.SEO_ADMIN_EMAIL = 'owner@tapis.test'
process.env.SEO_ADMIN_PASSWORD_HASH = HASH
process.env.NODE_ENV = 'production'
const { NextRequest } = require('next/server')
const login = jiti('../app/api/admin/seo/auth/login/route.ts')
const logout = jiti('../app/api/admin/seo/auth/logout/route.ts')
const HOST = 'preview.example.vercel.app'
const post = (url, body, headers = {}) => new NextRequest(`https://${HOST}${url}`, { method: 'POST', headers: { host: HOST, origin: `https://${HOST}`, 'content-type': 'application/json', 'x-real-ip': '7.7.7.7', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) })

await t('login route: success sets a hardened seo_admin_session cookie that verifies', async () => {
  rl.loginLimiter.clear(); rl.globalLoginLimiter.clear()
  const res = await login.POST(post('/api/admin/seo/auth/login', { email: 'owner@tapis.test', password: PASSWORD }))
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('cache-control'), 'no-store')
  const c = res.headers.get('set-cookie')
  assert.match(c, /^seo_admin_session=/)
  for (const attr of [/HttpOnly/i, /Secure/i, /SameSite=strict/i, /Path=\//i, /Max-Age=28800/i]) assert.match(c, attr)
  assert.ok(!/crafttrack/i.test(c))
  const token = /seo_admin_session=([^;]+)/.exec(c)[1]
  assert.equal((await sess.verifySeoSession(token, { env })).email, 'owner@tapis.test')
  process.env.CRAFTTRACK_SESSION_SECRET = CT_SECRET
  assert.equal(await ct.verifyAdminSession(token), null)
})

await t('login route: wrong credentials give identical 401s, set no cookie, never reveal which field was wrong', async () => {
  rl.loginLimiter.clear(); rl.globalLoginLimiter.clear()
  const a = await login.POST(post('/api/admin/seo/auth/login', { email: 'owner@tapis.test', password: 'wrong-password-123' }))
  const b = await login.POST(post('/api/admin/seo/auth/login', { email: 'nobody@tapis.test', password: PASSWORD }))
  assert.equal(a.status, 401); assert.equal(b.status, 401)
  assert.deepEqual(await a.json(), await b.json())
  assert.equal(a.headers.get('set-cookie'), null)
})

await t('login route: bad input, cross-origin, missing origin and unconfigured env are refused', async () => {
  rl.loginLimiter.clear(); rl.globalLoginLimiter.clear()
  assert.equal((await login.POST(post('/api/admin/seo/auth/login', 'not json'))).status, 400)
  assert.equal((await login.POST(post('/api/admin/seo/auth/login', { email: 'a@b.test' }))).status, 400)
  assert.equal((await login.POST(post('/api/admin/seo/auth/login', { email: 'a@b.test', password: 'x'.repeat(300) }))).status, 400)
  assert.equal((await login.POST(post('/api/admin/seo/auth/login', 'x'.repeat(5000)))).status, 400)
  assert.equal((await login.POST(post('/api/admin/seo/auth/login', { email: 'owner@tapis.test', password: PASSWORD }, { origin: 'https://evil.example' }))).status, 403)
  const noOrigin = new NextRequest(`https://${HOST}/api/admin/seo/auth/login`, { method: 'POST', headers: { host: HOST }, body: '{}' })
  assert.equal((await login.POST(noOrigin)).status, 403)
  const keep = process.env.SEO_ADMIN_PASSWORD_HASH
  delete process.env.SEO_ADMIN_PASSWORD_HASH
  assert.equal((await login.POST(post('/api/admin/seo/auth/login', { email: 'owner@tapis.test', password: PASSWORD }))).status, 503)
  process.env.SEO_ADMIN_PASSWORD_HASH = keep
  const keepSecret = process.env.SEO_SESSION_SECRET
  process.env.SEO_SESSION_SECRET = 'short'
  assert.equal((await login.POST(post('/api/admin/seo/auth/login', { email: 'owner@tapis.test', password: PASSWORD }))).status, 503)
  process.env.SEO_SESSION_SECRET = keepSecret
})

await t('login route: brute force is throttled with 429 + Retry-After, even for the correct password', async () => {
  rl.loginLimiter.clear(); rl.globalLoginLimiter.clear()
  for (let i = 0; i < 5; i++) assert.equal((await login.POST(post('/api/admin/seo/auth/login', { email: 'owner@tapis.test', password: 'guess-guess-' + i }, { 'x-real-ip': '3.3.3.3' }))).status, 401)
  const blocked = await login.POST(post('/api/admin/seo/auth/login', { email: 'owner@tapis.test', password: PASSWORD }, { 'x-real-ip': '3.3.3.3' }))
  assert.equal(blocked.status, 429)
  assert.ok(Number(blocked.headers.get('retry-after')) > 0)
  assert.equal(blocked.headers.get('set-cookie'), null)
  const otherIpSameEmail = await login.POST(post('/api/admin/seo/auth/login', { email: 'owner@tapis.test', password: PASSWORD }, { 'x-real-ip': '4.4.4.4' }))
  assert.equal(otherIpSameEmail.status, 429, 'email-keyed limit holds across IPs')
  rl.loginLimiter.clear(); rl.globalLoginLimiter.clear()
})

await t('logout route: clears the cookie (even without a session) and rejects cross-origin', async () => {
  const res = await logout.POST(post('/api/admin/seo/auth/logout', {}))
  assert.equal(res.status, 200)
  const c = res.headers.get('set-cookie')
  assert.match(c, /^seo_admin_session=;/)
  assert.match(c, /Max-Age=0/i); assert.match(c, /HttpOnly/i); assert.match(c, /Secure/i)
  assert.equal((await logout.POST(post('/api/admin/seo/auth/logout', {}, { origin: 'https://evil.example' }))).status, 403)
})

console.log(`\n${n} auth tests passed`)
