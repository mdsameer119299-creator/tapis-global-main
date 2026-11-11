// Verify-only SMTP check for the dedicated SEO report sender: authorisation, safe output, no send, no database, real nodemailer verify against a local fake SMTP server
// (the fake only stands in for the provider; it records every command so the test can prove MAIL/RCPT/DATA never occur). No network beyond 127.0.0.1.
import assert from 'node:assert/strict'
import net from 'node:net'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })
const v = jiti('../lib/seo-command/smtp-verify.ts')
const sess = jiti('../lib/seo-command/auth-session.ts')
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8')

let n = 0
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name) }
const PASS = 're_SUPER-SECRET-API-KEY-0123456789'
const ENV = { SEO_SMTP_HOST: 'smtp.resend.com', SEO_SMTP_PORT: '465', SEO_SMTP_SECURE: 'true', SEO_SMTP_USER: 'resend', SEO_SMTP_PASS: PASS, SEO_SMTP_FROM: 'seo-reports@reports.tapisglobalinternational.com', SEO_SMTP_FROM_NAME: 'TAPIS GLOBAL SEO Reports', SEO_REPORT_RECIPIENT: 'tapisglobalinternational@gmail.com' }
const ok = { session: { email: 'admin@example.test' }, sameOrigin: true }
const counting = (fn = async () => {}) => { const f = async (cfg) => { f.calls.push(cfg); return fn(cfg) }; f.calls = []; return f }

await t('success: reports connection settings, a boolean for the password and sender, never the password; emailSent is false', async () => {
  const verify = counting()
  const r = await v.handleSmtpVerify({ ...ok, env: ENV, verify })
  assert.equal(r.status, 200); assert.equal(verify.calls.length, 1)
  assert.deepEqual(r.body.smtp, { host: 'smtp.resend.com', port: 465, tlsMode: 'implicit-tls', username: 'resend', passwordConfigured: true })
  assert.equal(r.body.senderMatchesExpected, true); assert.equal(r.body.recipientMatchesExpected, true); assert.equal(r.body.emailSent, false)
  assert.deepEqual(r.body.verify, { attempted: true, ok: true })
  const s = JSON.stringify(r.body); assert.ok(!s.includes(PASS)); assert.ok(!s.includes('re_SUPER')); assert.ok(!/seo-reports@|gmail\.com|SEO_SMTP/.test(s), 'no sender/recipient address or variable value in the response')
})

await t('the sender must match EXACTLY (case, display name, whitespace-only differences do not pass); a mismatch is reported as a boolean only', async () => {
  for (const from of ['SEO-Reports@reports.tapisglobalinternational.com', 'seo-reports@tapisglobalinternational.com', 'noreply@reports.tapisglobalinternational.com']) {
    const r = await v.handleSmtpVerify({ ...ok, env: { ...ENV, SEO_SMTP_FROM: from }, verify: counting() })
    assert.equal(r.body.senderMatchesExpected, false); assert.ok(!JSON.stringify(r.body).includes(from))
  }
  const r = await v.handleSmtpVerify({ ...ok, env: { ...ENV, SEO_SMTP_FROM: '  seo-reports@reports.tapisglobalinternational.com ' }, verify: counting() })
  assert.equal(r.body.senderMatchesExpected, true)
})

await t('authentication failure: sanitised code and numeric SMTP code only; message, command, stack and password never appear', async () => {
  const err = Object.assign(new Error(`535 5.7.8 Authentication failed for ${PASS} at smtp.resend.com`), { code: 'EAUTH', responseCode: 535, command: 'AUTH PLAIN', response: `535 bad credentials ${PASS}` })
  const r = await v.handleSmtpVerify({ ...ok, env: ENV, verify: counting(async () => { throw err }) })
  assert.equal(r.status, 502); assert.equal(r.body.ok, false); assert.deepEqual(r.body.verify, { attempted: true, ok: false, code: 'EAUTH', smtpResponseCode: 535 }); assert.equal(r.body.emailSent, false)
  const s = JSON.stringify(r.body); assert.ok(!s.includes(PASS)); assert.ok(!/Authentication failed|bad credentials|AUTH PLAIN|stack|at smtp/i.test(s))
})

