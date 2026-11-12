// TEMPORARY role-diagnostic: authentication, authorisation, success shape, database-failure handling, and static guarantees (exact read-only query, no logging, no secrets, no writes).
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const d = jiti('../lib/seo-command/role-diagnostic.ts')
const sess = jiti('../lib/seo-command/auth-session.ts')
const { SeoDbNotConfiguredError } = jiti('../lib/seo-command/db.ts')
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const SECRET = 'postgresql://seo_worker.abcdefghij:S3CR3T-PASSWORD@aws-0-ap-south-1.pooler.supabase.com:5432/postgres'
const admin = { email: 'admin@example.test', expiresAt: 9999999999 }
const ADMIN = 'admin@example.test' // stands in for SEO_ADMIN_EMAIL
const counting = (fn) => { const f = async (sql) => { f.calls.push(sql); return fn(sql) }; f.calls = []; return f }

await t('authentication: no session -> 401 and the database is never touched', async () => {
  const q = counting(async () => ({ rows: [{ current_user: 'x', session_user: 'y' }] }))
  const r = await d.handleRoleDiagnostic({ session: null, adminEmail: ADMIN, query: q })
  assert.equal(r.status, 401); assert.deepEqual(r.body, { ok: false, error: 'Unauthorized' }); assert.equal(q.calls.length, 0)
})

await t('authorisation: only a genuine SEO admin session token verifies; missing, garbage, wrong-secret, expired and foreign-audience tokens do not', async () => {
  const env = { SEO_SESSION_SECRET: 'a'.repeat(40) }
  const good = await sess.signSeoSession('admin@example.test', { env })
  assert.ok(await sess.verifySeoSession(good, { env }))
  assert.equal(await sess.verifySeoSession(undefined, { env }), null)
  assert.equal(await sess.verifySeoSession('not.a.jwt', { env }), null)
  assert.equal(await sess.verifySeoSession(good, { env: { SEO_SESSION_SECRET: 'b'.repeat(40) } }), null)
  assert.equal(await sess.verifySeoSession(good, { env: {} }), null)
  const old = await sess.signSeoSession('admin@example.test', { env, now: new Date('2020-01-01T00:00:00Z'), ttlSeconds: 60 })
  assert.equal(await sess.verifySeoSession(old, { env }), null)
})

await t('admin authorisation: a VALID session for a non-admin identity gets 403 and the database is never touched', async () => {
  const env = { SEO_SESSION_SECRET: 'a'.repeat(40) }
  const token = await sess.signSeoSession('someone-else@example.test', { env })
  const valid = await sess.verifySeoSession(token, { env })
  assert.ok(valid, 'the session itself is genuine and unexpired')
  const q = counting(async () => ({ rows: [{ current_user: 'postgres', session_user: 'postgres' }] }))
  const r = await d.handleRoleDiagnostic({ session: valid, adminEmail: ADMIN, query: q })
  assert.equal(r.status, 403); assert.deepEqual(r.body, { ok: false, error: 'Forbidden' }); assert.equal(q.calls.length, 0)
})

await t('admin authorisation: fails closed when no admin email is configured; email match ignores case and surrounding whitespace only', async () => {
  const q = counting(async () => ({ rows: [{ current_user: 'a', session_user: 'b' }] }))
  for (const adminEmail of [undefined, '']) assert.equal((await d.handleRoleDiagnostic({ session: admin, adminEmail, query: q })).status, 403)
  assert.equal((await d.handleRoleDiagnostic({ session: admin, adminEmail: 'admin@example.test.evil', query: q })).status, 403)
  assert.equal(q.calls.length, 0)
  assert.equal((await d.handleRoleDiagnostic({ session: { ...admin, email: 'admin@example.test' }, adminEmail: '  Admin@Example.TEST ', query: q })).status, 200)
})

