import { prisma } from '@/lib/prisma'

/** Loads a Journey's customer-visible state — Published stage/media content
 * only, never Draft — for both PR2's admin preview route and PR3's real
 * customer portal. Callers pass the result straight into
 * components/crafttrack/PublishedJourneyView.tsx, which assumes its input
 * is already filtered to "what a customer is allowed to see" and does not
 * re-implement that filter itself. */
export async function getPublishedJourneyView(journeyId: string) {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      order: { select: { orderNumber: true } },
      media: {
        where: { journeyId, isPublished: true },
        orderBy: { sortOrder: 'asc' },
      },
      stages: {
        where: { publishedAt: { not: null } },
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

  const coverMedia = journey.media.find((m) => m.role === 'COVER') ?? null

  return {
    journey: {
      orderNumber: journey.order.orderNumber,
      productName: journey.productName,
      productSlug: journey.productSlug,
      completedAt: journey.completedAt,
      coverMedia: coverMedia ? { url: coverMedia.url, altText: coverMedia.altText } : null,
    },
    stages: journey.stages.map((stage) => ({
      id: stage.id,
      sequence: stage.sequence,
      publishedName: stage.publishedName!,
      publishedMessage: stage.publishedMessage,
      publishedStatus: stage.publishedStatus!,
      publishedAt: stage.publishedAt!,
      media: stage.media.map((m) => ({ id: m.id, url: m.url, caption: m.caption, isHero: m.isHero })),
    })),
    messages: journey.messages.map((m) => ({ id: m.id, body: m.body, createdAt: m.createdAt })),
  }
}

export type PublishedJourneyData = NonNullable<Awaited<ReturnType<typeof getPublishedJourneyView>>>
