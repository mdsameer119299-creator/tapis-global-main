// scripts/lead-intelligence.test.mjs
// Deterministic tests for analytics privacy, attribution, lead scoring, TARA
// scope/knowledge, catalogue gating & enquiry validation. No test framework.
//   node scripts/lead-intelligence.test.mjs  (npm run test:leads)

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'
import assert from 'assert'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

// ── Analytics: no PII, disabled safely ───────────────────────────────────────
const analytics = jiti('../lib/analytics.ts')
{
  const clean = analytics.sanitizeParams({ buyer_type: 'importer', category: 'hand-knotted-carpet', email: 'a@b.com', phone: '+91 9000000000', note: 'hello' })
  ok('analytics strips email PII', !('email' in clean))
  ok('analytics strips phone PII', !('phone' in clean))
  ok('analytics keeps categorical buyer_type', clean.buyer_type === 'importer')
  ok('analytics keeps category', clean.category === 'hand-knotted-carpet')
  // Server-side (no window) => trackEvent is a no-op and must not throw.
  let threw = false
  try { analytics.trackEvent('tara_open', { source: '/x' }) } catch { threw = true }
  ok('trackEvent no-op on server (no throw, analytics disabled)', !threw)
}

// ── Attribution: first-touch preserved, last-touch updates ───────────────────
{
  const store = new Map()
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }
  globalThis.document = { referrer: 'https://architect-blog.example' }
  globalThis.window = { location: { search: '?utm_source=google&utm_medium=cpc&gclid=abc123', pathname: '/india/delhi-ncr', href: 'https://x/india/delhi-ncr' }, screen: { width: 1, height: 1 } }
  const attr = jiti('../lib/attribution.ts')
  attr.persistAttribution()
  // Second visit, different campaign -> last-touch changes, first-touch stays.
  globalThis.window.location = { search: '?utm_source=newsletter&utm_medium=email', pathname: '/products', href: 'https://x/products' }
  attr.persistAttribution()
  const snap = attr.captureAttribution()
  ok('attribution first-touch landing preserved', snap.landing_page === '/india/delhi-ncr')
  ok('attribution first-touch gclid preserved', snap.gclid === 'abc123')
  ok('attribution last-touch source updated', snap.utm_source === 'newsletter')
  ok('attribution has no fingerprint fields', !('screenSize' in snap) && !('timezone' in snap) && !('device' in snap))
  delete globalThis.window; delete globalThis.document; delete globalThis.localStorage
}

// ── Lead scoring: explainable HOT / WARM / NURTURE ───────────────────────────
{
  const { scoreLead } = jiti('../lib/lead-scoring.ts')
  const hot = scoreLead({ businessEmail: 'buyer@archstudio.com', company: 'Arch Studio', buyerType: 'Architect', productInterests: ['hand-knotted-carpet'], quantity: '200 sqm', requiredTimeline: '6 weeks', quotationRequested: true, handoffRequested: true })
  ok('hot lead classified hot', hot.temperature === 'hot', JSON.stringify(hot))
  ok('hot lead has reasons', hot.reasons.length >= 4)
  const nurture = scoreLead({ businessEmail: 'someone@gmail.com' })
  ok('free-email-only lead is nurture', nurture.temperature === 'nurture', JSON.stringify(nurture))
  const warm = scoreLead({ businessEmail: 'p@studio.co', buyerType: 'Interior Designer', catalogueRequested: true, productInterests: ['area-rugs'] })
  ok('mid-intent lead is warm', warm.temperature === 'warm', JSON.stringify(warm))
}

// ── TARA: verified knowledge, scope/handoff, no invented categories ──────────
{
  const kb = jiti('../lib/tara/knowledge.ts')
  ok('TARA exposes only real product slugs', kb.TARA_CATEGORIES.every((c) => c.slug && c.image && c.image.startsWith('/images/')))
  ok('TARA materials include New Zealand wool', kb.TARA_MATERIALS.some((m) => m.name === 'New Zealand Wool'))
  ok('needsHandoff triggers on price', kb.needsHandoff('what is the price and MOQ?') === true)
  ok('needsHandoff triggers on catalogue', kb.needsHandoff('can I get a catalogue') === true)
  ok('needsHandoff false for ordinary discovery', kb.needsHandoff('tell me about hand knotted wool rugs') === false)
  ok('retrieveContext returns material info', /wool/i.test(kb.retrieveContext('new zealand wool for a hotel')))
  ok('system prompt forbids invented claims', /NEVER state certifications/i.test(kb.TARA_SYSTEM_PROMPT))
  // No fake prices / MOQ / certifications baked into knowledge.
  const blob = JSON.stringify({ c: kb.TARA_CATEGORIES, m: kb.TARA_MATERIALS, f: kb.COMPANY_FACTS })
  ok('knowledge has no hardcoded price', !/\$|₹|\bUSD\b|\bprice\b\s*[:=]/i.test(blob))
  ok('knowledge has no fake certification', !/ISO 9001|OEKO-TEX|GoodWeave/i.test(blob))
}

// ── Enquiry validation (server) requires name + contact ──────────────────────
{
  const v = jiti('../lib/enquiry-validation.ts')
  ok('empty name rejected', Boolean(v.validateFullName('')))
  ok('valid name accepted', !v.validateFullName('Jane Architect'))
  const noContact = v.validateContactChannel('', '')
  ok('missing email+phone rejected', Boolean(noContact.email || noContact.mobile))
}

// ── Catalogue gating: no freely downloadable catalogue in normal UI ──────────
{
  const pdfs = existsSync(resolve(ROOT, 'public')) ? readdirSync(resolve(ROOT, 'public'), { recursive: true }).filter((f) => String(f).toLowerCase().endsWith('.pdf')) : []
  ok('no public catalogue PDF asset exists', pdfs.length === 0, `found: ${pdfs}`)
  // No direct download/href to a catalogue file in components.
  let badLink = false
  const scan = (dir) => { for (const e of readdirSync(dir, { withFileTypes: true })) { const p = resolve(dir, e.name); if (e.isDirectory()) scan(p); else if (/\.(tsx?|jsx?)$/.test(e.name)) { const s = readFileSync(p, 'utf8'); if (/href=["'][^"']*catalog[^"']*\.pdf/i.test(s) || /download[^>]*catalog[^"']*\.pdf/i.test(s)) badLink = true } } }
  scan(resolve(ROOT, 'components')); scan(resolve(ROOT, 'app'))
  ok('no direct catalogue PDF link in UI', badLink === false)
  // Confirmation copy is truthful (does not claim the catalogue was already emailed).
  const cat = readFileSync(resolve(ROOT, 'lib/catalogue.ts'), 'utf8')
  ok('catalogue success copy is truthful', /received/i.test(cat) && !/catalogue will be sent to your email/i.test(cat))
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
