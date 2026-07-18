// Tests for getPublishedJourneyView (lib/crafttrack/published-journey.ts) —
// the one function every customer-facing view (admin preview, PR3's real
// portal) trusts to have already filtered Draft content out. The fake db
// below actually *applies* the where-clauses the function passes in,
// rather than pre-filtering the fixture data itself, so this genuinely
// tests that the function specifies the right filters — not just that the
// test fixture was set up correctly.
//
// PR3 contract change: stages are no longer filtered out once unpublished
// — every stage is returned in sequence order so a customer can see the
// full journey shape. An unpublished stage's publishedName falls back to
// draftName (structural/navigational, not customer-facing copy), but its
// message/status/media stay strictly null/empty — never Draft content.

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const require = createRequire(import.meta.url)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const jiti = require('jiti')(fileURLToPath(import.meta.url), { interopDefault: true, alias: { '@': ROOT } })

let pass = 0, fail = 0
const ok = (n, c, d = '') => { if (c) { pass++; console.log(`  ok  ${n}`) } else { fail++; console.log(`  FAIL ${n} ${d}`) } }

// A journey with 3 stages (1 published+has both a published and a draft
// image, 1 still draft-only/upcoming, 1 published with no images) and 2
// journey-level media rows (a published cover, an unpublished one that
// should never show), plus a journey-level CARE_GUIDE row.
const JOURNEY_ID = 'journey-1'

const allStages = [
  {
    id: 'stage-1', journeyId: JOURNEY_ID, sequence: 1, draftName: 'Order Confirmed',
    publishedName: 'Order Confirmed', publishedMessage: 'Confirmed.', publishedStatus: 'COMPLETE', publishedAt: new Date('2026-01-01'),
  },
  {
    id: 'stage-2', journeyId: JOURNEY_ID, sequence: 2, draftName: 'Preparation Underway',
    // Never published — draftStatus only, publishedAt null. draftName is
    // the only field a customer sees for this one.
    publishedName: null, publishedMessage: null, publishedStatus: null, publishedAt: null,
  },
  {
    id: 'stage-3', journeyId: JOURNEY_ID, sequence: 3, draftName: 'Handcrafting in Progress',
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
  { id: 'jm-3', journeyId: JOURNEY_ID, role: 'CARE_GUIDE', url: 'https://blob/care-guide.pdf', altText: null, isPublished: true },
]

function fakeDb() {
  return {
    journey: {
      async findUnique(args) {
        if (args.where.id !== JOURNEY_ID) return null

        const mediaWhere = args.include.media.where
        const stageMediaWhere = args.include.stages.include.media.where

        const media = allJourneyMedia.filter(
          (m) => m.journeyId === args.where.id && (mediaWhere.isPublished === undefined || m.isPublished === mediaWhere.isPublished),
        )

        const stages = allStages
          .filter((s) => s.journeyId === args.where.id)
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
  ok('no longer excludes an unpublished stage — it stays in the list', view.stages.length === 3)
  ok('keeps stages in sequence order', view.stages.map((s) => s.id).join(',') === 'stage-1,stage-2,stage-3')
  ok('published stage content uses the Published fields, not Draft', view.stages[0].publishedName === 'Order Confirmed' && view.stages[0].publishedMessage === 'Confirmed.')

  const upcoming = view.stages.find((s) => s.id === 'stage-2')
  ok('an unpublished stage falls back to draftName for its display name', upcoming.publishedName === 'Preparation Underway')
  ok('an unpublished stage never exposes a message', upcoming.publishedMessage === null)
  ok('an unpublished stage never exposes a status', upcoming.publishedStatus === null)
  ok('an unpublished stage has publishedAt: null (the "upcoming" signal)', upcoming.publishedAt === null)
  ok('an unpublished stage never exposes its media, even if a row is flagged isPublished', upcoming.media.length === 0)

  const stage1 = view.stages.find((s) => s.id === 'stage-1')
  ok('a published stage only shows its published images', stage1.media.length === 1 && stage1.media[0].id === 'sm-1')
  ok('the unpublished (draft) image on a published stage never appears', !stage1.media.some((m) => m.id === 'sm-2'))

  const stage3 = view.stages.find((s) => s.id === 'stage-3')
  ok('a published stage with zero images returns an empty media array, not a crash', Array.isArray(stage3.media) && stage3.media.length === 0)

  ok('only the published cover photo is returned', view.journey.coverMedia?.url === 'https://blob/cover.jpg')
  ok('the unpublished journey-level media row never leaks into coverMedia', view.journey.coverMedia?.url !== 'https://blob/unpublished.jpg')
  ok('exposes orderNumber (PR3 — needed by the real dashboard header)', view.journey.orderNumber === 'TGI-2026-0158')
  ok('exposes careGuideMedia when a CARE_GUIDE row exists', view.journey.careGuideMedia?.url === 'https://blob/care-guide.pdf')
  ok('invoiceMedia is null when no INVOICE row exists', view.journey.invoiceMedia === null)
}

// ── A journey with genuinely zero stages ──────────────────────────────────
{
  const { getPublishedJourneyView } = jiti('../lib/crafttrack/published-journey.ts')
  const originalStages = [...allStages]
  allStages.length = 0

  const view = await getPublishedJourneyView(JOURNEY_ID, fakeDb())
  ok('a journey with zero stages at all returns an empty stages array, not null or an error', view !== null && view.stages.length === 0)

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
