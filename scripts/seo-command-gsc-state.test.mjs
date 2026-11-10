// OAuth state, admin binding, key handling and token lifecycle. Unit parts always run; DB parts need a throwaway local
// Postgres in SEO_TEST_DATABASE_URL with db/seo 0001-0003 applied. Never run against a shared database.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import pg from 'pg'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const g = jiti('../lib/seo-command/gsc-oauth.ts')
const s = jiti('../lib/seo-command/gsc-state.ts')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const SECRET = 'seo-secret-seo-secret-seo-secret-0123456789'
const k = () => randomBytes(32).toString('base64')
const env = { SEO_SESSION_SECRET: SECRET, NODE_ENV: 'production', GSC_TOKEN_ENCRYPTION_KEY: k() }

// ── unit: keyed HMAC admin binding ─────────────────────────────────────────
await t('admin binding is a keyed HMAC: normalised, deterministic, depends on the secret, not a plain hash', () => {
  const a = g.adminBinding('Owner@Tapis.test ', env)
  assert.equal(a, g.adminBinding('owner@tapis.test', env))
  assert.notEqual(a, g.adminBinding('other@tapis.test', env))
  assert.notEqual(a, g.hashState('owner@tapis.test'), 'must not equal an unkeyed SHA-256 of the email')
  assert.notEqual(a, g.adminBinding('owner@tapis.test', { ...env, SEO_SESSION_SECRET: 'different-secret-different-secret-0123456789' }))
  assert.throws(() => g.adminBinding('x', { ...env, SEO_SESSION_SECRET: 'short' }))
  assert.ok(g.safeEqualHex(a, a) && !g.safeEqualHex(a, g.adminBinding('z@t.test', env)) && !g.safeEqualHex(a, 'zz') && !g.safeEqualHex('', ''))
})

await t('flow cookie carries the keyed admin binding', async () => {
  const st = g.newState()
  const c = await g.signFlowCookie(st, 'Owner@Tapis.test', { env })
  const claims = await g.verifyFlowCookie(c, st, { env })
  assert.equal(claims.adminHash, g.adminBinding('owner@tapis.test', env))
})

// ── unit: key versions, wrong key, tamper ──────────────────────────────────
await t('wrong key and tampered ciphertext never decrypt and never throw', () => {
  const a = g.sealSecret('1//refresh-token', env)
  assert.equal(g.openSecret(a, env), '1//refresh-token')
  assert.equal(g.openSecret(a, { ...env, GSC_TOKEN_ENCRYPTION_KEY: k() }), null, 'wrong key')
  for (let i = 0; i < a.cipher.length; i++) { const c = Buffer.from(a.cipher); c[i] ^= 1; assert.equal(g.openSecret({ ...a, cipher: c }, env), null, 'cipher byte ' + i) }
  for (let i = 0; i < 16; i++) { const tg = Buffer.from(a.tag); tg[i] ^= 1; assert.equal(g.openSecret({ ...a, tag: tg }, env), null, 'tag byte ' + i) }
  assert.equal(g.openSecret({ ...a, iv: randomBytes(12) }, env), null)
})

await t('key rotation: versions pick the right key; no silent substitution; reseal fails closed', () => {
  const old = k(), neu = k()
  const v1 = g.sealSecret('tok', { ...env, GSC_TOKEN_ENCRYPTION_KEY: old, GSC_TOKEN_KEY_VERSION: '1' })
  assert.equal(v1.keyVersion, 1)
  // key replaced WITHOUT keeping the old one: cannot open, even though a (wrong) current key exists
  const replaced = { ...env, GSC_TOKEN_ENCRYPTION_KEY: neu, GSC_TOKEN_KEY_VERSION: '1' }
  assert.equal(g.openSecret(v1, replaced), null, 'same version number, different key')
  assert.equal(g.resealSecret(v1, replaced), null)
  // bumped version without the previous key: the v1 token has no key
  const bumped = { ...env, GSC_TOKEN_ENCRYPTION_KEY: neu, GSC_TOKEN_KEY_VERSION: '2' }
  assert.equal(g.openSecret(v1, bumped), null, 'v1 token must not be tried against the v2 key')
  // proper rotation
  const rot = { ...bumped, GSC_TOKEN_ENCRYPTION_KEY_PREVIOUS: old, GSC_TOKEN_KEY_PREVIOUS_VERSION: '1' }
  assert.equal(g.openSecret(v1, rot), 'tok')
  const v2 = g.resealSecret(v1, rot)
  assert.equal(v2.keyVersion, 2)
  assert.equal(g.openSecret(v2, bumped), 'tok', 'after reseal the previous key is no longer needed')
  // previous slot with the same version as current is ignored
  assert.equal(g.keyForVersion(2, { ...rot, GSC_TOKEN_KEY_PREVIOUS_VERSION: '2' })?.equals(Buffer.from(neu, 'base64')), true)
})

