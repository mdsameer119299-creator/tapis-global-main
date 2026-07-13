// scripts/phase-fixes.test.mjs
// Tests for the PR #9 follow-up: consent gating, server-side lead score,
// attribution normalization, event rename, and the modular knowledge system.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import assert from 'assert'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

// ── Event rename: catalogue_delivery_* -> catalogue_request_* ─────────────────
{
  const { EVENTS } = jiti('../lib/analytics.ts')
  ok('event renamed to catalogue_request_success', EVENTS.catalogueRequestSuccess === 'catalogue_request_success')
  ok('event renamed to catalogue_request_failure', EVENTS.catalogueRequestFailure === 'catalogue_request_failure')
  ok('old catalogue_delivery_* keys removed', !('catalogueDeliverySuccess' in EVENTS) && !('catalogueDeliveryFailure' in EVENTS))
  ok('no event value still says delivery', !Object.values(EVENTS).some((v) => v === 'catalogue_delivery_success' || v === 'catalogue_delivery_failure'))
}

// ── Server-side scoring never trusts the client ──────────────────────────────
{
  const { scoreLeadFromFields } = jiti('../lib/lead-scoring.ts')
  const hot = scoreLeadFromFields('catalogue', { email: 'buyer@studio.co', company: 'Studio', buyerType: 'Architect', catalogueRequested: 'yes', leadScore: '999', leadTemperature: 'hot' })
  ok('server recomputes score independent of client leadScore', hot.score !== 999 && typeof hot.score === 'number')
  ok('server score classifies temperature itself', ['hot', 'warm', 'nurture'].includes(hot.temperature))
  const tara = scoreLeadFromFields('tara', { email: 'x@gmail.com', taraSummary: 'Categories: hand-knotted-carpet | Materials: nz-wool' })
  ok('tara handoff + interests counted server-side', tara.reasons.some((r) => /handoff/i.test(r)) && tara.reasons.some((r) => /category/i.test(r)))
}

// ── Attribution server normalization ─────────────────────────────────────────
{
  const { normalizeAttribution } = jiti('../lib/attribution-server.ts')
  const out = normalizeAttribution({
    utm_source: '  google<script>  ', utm_medium: 'cpc', gclid: 'abc.123-XYZ_9', referrer: 'https://ref.example/path?q=1',
    landing_page: '/india/delhi-ncr', first_touch_at: 'not-a-date', last_touch_at: '2026-07-12T00:00:00Z',
    utm_campaign: 'x'.repeat(500), email: 'buyer@studio.co',
  })
  ok('utm_source trimmed + sanitized', out.utm_source === 'googlescript')
  ok('gclid preserved (safe chars)', out.gclid === 'abc.123-XYZ_9')
  ok('utm_campaign length-capped', out.utm_campaign.length <= 200)
  ok('invalid timestamp dropped', !('first_touch_at' in out))
  ok('valid timestamp normalized to ISO', out.last_touch_at === '2026-07-12T00:00:00.000Z')
  ok('non-attribution field untouched', out.email === 'buyer@studio.co')
}

// ── Consent gate ─────────────────────────────────────────────────────────────
{
  const store = new Map()
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }
  let dispatched = null
  globalThis.CustomEvent = globalThis.CustomEvent || class { constructor(t, o) { this.type = t; this.detail = o && o.detail } }
  globalThis.window = { dispatchEvent: (e) => { dispatched = e } }
  const c = jiti('../lib/consent.ts')
  ok('consent undecided by default', c.readConsent() === null)
  c.setConsent('granted')
  ok('consent stored', c.readConsent() === 'granted')
  ok('consent change broadcast', dispatched && dispatched.type === c.CONSENT_EVENT && dispatched.detail === 'granted')
  c.setConsent('denied')
  ok('consent can be revoked', c.readConsent() === 'denied')

  // Persisted with a timestamp so the 12-month expiry can be enforced.
  const stored = JSON.parse(store.get(c.CONSENT_KEY))
  ok('consent persisted with timestamp', stored && stored.v === 'denied' && typeof stored.t === 'number')
  ok('consent max age is 12 months', c.CONSENT_MAX_AGE_DAYS === 365)

  const DAY = 24 * 60 * 60 * 1000
  // Returning visitor within 12 months — read automatically, not re-asked.
  store.set(c.CONSENT_KEY, JSON.stringify({ v: 'granted', t: Date.now() - 300 * DAY }))
  ok('recent decision honoured on load (no re-ask)', c.readConsent() === 'granted')

  // Older than 12 months — record lapses and is cleared, so we ask again.
  store.set(c.CONSENT_KEY, JSON.stringify({ v: 'granted', t: Date.now() - 366 * DAY }))
  ok('expired decision returns null', c.readConsent() === null)
  ok('expired decision cleared from storage', !store.has(c.CONSENT_KEY))

  // Legacy plain-string records (pre-expiry format) remain valid.
  store.set(c.CONSENT_KEY, 'granted')
  ok('legacy plain-string consent still honoured', c.readConsent() === 'granted')

  delete globalThis.window; delete globalThis.localStorage; delete globalThis.CustomEvent
}

