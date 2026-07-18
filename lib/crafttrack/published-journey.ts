import type { StageStatus } from '@prisma/client'

type PublishedJourneyRow = {
  productName: string
  productSlug: string | null
  completedAt: Date | null
  order: { orderNumber: string }
  media: Array<{ role: string; url: string; altText: string | null }>
  stages: Array<{
    id: string
    sequence: number
    draftName: string
    publishedName: string | null
    publishedMessage: string | null
    publishedStatus: StageStatus | null
    publishedAt: Date | null
    media: Array<{ id: string; url: string; caption: string | null; isHero: boolean }>
  }>
  messages: Array<{ id: string; body: string; createdAt: Date }>
}

type JourneyReader = {
  journey: {
    findUnique: (args: unknown) => Promise<PublishedJourneyRow | null>
  }
}

/** Loads a Journey's customer-visible state for both PR2's admin preview
 * route and PR3's real customer portal. Callers pass the result straight
 * into components/crafttrack/PublishedJourneyView.tsx, which assumes its
 * input is already filtered to "what a customer is allowed to see" and
 * does not re-implement that filter itself.
 *
 * PR3 contract change: stages are no longer filtered to publishedAt-not-null
 * — every stage is returned, in sequence order, so a customer can see the
 * full journey shape (what's next) rather than the list silently ending at
 * whatever's published so far. A stage that hasn't been published yet
 * returns publishedAt: null, publishedMessage: null, media: [] (never its
 * Draft message/images — those stay exactly as invisible as before), and
 * publishedName falls back to draftName. That one field is a deliberate,
 * narrow exception: a stage's name is structural/navigational (it's what
 * lets a customer see "step 4 of 6" at all), not the kind of admin-authored
 * customer-facing copy the Draft/Published split exists to gate — message
 * text and imagery remain strictly Published-only with no fallback.
 *
 * db is injectable (see scripts/crafttrack-published-journey-view.test.mjs)
 * so the Draft-vs-Published filtering can be unit-tested without a real
 * database. lib/prisma.ts is only imported lazily, inside the function
 * body, when no db is supplied — a test that always injects a fake db
 * never constructs the real PrismaClient singleton at all. */
export async function getPublishedJourneyView(journeyId: string, injectedDb?: JourneyReader) {
  const db = injectedDb ?? (await import('@/lib/prisma')).prisma

  const journey = await db.journey.findUnique({
    where: { id: journeyId },
    include: {
      order: { select: { orderNumber: true } },
      media: {
        where: { journeyId, isPublished: true },
        orderBy: { sortOrder: 'asc' },
      },
      stages: {
        orderBy: { sequence: 'asc' },
        include: {
          media: {
            where: { isPublished: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!journey) return null

  const findRole = (role: string) => journey.media.find((m) => m.role === role) ?? null

  const coverMedia = findRole('COVER')
  const careGuideMedia = findRole('CARE_GUIDE')
  const invoiceMedia = findRole('INVOICE')

  return {
    journey: {
      orderNumber: journey.order.orderNumber,
      productName: journey.productName,
      productSlug: journey.productSlug,
      completedAt: journey.completedAt,
      coverMedia: coverMedia ? { url: coverMedia.url, altText: coverMedia.altText } : null,
      careGuideMedia: careGuideMedia ? { url: careGuideMedia.url } : null,
      invoiceMedia: invoiceMedia ? { url: invoiceMedia.url } : null,
    },
    stages: journey.stages.map((stage) => ({
      id: stage.id,
      sequence: stage.sequence,
      publishedName: stage.publishedName ?? stage.draftName,
      publishedMessage: stage.publishedAt ? stage.publishedMessage : null,
      publishedStatus: stage.publishedAt ? stage.publishedStatus : null,
      publishedAt: stage.publishedAt,
      media: stage.publishedAt ? stage.media.map((m) => ({ id: m.id, url: m.url, caption: m.caption, isHero: m.isHero })) : [],
    })),
    messages: journey.messages.map((m) => ({ id: m.id, body: m.body, createdAt: m.createdAt })),
  }
}

export type PublishedJourneyData = NonNullable<Awaited<ReturnType<typeof getPublishedJourneyView>>>
