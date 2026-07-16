// scripts/tara-guard.test.mjs
// Regression tests for the PR #9 review fixes:
//   1. GA4 canonical single-dispatch (no gtag + dataLayer double-send)
//   2. TARA layered abuse protection (session cap, burst, oversized, handoff bypass)
//   3. TARA claim-safety (no unsupported performance/commercial wording)
// No test framework: local assertions + direct route handler invocation via jiti.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, readdirSync } from 'fs'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

// ── Task 1: GA4 canonical single-dispatch ────────────────────────────────────
{
  const a = jiti('../lib/analytics.ts')
  let gtagCalls = 0
  const dataLayer = []
  globalThis.window = { gtag: () => { gtagCalls++ }, dataLayer, location: { origin: 'https://x' } }
  a.trackEvent('tara_open', { source: '/x' })
  ok('one trackEvent -> exactly one gtag dispatch', gtagCalls === 1, `(gtag=${gtagCalls})`)
  ok('trackEvent does NOT also push to dataLayer (no double-send)', dataLayer.length === 0, `(dataLayer=${dataLayer.length})`)
  a.trackPageView('/india')
  ok('page_view goes through the single gtag path once', gtagCalls === 2, `(gtag=${gtagCalls})`)
  // PII backstop
  const cleaned = a.sanitizeParams({ buyer_type: 'importer', email: 'a@b.com', phone: '+91 9000000000' })
  ok('PII (email/phone) blocked from events', !('email' in cleaned) && !('phone' in cleaned))
  // Safe when gtag unavailable
  globalThis.window = { dataLayer: [], location: { origin: 'https://x' } }
  let threw = false
  try { a.trackEvent('tara_open', {}) } catch { threw = true }
  ok('analytics safe when gtag unavailable', !threw && globalThis.window.dataLayer.length === 0)
  delete globalThis.window
}

// ── Task 2: guard units ──────────────────────────────────────────────────────
{
  const g = jiti('../lib/tara/guard.ts')
  const sid = g.newSessionId()
  ok('session id is 32-hex', g.isValidSid(sid))
  const tok = g.signCounter(sid, 3)
  ok('signed counter verifies', g.verifyCounter(sid, tok) === 3)
  ok('tampered counter rejected (=>0)', g.verifyCounter(sid, '9.' + tok.split('.')[1]) === 0)
  ok('counter for different sid rejected', g.verifyCounter(g.newSessionId(), tok) === 0)
  ok('decide: handoff intent -> handoff (no AI)', g.decide(true, 0) === 'handoff')
  ok('decide: at AI-turn cap -> quota (no AI)', g.decide(false, g.TARA_LIMITS.maxAiTurnsPerSession()) === 'quota')
  ok('decide: normal -> proceed', g.decide(false, 0) === 'proceed')
  const turns = g.sanitizeTurns([{ role: 'user', content: 'x'.repeat(9999) }, ...Array.from({ length: 50 }, () => ({ role: 'user', content: 'hi' }))])
  ok('sanitizeTurns caps turn count', turns.length <= g.TARA_LIMITS.maxTurns)
  ok('sanitizeTurns caps message chars', turns.every((t) => t.content.length <= g.TARA_LIMITS.maxChars))
  const ck = g.parseCookies('tara_sid=abc; tara_ai=3.mac')
  ok('parseCookies works', ck.tara_sid === 'abc' && ck.tara_ai === '3.mac')
  ok('defaults are safe', g.TARA_LIMITS.maxAiTurnsPerSession() >= 1 && g.TARA_LIMITS.timeoutMs() >= 1000 && g.TARA_LIMITS.maxRequestsPerMinute() >= 1)
}

// ── Task 3: claim-safety of TARA knowledge ───────────────────────────────────
{
  const kb = jiti('../lib/tara/knowledge.ts')
  const blob = [
    ...kb.TARA_CATEGORIES.map((c) => c.blurb),
    ...kb.TARA_MATERIALS.map((m) => `${m.notes} ${m.applications} ${(m.properties || []).join(' ')} ${(m.advantages || []).join(' ')} ${(m.limitations || []).join(' ')} ${m.maintenance || ''}`),
    ...kb.TARA_CONSTRUCTIONS.map((c) => `${c.notes} ${c.detail || ''}`),
  ].join(' ').toLowerCase()
  const banned = ['washable', 'hard-wearing', 'high-traffic', 'fast design turnaround', 'long-lasting', 'sustainable', 'durable', 'durability']
  for (const w of banned) ok(`knowledge avoids unsupported claim: "${w}"`, !blob.includes(w), `found "${w}"`)
  ok('system prompt mandates capability wording', /capability terms only|do not guarantee/i.test(kb.TARA_SYSTEM_PROMPT))
  // Verified company facts retained
  ok('company facts: Delhi office + Bhadohi manufacturing retained', /delhi/i.test(kb.COMPANY_FACTS.locations) && /bhadohi/i.test(kb.COMPANY_FACTS.locations))
  ok('company facts: 3-4 week timeline retained', /3.?4 weeks|3–4 weeks/i.test(kb.COMPANY_FACTS.timeline))
}

