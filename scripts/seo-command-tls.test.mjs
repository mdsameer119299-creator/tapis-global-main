// Strict database TLS: unit tests (always) + real-handshake tests against a TLS-enabled scratch Postgres (when SEO_TLS_FIXTURE_DIR and SEO_TLS_PG_PORT are set).
// Fixture dir holds ca.pem (signs the server cert, SAN DNS:localhost) and ca2.pem (unrelated CA). Local scratch servers only. Nothing here reaches Supabase.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { readFileSync, readdirSync, mkdtempSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const T = jiti('../lib/seo-command/db-tls.ts'); const { Pool } = require('pg')
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8')
let passed = 0, failed = 0
const t = async (name, fn) => { try { await fn(); passed++; console.log('ok -', name) } catch (e) { failed++; console.log('FAIL -', name, '\n  ', e.message) } }

// ---- fixtures for the unit tests
const d = mkdtempSync('/tmp/tlsunit-'); const sh = (c) => execSync(c, { cwd: d, stdio: 'pipe' })
sh('openssl req -x509 -newkey rsa:2048 -nodes -keyout a.key -out a.pem -subj /CN=A -days 30 2>/dev/null'); sh('openssl req -x509 -newkey rsa:2048 -nodes -keyout b.key -out b.pem -subj /CN=B -days 30 2>/dev/null')
sh('openssl req -x509 -newkey rsa:2048 -nodes -keyout old.key -out old.pem -subj /CN=Old -days 1 2>/dev/null')
const A = readFileSync(d + '/a.pem', 'utf8'), B = readFileSync(d + '/b.pem', 'utf8'), OLD = readFileSync(d + '/old.pem', 'utf8')
const fpA = T.fingerprintOf(A), fpB = T.fingerprintOf(B)