await t('unknown or hostile error shapes become UNKNOWN_ERROR; provider text is never echoed', async () => {
  for (const e of [new Error(`boom ${PASS}`), Object.assign(new Error('x'), { code: `custom ${PASS}` }), 'string error ' + PASS, null, undefined, { code: 123, responseCode: '535' }]) {
    const r = await v.handleSmtpVerify({ ...ok, env: ENV, verify: counting(async () => { throw e }) })
    assert.equal(r.status, 502); assert.equal(r.body.verify.code, 'UNKNOWN_ERROR'); assert.ok(!JSON.stringify(r.body).includes(PASS))
  }
  assert.equal(v.sanitizeVerifyError(Object.assign(new Error('x'), { code: 'ETIMEDOUT' })).code, 'ETIMEDOUT')
  assert.deepEqual(v.sanitizeVerifyError({ code: 'EAUTH', responseCode: 99999 }), { code: 'EAUTH' })
})

await t('a hung connection is cut off by the deadline (EDEADLINE), not left open', async () => {
  const r = await v.handleSmtpVerify({ ...ok, env: ENV, verify: () => new Promise(() => {}), deadlineMs: 30 })
  assert.equal(r.status, 502); assert.equal(r.body.verify.code, 'EDEADLINE')
})

await t('not configured: nothing is attempted, only variable NAMES are listed; the website SMTP_* variables are never used', async () => {
  const verify = counting()
  const legacy = { SMTP_HOST: 'smtp.website.test', SMTP_USER: 'web', SMTP_PASS: 'WEBSITE-PASS', SMTP_FROM: 'web@example.test', SEO_REPORT_RECIPIENT: ENV.SEO_REPORT_RECIPIENT }
  const r = await v.handleSmtpVerify({ ...ok, env: legacy, verify })
  assert.equal(r.status, 503); assert.equal(r.body.configured, false); assert.equal(r.body.verify.attempted, false); assert.equal(verify.calls.length, 0)
  assert.deepEqual(r.body.missing, ['SEO_SMTP_HOST', 'SEO_SMTP_USER', 'SEO_SMTP_PASS', 'SEO_SMTP_FROM']); assert.ok(!JSON.stringify(r.body).includes('WEBSITE-PASS'))
})

await t('unauthorised requests are rejected BEFORE any environment read or connection: no session -> 401, cross-origin -> 403', async () => {
  const verify = counting(); let envTouched = false
  const env = new Proxy({}, { get() { envTouched = true; return undefined } })
  const a = await v.handleSmtpVerify({ session: null, sameOrigin: true, env, verify }); assert.equal(a.status, 401)
  const b = await v.handleSmtpVerify({ session: ok.session, sameOrigin: false, env, verify }); assert.equal(b.status, 403)
  const c = await v.handleSmtpVerify({ session: null, sameOrigin: false, env, verify }); assert.equal(c.status, 401)
  assert.equal(verify.calls.length, 0); assert.equal(envTouched, false)
  assert.equal(await sess.verifySeoSession(undefined, {}), null); assert.equal(await sess.verifySeoSession('not-a-token', { SEO_SESSION_SECRET: 'x'.repeat(40) }), null)
})

await t('static: POST only, session + same-origin guard, no database, no pipeline, no sendMail anywhere in the verify path', () => {
  const route = read('app/api/admin/seo/smtp-verify/route.ts'), lib = read('lib/seo-command/smtp-verify.ts')
  assert.deepEqual([...route.matchAll(/export (?:async )?(?:function|const) (\w+)/g)].map((m) => m[1]).filter((x) => !['dynamic', 'maxDuration'].includes(x)), ['POST'])
  assert.match(route, /verifySeoSession\(cookies\(\)\.get\(SEO_SESSION_COOKIE\)\?\.value\)/); assert.match(route, /originMatchesHost\(headers\(\)\)/); assert.ok(route.indexOf('verifySeoSession') < route.indexOf('handleSmtpVerify'))
  for (const [name, src] of [['route', route], ['lib', lib]]) {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    for (const bad of ['sendMail', 'deliverReport', 'smtpSend', 'runDailyPipeline', 'seoQuery', 'withSeoTx', 'seo_reports', 'seo_sites', 'getOrCreateSiteId', 'seo-command/store', "'./store'", 'INSERT', 'UPDATE', 'process.env.SMTP', 'console.log', '.stack']) assert.ok(!code.includes(bad), `${name} must not reference ${bad}`)
  }
  assert.match(lib, /t\.verify\(\)/); assert.match(lib, /smtpTransportOptions\(cfg\)/)
  assert.match(read('lib/seo-command/report-delivery.ts'), /nodemailer\.createTransport\(smtpTransportOptions\(cfg\)\)/)
})

