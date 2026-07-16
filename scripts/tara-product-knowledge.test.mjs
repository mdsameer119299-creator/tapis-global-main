// scripts/tara-product-knowledge.test.mjs
// Regression tests for the Product Knowledge Engine: structured material/
// construction profiles, material & construction recommendation, product
// comparison, wrong-spelling tolerance, follow-up memory and recommendation
// consistency. Exercised through main's buildConversationSignals so it runs
// the same NLP the route uses.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

const { buildConversationSignals } = jiti('../lib/tara/conversation-intelligence.ts')
const { recommend } = jiti('../lib/tara/recommend.ts')
const { detectComparison, buildComparison } = jiti('../lib/tara/compare.ts')
const kb = jiti('../lib/tara/knowledge.ts')

// Build signals from a sequence of turns (strings = user turns).
const sig = (...turns) => buildConversationSignals(turns.map((t) => (typeof t === 'string' ? { role: 'user', content: t } : t)))
const TRAFFIC = ['low', 'moderate', 'high', 'very-high']

// ── 1. Structured knowledge completeness ─────────────────────────────────────
{
  const badMat = kb.TARA_MATERIALS.filter((m) => !m.profile || !m.profile.description
    || !(m.profile.advantages?.length) || !(m.profile.disadvantages?.length)
    || !(m.profile.typicalApplications?.length) || !(m.profile.recommendedProjects?.length)
    || !(m.profile.alternatives?.length) || !m.profile.maintenance
    || ![1, 2, 3, 4, 5].includes(m.profile.durability) || ![1, 2, 3, 4, 5].includes(m.profile.softness) || ![1, 2, 3, 4, 5].includes(m.profile.luxuryLevel))
  ok('every material has a complete profile', badMat.length === 0, badMat.map((m) => m.id).join(','))

  const badCon = kb.TARA_CONSTRUCTIONS.filter((c) => !c.profile || !c.profile.description || !c.profile.method
    || !(c.profile.suitableMaterials?.length) || !(c.profile.bestApplications?.length)
    || !TRAFFIC.includes(c.profile.trafficSuitability) || !c.profile.pileHeight || !c.profile.maintenance)
  ok('every construction has a complete profile', badCon.length === 0, badCon.map((c) => c.id).join(','))

  ok('alternatives reference real material ids', kb.TARA_MATERIALS.every((m) => m.profile.alternatives.every((id) => kb.TARA_MATERIALS.some((x) => x.id === id))))
  ok('suitable materials reference real ids', kb.TARA_CONSTRUCTIONS.every((c) => c.profile.suitableMaterials.every((id) => kb.TARA_MATERIALS.some((x) => x.id === id))))
}

// ── 2. Material recommendation ───────────────────────────────────────────────
{
  const hotel = recommend(sig('durable wool rug for a hotel corridor'))
  ok('hotel wool → indian wool + wall-to-wall', hotel.material.id === 'indian-wool' && hotel.category.slug === 'wall-to-wall-carpets')
  const lux = recommend(sig('a luxury silk rug'))
  ok('luxury silk → bamboo silk', lux.material.id === 'bamboo-silk')
  const outdoor = recommend(sig('a rug for my outdoor patio'))
  ok('outdoor → PET + outdoor construction', outdoor.material.id === 'pet' && outdoor.construction.id === 'outdoor')
  ok('recommendation exposes alternatives', Array.isArray(lux.alternatives) && lux.alternatives.length > 0)
}

// ── 3. Construction recommendation ───────────────────────────────────────────
{
  const knot = recommend(sig('I need a hand knotted rug'))
  ok('hand knotted → hand-knotted + category', knot.construction.id === 'hand-knotted' && knot.category.slug === 'hand-knotted-carpet')
  const soft = recommend(sig('a soft rug for my bedroom'))
  ok('soft bedroom → shaggy construction', soft.construction.id === 'shaggy')
  const flat = recommend(sig('flatweave for my living room'))
  ok('flatweave request honoured', flat.construction.id === 'flatweave')
}

// ── 4. Product comparison ────────────────────────────────────────────────────
{
  const wv = detectComparison(sig('wool vs viscose'))
  ok('wool vs viscose → material comparison', wv && wv.kind === 'material' && wv.a === 'indian-wool' && wv.b === 'viscose')
  ok('comparison text mentions both + a trade-off', wv && /wool/i.test(wv.text) && /viscose/i.test(wv.text) && /durability/i.test(wv.text))

  const bv = detectComparison(sig('bamboo silk vs viscose'))
  ok('bamboo silk vs viscose', bv && bv.kind === 'material' && bv.a === 'bamboo-silk' && bv.b === 'viscose')

  const ht = detectComparison(sig('hand tufted vs hand knotted'))
  ok('hand tufted vs hand knotted → construction comparison', ht && ht.kind === 'construction' && ht.a === 'hand-tufted' && ht.b === 'hand-knotted')

  const kd = detectComparison(sig('kilim vs dhurrie'))
  ok('kilim vs dhurrie → construction comparison', kd && kd.kind === 'construction' && kd.a === 'kilim' && kd.b === 'dhurrie')

  ok('comparison is capability-safe (no price)', !/\b(price|cost|moq|\$|₹|rs\.?|inr)\b/i.test(buildComparison(sig('wool vs viscose')) || ''))
  ok('no comparison without two subjects', detectComparison(sig('tell me about wool')) === null)
  ok('no false comparison for a blend request (no cue)', detectComparison(sig('a wool and viscose blend rug')) === null)
}

// ── 5. Wrong spellings (typo tolerance via conversation-intelligence) ────────
{
  const misspelled = recommend(sig('whool carpt for my bedroom'))
  ok('misspelled "whool carpt" → wool recommendation', misspelled && /wool/.test(misspelled.material.id))
  const vis = recommend(sig('a viscosee rug'))
  ok('misspelled "viscosee" → viscose', vis && vis.material.id === 'viscose')
  const cmp = detectComparison(sig('kilm vs dhurry'))
  ok('misspelled "kilm vs dhurry" still compares kilim vs dhurrie', cmp && cmp.a === 'kilim' && cmp.b === 'dhurrie')
}

// ── 6. Follow-up questions (memory across turns) ─────────────────────────────
{
  const s = sig('I want carpets for a hotel', { role: 'assistant', content: 'Happy to help.' }, 'which material is best?')
  const rec = recommend(s)
  ok('follow-up keeps hotel context', rec && rec.segment === 'hotel')
  ok('short follow-up is flagged', s.isShortFollowUp === true)
}

// ── 7. Recommendation consistency (deterministic) ────────────────────────────
{
  const a = recommend(sig('wool rug for a hotel lobby'))
  const b = recommend(sig('wool rug for a hotel lobby'))
  ok('same input → identical recommendation', JSON.stringify(a) === JSON.stringify(b))
}

// ── 8. Retrieval prioritizes verified product knowledge ──────────────────────
{
  ok('installation + applications in corpus', kb.KNOWLEDGE_CORPUS.some((d) => d.id === 'install-w2w') && kb.KNOWLEDGE_CORPUS.some((d) => d.id === 'app-bedroom'))
  ok('new modules registered', kb.TARA_KNOWLEDGE_MODULES.includes('installation') && kb.TARA_KNOWLEDGE_MODULES.includes('applications'))
  ok('material query retrieves enriched profile text', /durability|advantages|disadvantages/i.test(kb.retrieveContext('is viscose durable enough for a hallway')))
  ok('bedroom application retrievable', /bedroom|soft/i.test(kb.retrieveContext('what rug is good for a bedroom')))
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