await t('STATIC: no rejectUnauthorized:false and no ssl "unverified/legacy" escape anywhere in lib/ or app/ (comments excluded)', () => {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (e.name === 'node_modules' ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)])
  for (const f of [...walk(path.join(ROOT, 'lib')), ...walk(path.join(ROOT, 'app'))].filter((x) => /\.(ts|tsx|js|mjs)$/.test(x))) {
    const code = readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    assert.ok(!/rejectUnauthorized\s*:\s*false/.test(code), f); assert.ok(!/NODE_TLS_REJECT_UNAUTHORIZED/.test(code), f)
  }
})
await t('STATIC: both pools (db.ts, import-db.ts) take their ssl option from buildSeoTlsOptions', () => {
  for (const f of ['lib/seo-command/db.ts', 'lib/seo-command/import-db.ts']) { assert.ok(/ssl:\s*buildSeoTlsOptions\(local(, env)?\)/.test(read(f)), f); assert.ok(/const local = isLocalDbUrl\(url\)/.test(read(f)), f + ' must use the parsed-host check') }
})
await t('isLocalDbUrl: only a loopback HOST is local; "@localhost/" smuggled into the query/path/userinfo never disables TLS', () => {
  for (const u of ['postgres://u:p@localhost:5432/db', 'postgres://u:p@127.0.0.1/db', 'postgres://u:p@[::1]:5432/db']) assert.equal(T.isLocalDbUrl(u), true, u)
  for (const u of ['postgres://u:p@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?x=@localhost/', 'postgres://u:p@db.x.supabase.co/postgres#@127.0.0.1/', 'postgres://localhost:p@db.x.supabase.co/postgres',
                   'postgres://u:p@localhost.evil.com/db', 'postgres://u:p@db.x.supabase.co/@localhost/', 'not a url', '']) assert.equal(T.isLocalDbUrl(u), false, u)
})
await t('local databases: no TLS options', () => assert.equal(T.buildSeoTlsOptions(true, {}), undefined))
await t('fails CLOSED when the CA list or pin list is empty (e.g. if supabase-ca.ts were ever blanked)', () => {
  assert.throws(() => T.validateCaBundle('', [fpA]), /not configured; refusing to connect/)
  assert.throws(() => T.validateCaBundle(A, []), /pin list is empty/)
})
await t('shipped Supabase Root 2021 CA: self-signed CA:TRUE, subject/issuer match, valid to 2031-04-26, SHA-256 equals the independently published 80:70:25:AD:...:CA:FA', () => {
  const { X509Certificate } = require('node:crypto'); const m = jiti('../lib/seo-command/supabase-ca.ts'); const x = new X509Certificate(m.SUPABASE_CA_PEM)
  assert.equal(x.subject, x.issuer); assert.match(x.subject, /CN=Supabase Root 2021 CA/); assert.equal(x.ca, true); assert.ok(x.verify(x.publicKey))
  assert.equal(new Date(x.validTo).toISOString().slice(0, 10), '2031-04-26'); assert.equal(T.fingerprintOf(m.SUPABASE_CA_PEM), '807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA')
  assert.deepEqual(m.SUPABASE_CA_SHA256, ['807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA'])
})
await t('default options (no env override) use the shipped CA with verification on', () => {
  const o = T.buildSeoTlsOptions(false, {}); assert.equal(o.rejectUnauthorized, true); assert.equal(o.ca.length, 1); assert.equal(o.minVersion, 'TLSv1.2')
})
await t('valid pinned CA -> { ca, rejectUnauthorized:true, TLS>=1.2 }', () => {
  const o = T.buildSeoTlsOptions(false, { SEO_DB_CA_PEM: A, SEO_DB_CA_SHA256: fpA }); assert.equal(o.rejectUnauthorized, true); assert.equal(o.minVersion, 'TLSv1.2'); assert.equal(o.ca.length, 1)
})
await t('multi-certificate bundle works when every certificate is pinned; one unpinned certificate rejects the whole bundle', () => {
  assert.equal(T.buildSeoTlsOptions(false, { SEO_DB_CA_PEM: A + '\n' + B, SEO_DB_CA_SHA256: fpA + ',' + fpB }).ca.length, 2)
  assert.throws(() => T.buildSeoTlsOptions(false, { SEO_DB_CA_PEM: A + '\n' + B, SEO_DB_CA_SHA256: fpA }), /pinned fingerprint/)
})
await t('wrong pin, empty pin list, malformed PEM, expired certificate are all rejected', () => {
  assert.throws(() => T.buildSeoTlsOptions(false, { SEO_DB_CA_PEM: A, SEO_DB_CA_SHA256: fpB }), /pinned fingerprint/)
  assert.throws(() => T.buildSeoTlsOptions(false, { SEO_DB_CA_PEM: A, SEO_DB_CA_SHA256: '' }), /pin list is empty/)
  assert.throws(() => T.buildSeoTlsOptions(false, { SEO_DB_CA_PEM: '-----BEGIN CERTIFICATE-----\nAAAA\n-----END CERTIFICATE-----', SEO_DB_CA_SHA256: fpA }), /malformed/)
  assert.throws(() => T.buildSeoTlsOptions(false, { SEO_DB_CA_PEM: OLD, SEO_DB_CA_SHA256: T.fingerprintOf(OLD) }, new Date(Date.now() + 5 * 864e5)), /validity period/)
})
await t('error messages never contain certificate or connection-string material', () => {
  for (const env of [{}, { SEO_DB_CA_PEM: A, SEO_DB_CA_SHA256: fpB }]) { try { T.buildSeoTlsOptions(false, env) } catch (e) { assert.ok(!/BEGIN|postgres:\/\//.test(e.message)) } }
})

// ---- real handshakes against the TLS scratch Postgres
const FX = process.env.SEO_TLS_FIXTURE_DIR, PORT = process.env.SEO_TLS_PG_PORT
if (!FX || !PORT) { console.log('SKIP - live-handshake tests (set SEO_TLS_FIXTURE_DIR and SEO_TLS_PG_PORT)') } else {
  const ca = readFileSync(FX + '/ca.pem', 'utf8'), ca2 = readFileSync(FX + '/ca2.pem', 'utf8')
  const pool = (host, caPem) => new Pool({ host, port: +PORT, user: 'postgres', database: 'postgres', max: 1, connectionTimeoutMillis: 4000,
    ssl: T.buildSeoTlsOptions(false, { SEO_DB_CA_PEM: caPem, SEO_DB_CA_SHA256: T.fingerprintOf(caPem) }) })
  const tryQ = async (p) => { try { const r = await p.query('SELECT 1 AS ok, current_setting(\'ssl\') AS ssl'); return { ok: r.rows[0].ok } } catch (e) { return { err: e.code || e.message } } finally { await p.end().catch(() => {}) } }
  await t('real TLS: correct CA + matching hostname connects and runs SELECT 1', async () => assert.deepEqual(await tryQ(pool('localhost', ca)), { ok: 1 }))
  await t('real TLS: WRONG CA is refused (chain not trusted)', async () => { const r = await tryQ(pool('localhost', ca2)); assert.ok(r.err && !r.ok, JSON.stringify(r)); assert.match(String(r.err), /SELF_SIGNED|UNABLE_TO_VERIFY|self.signed|unable to verify/i) })
  await t('real TLS: WRONG HOSTNAME is refused even with the right CA (127.0.0.1 is not in the certificate)', async () => { const r = await tryQ(pool('127.0.0.1', ca)); assert.ok(r.err && !r.ok, JSON.stringify(r)); assert.match(String(r.err), /ERR_TLS_CERT_ALTNAME_INVALID|altnames|not in the cert/i) })
  await t('real TLS: a plain (non-TLS) client is refused by the server (hostssl only), confirming the test server enforces TLS', async () => {
    const p = new Pool({ host: '127.0.0.1', port: +PORT, user: 'postgres', database: 'postgres', max: 1, connectionTimeoutMillis: 4000, ssl: false }); const r = await tryQ(p); assert.ok(r.err)
  })
}
console.log(`\n${passed} TLS tests passed${failed ? `, ${failed} FAILED` : ''}`); process.exit(failed ? 1 : 0)