// ---- real nodemailer verify() against a local fake SMTP server that records commands
function fakeSmtp(authOk) {
  const cmds = []
  const server = net.createServer((sock) => {
    sock.write('220 fake ESMTP\r\n'); let buf = '', step = ''
    sock.on('data', (d) => {
      buf += d.toString()
      let i; while ((i = buf.indexOf('\r\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 2)
        if (step === 'user') { step = 'pass'; sock.write('334 UGFzc3dvcmQ6\r\n'); continue }
        if (step === 'pass') { step = ''; sock.write(authOk ? '235 ok\r\n' : '535 5.7.8 rejected\r\n'); continue }
        const verb = line.split(' ')[0].toUpperCase(); cmds.push(verb)
        if (verb === 'EHLO' || verb === 'HELO') sock.write('250-fake\r\n250-AUTH PLAIN LOGIN\r\n250 8BITMIME\r\n')
        else if (verb === 'AUTH') { if (/^AUTH LOGIN\s*$/i.test(line)) { step = 'user'; sock.write('334 VXNlcm5hbWU6\r\n') } else sock.write(authOk ? '235 ok\r\n' : '535 5.7.8 rejected\r\n') }
        else if (verb === 'QUIT') { sock.write('221 bye\r\n'); sock.end() }
        else if (verb === 'NOOP' || verb === 'RSET') sock.write('250 ok\r\n')
        else sock.write('502 not implemented\r\n')
      }
    })
    sock.on('error', () => {})
  })
  return new Promise((res) => server.listen(0, '127.0.0.1', () => res({ cmds, port: server.address().port, close: () => new Promise((r) => server.close(r)) })))
}
const local = (port) => ({ ...ENV, SEO_SMTP_HOST: '127.0.0.1', SEO_SMTP_PORT: String(port), SEO_SMTP_SECURE: 'false' })

await t('real nodemailer verify: a REJECTED login is reported as EAUTH/535 and the server never sees MAIL, RCPT or DATA', async () => {
  const s = await fakeSmtp(false)
  try {
    const r = await v.handleSmtpVerify({ ...ok, env: local(s.port) })
    assert.equal(r.status, 502); assert.deepEqual(r.body.verify, { attempted: true, ok: false, code: 'EAUTH', smtpResponseCode: 535 })
    assert.ok(s.cmds.some((c) => c === 'AUTH'), 'authentication was really attempted')
    for (const bad of ['MAIL', 'RCPT', 'DATA']) assert.ok(!s.cmds.includes(bad), `server saw ${bad}`)
    assert.ok(!JSON.stringify(r.body).includes(PASS))
  } finally { await s.close() }
})

await t('real nodemailer verify: an ACCEPTED login succeeds and the server still never sees MAIL, RCPT or DATA', async () => {
  const s = await fakeSmtp(true)
  try {
    const r = await v.handleSmtpVerify({ ...ok, env: local(s.port) })
    assert.equal(r.status, 200); assert.deepEqual(r.body.verify, { attempted: true, ok: true }); assert.equal(r.body.emailSent, false)
    for (const bad of ['MAIL', 'RCPT', 'DATA']) assert.ok(!s.cmds.includes(bad), `server saw ${bad}`)
  } finally { await s.close() }
})

await t('real nodemailer verify: connection refused is reported with a sanitised code', async () => {
  const s = await fakeSmtp(true); const port = s.port; await s.close()
  const r = await v.handleSmtpVerify({ ...ok, env: local(port) })
  assert.equal(r.status, 502); assert.equal(r.body.verify.ok, false); assert.match(r.body.verify.code, /^(ECONNECTION|ECONNREFUSED|ESOCKET|UNKNOWN_ERROR)$/); assert.ok(!JSON.stringify(r.body).includes('127.0.0.1:'))
})

console.log(`\n${n} SEO SMTP verify-only tests passed`)
