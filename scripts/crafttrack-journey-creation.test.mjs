// PR2.1 hardening: tests for the journey-creation transaction logic
// (lib/crafttrack/journey-creation.ts). Exercised against an in-memory fake
// Prisma transaction client — no real database needed. No test framework:
// local assertions + jiti to run the real .ts source directly.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

let nextId = 1
const id = () => `test-id-${nextId++}`

function makeFakeTx({ templateStages }) {
  const created = { journeys: [], stages: [], events: [] }

  const tx = {
    journeyTemplate: {
      async findUniqueOrThrow({ where }) {
        return {
          id: where.id,
          name: 'Standard Luxury Manufacturing Journey',
          stages: templateStages,
        }
      },
    },
    journey: {
      async create({ data }) {
        const journey = { id: id(), ...data }
        created.journeys.push(journey)
        return journey
      },
    },
    journeyStage: {
      async create({ data }) {
        const stage = { id: id(), ...data }
        created.stages.push(stage)
        return stage
      },
    },
    stageEvent: {
      async create({ data }) {
        const event = { id: id(), ...data }
        created.events.push(event)
        return event
      },
    },
  }

  return { tx, created }
}

const STANDARD_STAGES = [
  { id: 'ts-1', name: 'Order Confirmed', sequence: 1, description: 'Confirmed.' },
  { id: 'ts-2', name: 'Preparation Underway', sequence: 2, description: 'Preparing.' },
  { id: 'ts-3', name: 'Handcrafting in Progress', sequence: 3, description: null },
]

// ── createJourneyWithStages ───────────────────────────────────────────────
{
  const { createJourneyWithStages } = jiti('../lib/crafttrack/journey-creation.ts')
  const { tx, created } = makeFakeTx({ templateStages: STANDARD_STAGES })

  const result = await createJourneyWithStages(tx, {
    orderId: 'order-1',
    journeyTemplateId: 'template-1',
    productName: 'Premium Hand Tufted Carpet',
    productSlug: 'hand-tufted-carpet',
    actor: 'admin@tapisglobalinternational.com',
  })

  ok('creates exactly one Journey', created.journeys.length === 1)
  ok('Journey carries the given orderId/template/product fields', created.journeys[0].orderId === 'order-1'
    && created.journeys[0].journeyTemplateId === 'template-1'
    && created.journeys[0].productName === 'Premium Hand Tufted Carpet'
    && created.journeys[0].productSlug === 'hand-tufted-carpet')

  ok('creates one JourneyStage per TemplateStage', created.stages.length === STANDARD_STAGES.length)
  ok('stages carry the journey id returned from Journey.create', created.stages.every((s) => s.journeyId === result.journey.id))
  ok('stage names/sequence copied from the template', created.stages.every((s, i) => s.draftName === STANDARD_STAGES[i].name && s.sequence === STANDARD_STAGES[i].sequence))
  ok('draftMessage seeded from TemplateStage.description (including null)', created.stages[0].draftMessage === 'Confirmed.' && created.stages[2].draftMessage === null)

  ok('stage 1 starts IN_PROGRESS', created.stages[0].draftStatus === 'IN_PROGRESS')
  ok('every other stage starts PENDING', created.stages.slice(1).every((s) => s.draftStatus === 'PENDING'))

  ok('exactly one StageEvent is written', created.events.length === 1)
  ok('the StageEvent is STAGE_STARTED for stage 1', created.events[0].type === 'STAGE_STARTED' && created.events[0].stageId === created.stages[0].id)
  ok('the StageEvent records the given actor', created.events[0].actor === 'admin@tapisglobalinternational.com')

  ok('function returns {journey, stages} matching what was created', result.journey.id === created.journeys[0].id && result.stages.length === created.stages.length)
}

// ── createJourneyWithStages rejects a template with no stages ────────────
{
  const { createJourneyWithStages } = jiti('../lib/crafttrack/journey-creation.ts')
  const { tx } = makeFakeTx({ templateStages: [] })

  let threw = false
  try {
    await createJourneyWithStages(tx, { orderId: 'order-2', journeyTemplateId: 'empty-template', productName: 'X', actor: 'a@b.com' })
  } catch {
    threw = true
  }
  ok('throws for a template with zero stages, instead of silently creating an empty journey', threw)
}

// ── isUniqueConstraintError ───────────────────────────────────────────────
{
  const { isUniqueConstraintError } = jiti('../lib/crafttrack/journey-creation.ts')

  const p2002 = { code: 'P2002', meta: { target: ['orderNumber'] } }
  ok('recognizes a P2002 error on the matching field', isUniqueConstraintError(p2002, 'orderNumber') === true)
  ok('does not match a P2002 error on a different field', isUniqueConstraintError(p2002, 'email') === false)
  ok('does not match a non-P2002 error', isUniqueConstraintError({ code: 'P2025' }, 'orderNumber') === false)
  ok('does not match a plain Error', isUniqueConstraintError(new Error('boom'), 'orderNumber') === false)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
