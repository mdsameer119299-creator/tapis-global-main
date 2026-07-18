// PR2.1 hardening: tests for getPublishedJourneyView
// (lib/crafttrack/published-journey.ts) — the one function every customer-
// facing view (today's admin preview, PR3's real portal) trusts to have
// already filtered Draft content out. The fake db below actually *applies*
// the where-clauses the function passes in, rather than pre-filtering the
// fixture data itself, so this genuinely tests that the function specifies
// the right filters — not just that the test fixture was set up correctly.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

// A journey with 3 stages (1 published+has both a published and a draft
// image, 1 still draft-only, 1 published with no images) and 2 journey-level
// media rows (a published cover, an unpublished one that should never show).
const JOURNEY_ID = 'journey-1'

const allStages = [
  {
    id: 'stage-1', journeyId: JOURNEY_ID, sequence: 1,
    publishedName: 'Order Confirmed', publishedMessage: 'Confirmed.', publishedStatus: 'COMPLETE', publishedAt: new Date('2026-01-01'),
  },
  {
    id: 'stage-2', journeyId: JOURNEY_ID, sequence: 2,
    // Never published — draftStatus only, publishedAt null.
    publishedName: null, publishedMessage: null, publishedStatus: null, publishedAt: null,
  },
  {
    id: 'stage-3', journeyId: JOURNEY_ID, sequence: 3,
    publishedName: 'Handcrafting in Progress', publishedMessage: 'On the loom.', publishedStatus: 'IN_PROGRESS', publishedAt: new Date('2026-01-10'),
  },
]

const allStageMedia = [
  { id: 'sm-1', stageId: 'stage-1', url: 'https://blob/sm-1.jpg', caption: 'Published photo', isHero: true, isPublished: true },
  { id: 'sm-2', stageId: 'stage-1', url: 'https://blob/sm-2.jpg', caption: 'Draft photo not yet published', isHero: false, isPublished: false },
  { id: 'sm-3', stageId: 'stage-2', url: 'https://blob/sm-3.jpg', caption: 'Photo on an unpublished stage', isHero: true, isPublished: true },
]

const allJourneyMedia = [
  { id: 'jm-1', journeyId: JOURNEY_ID, role: 'COVER', url: 'https://blob/cover.jpg', altText: 'Cover', isPublished: true },
  { id: 'jm-2', journeyId: JOURNEY_ID, role: 'GALLERY', url: 'https://blob/unpublished.jpg', altText: null, isPublished: false },
]

function fakeDb() {
  return {
    journey: {
      async findUnique(args) {
        if (args.where.id !== JOURNEY_ID) return null

        const mediaWhere = args.include.media.where
        const stagesWhere = args.include.stages.where
        const stageMediaWhere = args.include.stages.include.media.where

        const media = allJourneyMedia.filter(
          (m) => m.journeyId === args.where.id && (mediaWhere.isPublished === undefined || m.isPublished === mediaWhere.isPublished),
        )

        const stages = allStages
          .filter((s) => s.journeyId === args.where.id)
          .filter((s) => (stagesWhere.publishedAt?.not === null ? s.publishedAt !== null : true))
          .sort((a, b) => a.sequence - b.sequence)
          .map((s) => ({
            ...s,
            media: allStageMedia.filter(
              (m) => m.stageId === s.id && (stageMediaWhere.isPublished === undefined || m.isPublished === stageMediaWhere.isPublished),
            ),
          }))

        return {
          productName: 'Premium Hand Tufted Carpet',
          productSlug: 'hand-tufted-carpet',
          completedAt: null,
          order: { orderNumber: 'TGI-2026-0158' },
          media,
          stages,
          messages: [],
        }
      },
    },
  }
}

{
  const { getPublishedJourneyView } = jiti('../lib/crafttrack/published-journey.ts')
  const view = await getPublishedJourneyView(JOURNEY_ID, fakeDb())

  ok('returns a view for a journey that exists', view !== null)
  ok('excludes the never-published stage entirely', view.stages.every((s) => s.id !== 'stage-2') && view.stages.length === 2)
  ok('keeps stages in sequence order', view.stages.map((s) => s.id).join(',') === 'stage-1,stage-3')
  ok('published stage content uses the Published fields, not Draft', view.stages[0].publishedName === 'Order Confirmed' && view.stages[0].publishedMessage === 'Confirmed.')

  const stage1 = view.stages.find((s) => s.id === 'stage-1')
  ok('a published stage only shows its published images', stage1.media.length === 1 && stage1.media[0].id === 'sm-1')
  ok('the unpublished (draft) image on a published stage never appears', !stage1.media.some((m) => m.id === 'sm-2'))

  const stage3 = view.stages.find((s) => s.id === 'stage-3')
  ok('a published stage with zero images returns an empty media array, not a crash', Array.isArray(stage3.media) && stage3.media.length === 0)

  ok('only the published cover photo is returned', view.journey.coverMedia?.url === 'https://blob/cover.jpg')
  ok('the unpublished journey-level media row never leaks into coverMedia', view.journey.coverMedia?.url !== 'https://blob/unpublished.jpg')
}

// ── A journey with zero published stages ──────────────────────────────────
{
  const { getPublishedJourneyView } = jiti('../lib/crafttrack/published-journey.ts')
  const originalStages = [...allStages]
  allStages.length = 0
  allStages.push({ ...originalStages[1] }) // only the never-published stage exists

  const view = await getPublishedJourneyView(JOURNEY_ID, fakeDb())
  ok('a brand-new journey with no published stages yet returns an empty stages array, not null or an error', view !== null && view.stages.length === 0)

  allStages.length = 0
  allStages.push(...originalStages)
}

// ── A journeyId that doesn't exist ─────────────────────────────────────────
{
  const { getPublishedJourneyView } = jiti('../lib/crafttrack/published-journey.ts')
  const view = await getPublishedJourneyView('does-not-exist', fakeDb())
  ok('returns null for a journey that does not exist, for the caller to 404 on', view === null)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail === 0 ? 0 : 1)