await t('token error mapping: invalid_grant means reconnect; client errors do not', () => {
  assert.equal(g.stateForTokenError('invalid_grant').state, 'RECONNECT_REQUIRED')
  assert.equal(g.stateForTokenError('invalid_client').state, 'ERROR')
  assert.equal(g.stateForTokenError(undefined).state, 'ERROR')
  assert.equal(s.canSync('CONNECTED'), true)
  for (const x of ['DISCONNECTED', 'RECONNECT_REQUIRED', 'KEY_UNAVAILABLE', 'ERROR']) assert.equal(s.canSync(x), false)
})

await t('consume SQL checks usedAt IS NULL and expiresAt > now in ONE atomic UPDATE, on the DB UTC clock', () => {
  const sql = s.CONSUME_SQL.replace(/\s+/g, ' ')
  assert.match(sql, /^UPDATE seo_oauth_states SET "usedAt" = timezone\('utc', now\(\)\) WHERE "stateHash" = \$1 AND "usedAt" IS NULL AND "expiresAt" > timezone\('utc', now\(\)\) RETURNING/)
  assert.ok(!/SELECT .* FROM seo_oauth_states/i.test(sql), 'no read-then-write')
})

// ── integration ─────────────────────────────────────────────────────────────
const url = process.env.SEO_TEST_DATABASE_URL
if (!url) {
  console.log(`SKIP db parts of seo-command-gsc-state tests: SEO_TEST_DATABASE_URL not set (${n} unit tests passed)`)
  process.exit(0)
}
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) throw new Error('refusing to run DB tests against a non-local database')
const pool = new pg.Pool({ connectionString: url, max: 8 })
const q = async (text, params) => (await pool.query(text, params)).rows
await q('TRUNCATE seo_oauth_states, seo_oauth_connections, seo_sites CASCADE')
const A = 'owner@tapis.test', B = 'intruder@tapis.test'
const start = async (admin = A) => { const state = g.newState(), verifier = g.newCodeVerifier(); await s.createOAuthState(q, { state, verifier, adminEmail: admin, env }); return { state, verifier } }
const cookieHash = (a) => g.adminBinding(a, env)

await t('db: state stores only hashes and encrypted verifier (no raw state/verifier/email)', async () => {
  const { state, verifier } = await start()
  const [row] = await q(`SELECT * FROM seo_oauth_states WHERE "stateHash"=$1`, [g.hashState(state)])
  const dump = JSON.stringify(row)
  assert.ok(row && !dump.includes(state) && !dump.includes(verifier) && !dump.includes(A))
  assert.equal(row.adminHash, g.adminBinding(A, env))
  const [d] = await q(`SELECT extract(epoch FROM ("expiresAt" - timezone('utc', now()))) AS secs FROM seo_oauth_states WHERE "stateHash"=$1`, [g.hashState(state)])
  assert.ok(d.secs > 540 && d.secs <= 600, 'expires ~10 minutes ahead on the DB UTC clock, got ' + d.secs)
})

await t('db: valid state is consumed once and returns the verifier', async () => {
  const { state, verifier } = await start()
  const r = await s.consumeOAuthState(q, { state, adminHashFromCookie: cookieHash(A), env })
  assert.deepEqual(r, { ok: true, verifier })
})

await t('db: REPLAYED state is rejected', async () => {
  const { state } = await start()
  assert.equal((await s.consumeOAuthState(q, { state, adminHashFromCookie: cookieHash(A), env })).ok, true)
  const again = await s.consumeOAuthState(q, { state, adminHashFromCookie: cookieHash(A), env })
  assert.deepEqual(again, { ok: false, reason: 'invalid_or_expired_or_replayed' })
})

