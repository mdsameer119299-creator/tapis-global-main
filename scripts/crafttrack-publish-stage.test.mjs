// PR2.1 hardening: tests for the publish transaction (lib/crafttrack/publish-stage.ts).
// Same in-memory fake-tx approach as crafttrack-journey-creation.test.mjs.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

function makeFakeTx({ stage, journeyStages }) {
  const calls = { stageUpdates: [], mediaUpdateManyCalls: [], events: [], journeyUpdates: [] }
  let currentStage = { ...stage }

  const tx = {
    journeyStage: {
      async findUniqueOrThrow() {
        return { ...currentStage, journey: { stages: journeyStages } }
      },
      async update({ data }) {
        currentStage = { ...currentStage, ...data }
        calls.stageUpdates.push(data)
        return currentStage
      },
    },
    journeyMedia: {
      async updateMany({ where, data }) {
        calls.mediaUpdateManyCalls.push({ where, data })
        return { count: 0 }
      },
    },
    stageEvent: {
      async create({ data }) {
        calls.events.push(data)
        return { id: `event-${calls.events.length}`, ...data }
      },
    },
    journey: {
      async update({ where, data }) {
        calls.journeyUpdates.push({ where, data })
        return { id: where.id, ...data }
      },
    },
  }

  return { tx, calls }
}

const baseStage = {
  id: 'stage-3',
  journeyId: 'journey-1',
  sequence: 3,
  draftName: 'Handcrafting in Progress',
  draftMessage: 'On the loom.',
  draftStatus: 'IN_PROGRESS',
  publishedName: null,
  publishedMessage: null,
  publishedStatus: null,
  publishedAt: null,
  publishedBy: null,
}

const sixStages = [
  { id: 'stage-1', sequence: 1 },
  { id: 'stage-2', sequence: 2 },
  { id: 'stage-3', sequence: 3 },
  { id: 'stage-4', sequence: 4 },
  { id: 'stage-5', sequence: 5 },
  { id: 'stage-6', sequence: 6 },
]

// ── Publishing a non-last stage, first time ───────────────────────────────
{
  const { publishStage } = jiti('../lib/crafttrack/publish-stage.ts')
  const { tx, calls } = makeFakeTx({ stage: baseStage, journeyStages: sixStages })

  const result = await publishStage(tx, { stageId: 'stage-3', actor: 'admin@tapisglobalinternational.com' })

  ok('copies draft fields into published fields', result.stage.publishedName === 'Handcrafting in Progress'
    && result.stage.publishedMessage === 'On the loom.'
    && result.stage.publishedStatus === 'IN_PROGRESS')
  ok('sets publishedAt', result.stage.publishedAt instanceof Date)
  ok('sets publishedBy to the given actor', result.stage.publishedBy === 'admin@tapisglobalinternational.com')
  ok('isFirstPublish is true when publishedAt was previously null', result.isFirstPublish === true)
  ok('publishes only this stage\'s own media (stageId filter, not journey-wide)', calls.mediaUpdateManyCalls.length === 1 && calls.mediaUpdateManyCalls[0].where.stageId === 'stage-3')
  ok('writes exactly one STAGE_PUBLISHED event for a non-last stage', calls.events.length === 1 && calls.events[0].type === 'STAGE_PUBLISHED')
  ok('does NOT touch Journey.completedAt for a non-last stage', calls.journeyUpdates.length === 0)
  ok('returns the journeyId for the caller to send the notification', result.journeyId === 'journey-1')
}

// ── Re-publishing an already-published stage ──────────────────────────────
{
  const { publishStage } = jiti('../lib/crafttrack/publish-stage.ts')
  const alreadyPublished = { ...baseStage, publishedAt: new Date('2026-01-01'), publishedStatus: 'IN_PROGRESS' }
  const { tx } = makeFakeTx({ stage: alreadyPublished, journeyStages: sixStages })

  const result = await publishStage(tx, { stageId: 'stage-3', actor: 'admin@tapisglobalinternational.com' })

  ok('isFirstPublish is false on a re-publish — this is what gates the notification email from re-sending', result.isFirstPublish === false)
}

// ── Publishing the LAST stage as COMPLETE ─────────────────────────────────
{
  const { publishStage } = jiti('../lib/crafttrack/publish-stage.ts')
  const lastStage = { ...baseStage, id: 'stage-6', sequence: 6, draftName: 'Dispatched', draftStatus: 'COMPLETE' }
  const { tx, calls } = makeFakeTx({ stage: lastStage, journeyStages: sixStages })

  await publishStage(tx, { stageId: 'stage-6', actor: 'admin@tapisglobalinternational.com' })

  ok('sets Journey.completedAt when the actual last stage (by sequence) publishes COMPLETE', calls.journeyUpdates.length === 1 && calls.journeyUpdates[0].data.completedAt instanceof Date)
  ok('writes both STAGE_PUBLISHED and STAGE_COMPLETED events', calls.events.length === 2 && calls.events.map((e) => e.type).includes('STAGE_COMPLETED'))
}

// ── Publishing the last stage, but NOT as COMPLETE ────────────────────────
{
  const { publishStage } = jiti('../lib/crafttrack/publish-stage.ts')
  const lastStageInProgress = { ...baseStage, id: 'stage-6', sequence: 6, draftStatus: 'IN_PROGRESS' }
  const { tx, calls } = makeFakeTx({ stage: lastStageInProgress, journeyStages: sixStages })

  await publishStage(tx, { stageId: 'stage-6', actor: 'admin@tapisglobalinternational.com' })

  ok('does NOT set Journey.completedAt just because it\'s the last stage, unless status is COMPLETE', calls.journeyUpdates.length === 0)
  ok('does NOT write STAGE_COMPLETED unless status is COMPLETE', !calls.events.some((e) => e.type === 'STAGE_COMPLETED'))
}

// ── "Last stage" is computed from sequence, never hardcoded ───────────────
{
  const { publishStage } = jiti('../lib/crafttrack/publish-stage.ts')
  const threeStages = [{ id: 'a', sequence: 1 }, { id: 'b', sequence: 2 }, { id: 'c', sequence: 3 }]
  const shortJourneyLastStage = { ...baseStage, id: 'c', sequence: 3, draftStatus: 'COMPLETE' }
  const { tx, calls } = makeFakeTx({ stage: shortJourneyLastStage, journeyStages: threeStages })

  await publishStage(tx, { stageId: 'c', actor: 'admin@tapisglobalinternational.com' })

  ok('a 3-stage template\'s 3rd stage is correctly treated as "last", not compared against a hardcoded count of 6', calls.journeyUpdates.length === 1)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