// ── Task 2: route behavior (A–J) via direct handler invocation ───────────────
async function routeTests() {
  const g = jiti('../lib/tara/guard.ts')
  const url = 'http://localhost/api/tara'
  const reqOf = (bodyObj, { ip = '10.0.0.1', cookie, raw } = {}) => {
    const headers = { 'content-type': 'application/json', 'x-forwarded-for': ip }
    if (cookie) headers.cookie = cookie
    return new Request(url, { method: 'POST', headers, body: raw !== undefined ? raw : JSON.stringify(bodyObj) })
  }
  const load = () => jiti.import ? jiti('../app/api/tara/route.ts') : jiti('../app/api/tara/route.ts')

  // A. AI unavailable -> guided verified fallback, no provider call. Use a real
  // product question (not a greeting, which has its own dedicated reply path).
  delete process.env.ANTHROPIC_API_KEY
  let { POST } = load()
  let res = await POST(reqOf({ messages: [{ role: 'user', content: 'tell me about wool rugs' }] }))
  let data = await res.json()
  ok('A. no key -> degraded verified fallback (no provider call)', data.available === true && data.degraded === true && typeof data.reply === 'string' && data.reply.length > 0)

  // Enable AI for the rest.
  process.env.ANTHROPIC_API_KEY = 'sk-test-dummy-not-real'
  ;({ POST } = load())

  // B. malformed body -> 400
  res = await POST(reqOf(null, { raw: '{bad json' }))
  ok('B. malformed body -> 400', res.status === 400)
  ok('B. server issues httpOnly session cookie', /HttpOnly/i.test(res.headers.get('set-cookie') || ''))

  // C. empty messages -> 400
  res = await POST(reqOf({ messages: [] }))
  ok('C. empty messages -> 400', res.status === 400)

  // D. oversized request -> 413 before parsing/provider
  res = await POST(reqOf(null, { raw: 'x'.repeat(20000) }))
  ok('D. oversized body -> 413', res.status === 413)

  // E. burst limit -> 429 (handoff content avoids provider on the allowed calls)
  g._resetBurst()
  const max = g.TARA_LIMITS.maxRequestsPerMinute()
  let lastStatus = 200
  for (let i = 0; i < max + 1; i++) {
    res = await POST(reqOf({ messages: [{ role: 'user', content: 'what is the price?' }] }, { ip: '10.9.9.9' }))
    lastStatus = res.status
  }
  ok('E. burst over limit -> 429', lastStatus === 429)

  // F. session AI-turn cap -> quota (no provider call)
  g._resetBurst()
  const sid = g.newSessionId()
  const atCap = g.signCounter(sid, g.TARA_LIMITS.maxAiTurnsPerSession())
  res = await POST(reqOf({ messages: [{ role: 'user', content: 'tell me about wool rugs' }] }, { ip: '10.1.1.1', cookie: `tara_sid=${sid}; tara_ai=${encodeURIComponent(atCap)}` }))
  data = await res.json()
  ok('F. AI-turn cap -> guided quota reply, no provider call', /team can help|team will assist|browsing categories/i.test(data.reply))

  // G. handoff intent -> no provider call. needsHandoff is contact-only now
  // (commercial questions stay conversational), so use an explicit contact request.
  g._resetBurst()
  res = await POST(reqOf({ messages: [{ role: 'user', content: 'can I talk to the team?' }] }, { ip: '10.2.2.2' }))
  data = await res.json()
  ok('G. handoff intent -> handoff reply (no provider call)', data.handoffSuggested === true && /TAPIS GLOBAL team/i.test(data.reply))

  // H + I. provider timeout/error -> safe fallback, no raw error leak
  g._resetBurst()
  process.env.TARA_TIMEOUT_MS = '1'
  ;({ POST } = load())
  res = await POST(reqOf({ messages: [{ role: 'user', content: 'compare wool and viscose' }] }, { ip: '10.3.3.3' }))
  data = await res.json()
  ok('H/I. provider failure/timeout -> safe fallback', data.available === true && data.degraded === true && typeof data.reply === 'string' && data.reply.length > 0)
  ok('H. no raw provider error / key leaked', !/sk-test|x-api-key|anthropic|stack|TypeError/i.test(JSON.stringify(data)))
  delete process.env.TARA_TIMEOUT_MS
  delete process.env.ANTHROPIC_API_KEY

  // J. API key is server-only (never NEXT_PUBLIC, never in client components)
  const provider = readFileSync(resolve(ROOT, 'lib/tara/provider.ts'), 'utf8')
  ok('J. provider reads server-only key', /process\.env\.ANTHROPIC_API_KEY/.test(provider) && !/NEXT_PUBLIC[A-Z_]*ANTHROPIC/.test(provider))
  // Flag actual USAGE (process.env.ANTHROPIC...) in client components, not a
  // mere comment mention.
  let leaked = false
  const scan = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = resolve(dir, e.name); if (e.isDirectory()) scan(p); else if (/\.(tsx|jsx)$/.test(e.name)) { const s = readFileSync(p, 'utf8'); if (/process\.env\.[A-Za-z_]*ANTHROPIC/.test(s) || /process\.env\[[^\]]*ANTHROPIC/.test(s)) leaked = true } } }
  scan(resolve(ROOT, 'components'))
  ok('J. no client component READS ANTHROPIC_API_KEY', leaked === false)
}

await routeTests()
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