await t('db: EXPIRED state is rejected and stays unused', async () => {
  const { state } = await start()
  await q(`UPDATE seo_oauth_states SET "expiresAt" = timezone('utc', now()) - interval '1 second' WHERE "stateHash"=$1`, [g.hashState(state)])
  const r = await s.consumeOAuthState(q, { state, adminHashFromCookie: cookieHash(A), env })
  assert.deepEqual(r, { ok: false, reason: 'invalid_or_expired_or_replayed' })
  assert.equal((await q(`SELECT "usedAt" FROM seo_oauth_states WHERE "stateHash"=$1`, [g.hashState(state)]))[0].usedAt, null)
})

await t('db: unknown state is indistinguishable from expired/replayed', async () => {
  const r = await s.consumeOAuthState(q, { state: g.newState(), adminHashFromCookie: cookieHash(A), env })
  assert.deepEqual(r, { ok: false, reason: 'invalid_or_expired_or_replayed' })
})

await t('db: MISMATCHED admin identity is rejected and the state is burned (cannot be retried by the right admin)', async () => {
  const { state } = await start(A)
  const r = await s.consumeOAuthState(q, { state, adminHashFromCookie: cookieHash(B), env })
  assert.deepEqual(r, { ok: false, reason: 'admin_mismatch' })
  const retry = await s.consumeOAuthState(q, { state, adminHashFromCookie: cookieHash(A), env })
  assert.equal(retry.ok, false)
  assert.equal((await s.consumeOAuthState(q, { state, adminHashFromCookie: 'not-hex', env })).ok, false)
})

await t('db: 20 concurrent callbacks with the same state -> exactly ONE success', async () => {
  const { state } = await start()
  const res = await Promise.all(Array.from({ length: 20 }, () => s.consumeOAuthState(q, { state, adminHashFromCookie: cookieHash(A), env })))
  assert.equal(res.filter((r) => r.ok).length, 1)
})

await t('db: verifier encrypted with a different key cannot be read (fails closed)', async () => {
  const { state } = await start()
  const r = await s.consumeOAuthState(q, { state, adminHashFromCookie: cookieHash(A), env: { ...env, GSC_TOKEN_ENCRYPTION_KEY: k() } })
  assert.deepEqual(r, { ok: false, reason: 'verifier_unreadable' })
})

// ── token lifecycle ─────────────────────────────────────────────────────────
const SITE = 'site-1'
await q(`INSERT INTO seo_sites ("id","domain","baseUrl","updatedAt") VALUES ($1,'tapisglobalinternational.com','https://tapisglobalinternational.com', now())`, [SITE])
const putConn = async (e = env, token = '1//refresh') => {
  const v = g.sealSecret(token, e)
  await q(`DELETE FROM seo_oauth_connections WHERE "siteId"=$1`, [SITE])
  await q(`INSERT INTO seo_oauth_connections ("id","siteId","provider","state","refreshTokenCipher","refreshTokenIv","refreshTokenTag","keyVersion","updatedAt") VALUES (gen_random_uuid()::text,$1,'GSC','CONNECTED',$2,$3,$4,$5,now())`, [SITE, v.cipher, v.iv, v.tag, v.keyVersion])
}

await t('db: connected token loads; ciphertext at rest does not contain the token', async () => {
  await putConn()
  const raw = JSON.stringify(await q(`SELECT * FROM seo_oauth_connections WHERE "siteId"=$1`, [SITE]))
  assert.ok(!raw.includes('1//refresh'))
  assert.deepEqual(await s.loadRefreshToken(q, SITE, env), { kind: 'token', refreshToken: '1//refresh' })
})