// ── Modular knowledge system ─────────────────────────────────────────────────
{
  const kb = jiti('../lib/tara/knowledge.ts') // barrel still works
  ok('backward-compatible exports present', Array.isArray(kb.TARA_CATEGORIES) && Array.isArray(kb.TARA_MATERIALS) && typeof kb.needsHandoff === 'function' && typeof kb.retrieveContext === 'function' && typeof kb.TARA_SYSTEM_PROMPT === 'string')
  ok('materials expanded (>=14 fibres inc. NZ wool, PET, Tencel)', kb.TARA_MATERIALS.length >= 14 && kb.TARA_MATERIALS.some((m) => m.id === 'nz-wool') && kb.TARA_MATERIALS.some((m) => m.id === 'pet') && kb.TARA_MATERIALS.some((m) => m.id === 'tencel'))
  ok('materials carry structured fields', kb.TARA_MATERIALS.every((m) => Array.isArray(m.properties) && m.maintenance && m.priceFactors))
  ok('constructions include machine-made + outdoor + pile types', kb.TARA_CONSTRUCTIONS.some((c) => c.id === 'machine-made') && kb.TARA_CONSTRUCTIONS.some((c) => c.id === 'outdoor'))
  ok('manufacturing steps present', Array.isArray(kb.TARA_MANUFACTURING_STEPS) && kb.TARA_MANUFACTURING_STEPS.length >= 12)
  ok('glossary present', Array.isArray(kb.TARA_GLOSSARY) && kb.TARA_GLOSSARY.some((g) => /knot density/i.test(g.term)))
  ok('faqs present', Array.isArray(kb.TARA_FAQS) && kb.TARA_FAQS.length >= 8)
  ok('care tips present', Array.isArray(kb.TARA_CARE) && kb.TARA_CARE.length >= 6)
  ok('bhadohi + history modules present', Array.isArray(kb.BHADOHI_MODULE) && Array.isArray(kb.HISTORY_MODULE))
  ok('module registry lists modules', Array.isArray(kb.TARA_KNOWLEDGE_MODULES) && kb.TARA_KNOWLEDGE_MODULES.includes('materials'))
  // Retrieval searches the whole corpus, not one prompt.
  ok('retrieval finds material info', /wool/i.test(kb.retrieveContext('new zealand wool for a hotel lobby')))
  ok('retrieval finds Bhadohi info', /bhadohi/i.test(kb.retrieveContext('what is the history of bhadohi carpets')))
  ok('retrieval finds manufacturing info', /(dye|weav|spin|finish)/i.test(kb.retrieveContext('how are carpets manufactured')))
  ok('searchKnowledge returns ranked docs', Array.isArray(kb.searchKnowledge('viscose care')) && kb.searchKnowledge('viscose care').length > 0)
  // Personality
  ok('consultant persona + greeting present', /consultant/i.test(kb.TARA_PERSONA) && /TAPIS GLOBAL/.test(kb.TARA_GREETING))
}

// ── Knowledge Centre schema/registry (architecture only) ─────────────────────
{
  const reg = jiti('../lib/knowledge/registry.ts')
  ok('13 scalable knowledge categories defined', reg.KNOWLEDGE_CATEGORIES.length === 13)
  ok('categories include materials/manufacturing/carpet-history/glossary', ['materials', 'manufacturing', 'carpet-history', 'glossary'].every((s) => reg.KNOWLEDGE_CATEGORIES.some((c) => c.slug === s)))
  ok('article store empty in phase 1 (architecture only)', reg.KNOWLEDGE_ARTICLES.length === 0)
  ok('registry helpers work', typeof reg.getAllKnowledgeArticleSlugs === 'function' && reg.getAllKnowledgeArticleSlugs().length === 0 && reg.getKnowledgeCategory('materials'))
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