await t('success: runs exactly the approved query once and returns only the two role names', async () => {
  const q = counting(async () => ({ rows: [{ current_user: 'postgres', session_user: 'postgres', extra: SECRET }], fields: [], command: 'SELECT' }))
  const r = await d.handleRoleDiagnostic({ session: admin, adminEmail: ADMIN, query: q })
  assert.equal(r.status, 200); assert.deepEqual(r.body, { ok: true, current_user: 'postgres', session_user: 'postgres' })
  assert.deepEqual(q.calls, ['SELECT current_user::text AS current_user, session_user::text AS session_user;'])
  assert.ok(!JSON.stringify(r.body).includes('S3CR3T'))
})

await t('success: differing current_user / session_user are both reported as returned', async () => {
  const r = await d.handleRoleDiagnostic({ session: admin, adminEmail: ADMIN, query: async () => ({ rows: [{ current_user: 'seo_worker', session_user: 'authenticator' }] }) })
  assert.deepEqual(r.body, { ok: true, current_user: 'seo_worker', session_user: 'authenticator' })
})

await t('database failure: fixed message, status 500, driver text / URL / password never returned', async () => {
  const err = Object.assign(new Error(`password authentication failed for user "seo_worker" ${SECRET}`), { code: '28P01', host: 'aws-0-ap-south-1.pooler.supabase.com' })
  const r = await d.handleRoleDiagnostic({ session: admin, adminEmail: ADMIN, query: async () => { throw err } })
  assert.equal(r.status, 500); assert.deepEqual(r.body, { ok: false, error: 'Diagnostic failed' })
  const s = JSON.stringify(r.body); assert.ok(!/S3CR3T|pooler|seo_worker|28P01|password/i.test(s))
})

await t('not configured: 503 with a fixed message', async () => {
  const r = await d.handleRoleDiagnostic({ session: admin, adminEmail: ADMIN, query: async () => { throw new SeoDbNotConfiguredError() } })
  assert.equal(r.status, 503); assert.deepEqual(r.body, { ok: false, error: 'SEO database is not configured' })
})

await t('malformed results fail closed: zero rows, several rows, non-string, empty or oversized values', async () => {
  for (const rows of [[], [{ current_user: 'a', session_user: 'b' }, { current_user: 'a', session_user: 'b' }], [{ current_user: 1, session_user: 'b' }], [{ current_user: '', session_user: 'b' }], [{ current_user: 'a', session_user: 'x'.repeat(64) }], [{}]]) {
    const r = await d.handleRoleDiagnostic({ session: admin, adminEmail: ADMIN, query: async () => ({ rows }) })
    assert.equal(r.status, 500); assert.deepEqual(r.body, { ok: false, error: 'Diagnostic failed' })
  }
})

await t('static: exact approved query appears once; no logging, one environment read (SEO_ADMIN_EMAIL, route only), no writes, no site-creating wrapper', async () => {
  const lib = read('lib/seo-command/role-diagnostic.ts'), route = read('app/api/admin/seo/role-diagnostic/route.ts')
  assert.equal(d.ROLE_DIAGNOSTIC_SQL, 'SELECT current_user::text AS current_user, session_user::text AS session_user;')
  assert.equal(lib.split("'SELECT current_user::text").length - 1, 1)
  for (const [name, src] of [['lib', lib], ['route', route]]) {
    assert.ok(!/console\./.test(src), `${name}: no logging`)
    assert.deepEqual(src.match(/process\.env[.\w]*/g) ?? [], name === 'route' ? ['process.env.SEO_ADMIN_EMAIL'] : [], `${name}: the only environment read is SEO_ADMIN_EMAIL, in the route`)
    assert.ok(!/\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|GRANT|REVOKE|CREATE|DROP)\b/.test(src.replace(/\/\*\*[\s\S]*?\*\//g, '')), `${name}: no write/DDL statements`)
  }
  assert.ok(!/seoApi|getOrCreateSiteId|withSeoTx/.test(lib + route.replace(/\/\*\*[\s\S]*?\*\//g, '')), 'does not use the wrapper that can write')
  assert.match(route, /verifySeoSession\(cookies\(\)\.get\(SEO_SESSION_COOKIE\)\?\.value\)/); assert.match(route, /export async function GET/); assert.ok(!/export async function (POST|PUT|PATCH|DELETE)/.test(route))
  assert.match(route, /cache-control.*no-store/)
})

console.log(`\n${n} tests passed`)
