/**
 * Assertions for lead scoring + CRM pipeline model.
 * Run: npx tsx scripts/verify-lead-scoring.ts
 */
import { scoreLead, withLeadScore } from '../lib/lead-scoring'
import { STAGE_DEFINITIONS, PIPELINE_STAGES, canTransition, initialStage, priorityForTier, firstTouchSlaHours } from '../lib/crm-pipeline'

let failed = 0
const ok = (c: boolean, m: string) => { if (c) console.log(`  PASS  ${m}`); else { failed++; console.error(`  FAIL  ${m}`) } }

// --- Lead scoring ---
const hot = scoreLead({
  buyerType: 'Large Buyer / Distributor', timeline: 'Immediate', quantity: '2 containers',
  email: 'procurement@acmehotels.com', companyWebsite: 'https://acmehotels.com',
  companyName: 'Acme', destination: 'Hamburg, DE', message: 'We need 800 sqm hand-tufted for 3 properties this quarter.',
})
ok(hot.tier === 'Hot', `high-intent lead → Hot (score ${hot.score})`)
ok(hot.score >= 60, 'Hot score ≥ 60')
ok(hot.reasons.includes('Immediate timeline'), 'reasons include timeline signal')

const warm = scoreLead({ buyerType: 'Interior Designer / Architect', timeline: '1–3 months', email: 'jane@studio.co', quantity: '' })
ok(warm.tier === 'Warm', `designer, 1–3 months → Warm (score ${warm.score})`)

const cold = scoreLead({ buyerType: 'Interior Designer / Architect', timeline: 'Just researching', email: 'someone@gmail.com' })
ok(cold.tier === 'Cold', `researcher on free email → Cold (score ${cold.score})`)
ok(cold.score < warm.score && warm.score < hot.score, 'monotonic: cold < warm < hot')

const free = scoreLead({ buyerType: 'Importer / Wholesaler', email: 'buyer@gmail.com', timeline: 'Immediate' })
const biz = scoreLead({ buyerType: 'Importer / Wholesaler', email: 'buyer@company.com', timeline: 'Immediate' })
ok(biz.score > free.score, 'business email scores higher than free email')

const tagged = withLeadScore({ buyerType: 'Importer / Wholesaler', email: 'x@company.com' })
ok(tagged.leadTier !== undefined && tagged.leadScore !== undefined && tagged.leadReasons !== undefined, 'withLeadScore attaches leadTier/leadScore/leadReasons')

const empty = scoreLead({})
ok(empty.tier === 'Cold' && empty.score >= 0, 'empty submission → Cold, no throw')

// --- CRM pipeline ---
ok(PIPELINE_STAGES.join('→') === 'New→Qualified→Sample→Quote→Negotiation→Won→Lost', 'pipeline stages in order')
ok(STAGE_DEFINITIONS.length === PIPELINE_STAGES.length, 'every stage has a definition')
ok(initialStage() === 'New', 'leads start at New')
ok(canTransition('New', 'Qualified') && !canTransition('New', 'Won'), 'transitions enforced (New→Qualified ok, New→Won blocked)')
ok(canTransition('Quote', 'Negotiation') && canTransition('Negotiation', 'Won'), 'Quote→Negotiation→Won allowed')
ok(priorityForTier('Hot') === 'P1' && firstTouchSlaHours('Hot') === 4, 'Hot → P1 priority, 4h SLA')
ok(priorityForTier('Cold') === 'P3', 'Cold → P3 priority')

console.log(failed === 0 ? '\nALL LEAD-SCORING & PIPELINE ASSERTIONS PASSED' : `\n${failed} ASSERTION(S) FAILED`)
process.exit(failed === 0 ? 0 : 1)