await t('db: wrong key -> KEY_UNAVAILABLE, ciphertext untouched, recoverable with the right key', async () => {
  await putConn()
  const before = JSON.stringify(await q(`SELECT "refreshTokenCipher","refreshTokenIv","refreshTokenTag","keyVersion" FROM seo_oauth_connections WHERE "siteId"=$1`, [SITE]))
  const r = await s.loadRefreshToken(q, SITE, { ...env, GSC_TOKEN_ENCRYPTION_KEY: k() })
  assert.deepEqual(r, { kind: 'key_unavailable' })
  const [row] = await q(`SELECT "state","lastErrorCode","revokedAt" FROM seo_oauth_connections WHERE "siteId"=$1`, [SITE])
  assert.deepEqual([row.state, row.lastErrorCode, row.revokedAt], ['KEY_UNAVAILABLE', 'key_unavailable', null])
  assert.equal(JSON.stringify(await q(`SELECT "refreshTokenCipher","refreshTokenIv","refreshTokenTag","keyVersion" FROM seo_oauth_connections WHERE "siteId"=$1`, [SITE])), before, 'ciphertext must not change')
  // syncs stay blocked while the row is KEY_UNAVAILABLE; the right key plus an admin re-mark restores it
  await q(`UPDATE seo_oauth_connections SET "state"='CONNECTED',"lastErrorCode"=NULL WHERE "siteId"=$1`, [SITE])
  assert.deepEqual(await s.loadRefreshToken(q, SITE, env), { kind: 'token', refreshToken: '1//refresh' })
})

await t('db: tampered ciphertext -> KEY_UNAVAILABLE, never treated as revoked, never deleted', async () => {
  await putConn()
  await q(`UPDATE seo_oauth_connections SET "refreshTokenCipher" = set_byte("refreshTokenCipher", 0, get_byte("refreshTokenCipher",0) # 1) WHERE "siteId"=$1`, [SITE])
  assert.deepEqual(await s.loadRefreshToken(q, SITE, env), { kind: 'key_unavailable' })
  const [row] = await q(`SELECT "state","revokedAt","refreshTokenCipher" FROM seo_oauth_connections WHERE "siteId"=$1`, [SITE])
  assert.equal(row.state, 'KEY_UNAVAILABLE'); assert.equal(row.revokedAt, null); assert.ok(row.refreshTokenCipher)
})

await t('db: Google invalid_grant -> RECONNECT_REQUIRED and no further token use', async () => {
  await putConn()
  assert.equal(await s.recordTokenError(q, SITE, 'invalid_grant'), 'RECONNECT_REQUIRED')
  assert.deepEqual(await s.loadRefreshToken(q, SITE, env), { kind: 'none', state: 'RECONNECT_REQUIRED' })
})

await t('db: REVOKED token (disconnect) wipes ciphertext, blocks sync, keeps no secret', async () => {
  await putConn()
  await s.recordRevoked(q, SITE)
  const [row] = await q(`SELECT * FROM seo_oauth_connections WHERE "siteId"=$1`, [SITE])
  assert.equal(row.state, 'DISCONNECTED'); assert.ok(row.revokedAt)
  assert.deepEqual([row.refreshTokenCipher, row.refreshTokenIv, row.refreshTokenTag], [null, null, null])
  assert.deepEqual(await s.loadRefreshToken(q, SITE, env), { kind: 'none', state: 'DISCONNECTED' })
  assert.deepEqual(await s.loadRefreshToken(q, 'no-such-site', env), { kind: 'none', state: 'DISCONNECTED' })
})

// ── privileges (real SQL roles on the scratch DB) ───────────────────────────
const asWorker = async (sqlText) => { const c = await pool.connect(); try { await c.query('BEGIN'); await c.query('SET LOCAL ROLE seo_worker'); try { await c.query(sqlText); return 'ok' } catch (e) { return e.code } finally { await c.query('ROLLBACK') } } finally { c.release() } }
await t('db: seo_worker cannot DELETE sitemap/sync-run rows, cannot read states, cannot touch ciphertext or delete connections', async () => {
  assert.equal(await asWorker('DELETE FROM seo_sitemap_status'), '42501')
  assert.equal(await asWorker('DELETE FROM seo_gsc_sync_runs'), '42501')
  assert.equal(await asWorker('SELECT * FROM seo_oauth_states'), '42501')
  assert.equal(await asWorker('DELETE FROM seo_oauth_connections'), '42501')
  assert.equal(await asWorker(`UPDATE seo_oauth_connections SET "refreshTokenCipher"=NULL`), '42501')
  assert.equal(await asWorker(`UPDATE seo_oauth_connections SET "state"='ERROR'`), 'ok')
  assert.equal(await asWorker('SELECT count(*) FROM seo_sitemap_status'), 'ok')
})

await pool.end()
console.log(`${n} gsc-state tests passed`)
