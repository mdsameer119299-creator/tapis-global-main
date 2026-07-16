// scripts/tara-recommendation.test.mjs
// Tests for the additive layer on top of PR #20: the capability-safe product
// recommendation engine and the segment advisor knowledge docs. It reuses main's
// buildConversationSignals so the engine is exercised through the same NLP the
// route uses.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

const { buildConversationSignals } = jiti('../lib/tara/conversation-intelligence.ts')
const { recommend, buildRecommendation, hasRecommendation } = jiti('../lib/tara/recommend.ts')
const kb = jiti('../lib/tara/knowledge.ts')

const sig = (...userMessages) => buildConversationSignals(userMessages.map((content) => ({ role: 'user', content })))

// ── Recommendation engine: verified + capability-safe ────────────────────────
{
  const hotel = recommend(sig('durable carpet for a hotel corridor'))
  ok('hotel → recommendation produced', Boolean(hotel && hotel.material && hotel.construction && hotel.category))
  ok('hotel → wall-to-wall category', hotel.category.slug === 'wall-to-wall-carpets')
  ok('hotel segment detected', hotel.segment === 'hotel')

  const lux = recommend(sig('a luxury wool rug'))
  ok('luxury wool → NZ wool upgrade', lux.material.id === 'nz-wool')

  const budget = recommend(sig('cheapest natural option for my home'))
  ok('budget/natural → economy fibre', ['jute', 'cotton', 'sisal'].includes(budget.material.id))

  const designer = recommend(sig('bespoke carved rug for a design project'))
  ok('carved intent → hand-tufted', designer.construction.id === 'hand-tufted')

  ok('vague message → no recommendation forced', recommend(sig('hello there')) === null)
  ok('hasRecommendation false for greeting', hasRecommendation(sig('hi')) === false)
}

// ── Recommendation TEXT is safe + present when it should be ──────────────────
{
  const line = buildRecommendation(sig('help me choose for a hotel lobby, wool'))
  ok('recommendation line is emitted', typeof line === 'string' && line.length > 0)
  ok('recommendation line has no price/MOQ language', !/\b(price|cost|moq|\$|₹|rs\.?|inr|per sq)/i.test(line))
  ok('recommendation line is framed as a suggestion', /suggest|starting point/i.test(line))
  ok('no recommendation line for a bare greeting', buildRecommendation(sig('hello')) === null)
}

// ── Segment advisor knowledge in the corpus + retrievable ────────────────────
{
  ok('segments exported from barrel', Array.isArray(kb.SEGMENT_MODULE) && kb.SEGMENT_MODULE.length >= 5)
  ok('segment advisors added to corpus', kb.KNOWLEDGE_CORPUS.some((d) => d.id === 'seg-hotel') && kb.KNOWLEDGE_CORPUS.some((d) => d.id === 'seg-tender'))
  ok('segments listed in module registry', kb.TARA_KNOWLEDGE_MODULES.includes('segments'))
  ok('tender query retrieves tender guidance', /tender|specification/i.test(kb.retrieveContext('help with a government tender bid')))
  ok('hotel query retrieves hospitality guidance', /hotel|hospitality|guestroom/i.test(kb.retrieveContext('carpets for a hotel project')))
  ok('existing material retrieval still works', /wool/i.test(kb.retrieveContext('new zealand wool for a hotel lobby')))
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
