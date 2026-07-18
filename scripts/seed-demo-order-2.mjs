// Second demo seed — Grand Hyatt Dubai, ONE order with THREE journeys
// (Lobby Carpet, Ballroom Carpet, Restaurant Carpet), each at a different
// point in its lifecycle. Purpose: prove the Order→Journey (1:many)
// architecture live, and provide a genuinely-complete journey for the
// "customer journey complete" screen — no temporary status mutation needed.
// Local demo/screenshot purposes only. Safe to re-run — deletes and
// rebuilds the order fresh each time.
//
// Run with: node scripts/seed-demo-order-2.mjs

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CUSTOMER = { name: 'Grand Hyatt Dubai', email: 'procurement@grandhyattdubai-demo.local' }
const ORDER_NUMBER = 'GHD-2026-014'
const TEMPLATE_NAME = 'Standard Luxury Manufacturing Journey'
const ACTOR = 'admin@tapisglobal.local'

function daysAgoDate(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

// Each journey: productName, cover image, and a STAGE_PLAN identical in
// shape to seed-demo-order.mjs's — publish: null means the stage stays
// entirely in draft (upcoming/muted on the customer dashboard).
const JOURNEYS = [
  {
    productName: 'Lobby Carpet',
    cover: { url: '/images/collection-broadloom-lounge.webp', alt: 'Lobby Carpet — Grand Hyatt Dubai' },
    completedAt: null,
    stages: [
      { sequence: 1, draftStatus: 'COMPLETE', publish: { message: 'Your Lobby Carpet order has been confirmed and entered production scheduling.', status: 'COMPLETE', daysAgo: 9 }, media: [] },
      { sequence: 2, draftStatus: 'IN_PROGRESS', publish: { message: 'Materials are being sourced and yarn is being prepared for your lobby carpet.', status: 'IN_PROGRESS', daysAgo: 1 }, media: [{ url: '/images/wool-drying-pic.webp', caption: 'Wool drying ahead of dyeing', isHero: true }] },
      { sequence: 3, draftStatus: 'PENDING', publish: null, media: [] },
      { sequence: 4, draftStatus: 'PENDING', publish: null, media: [] },
      { sequence: 5, draftStatus: 'PENDING', publish: null, media: [] },
      { sequence: 6, draftStatus: 'PENDING', publish: null, media: [] },
    ],
    currentStageSequence: 2,
  },
  {
    productName: 'Ballroom Carpet',
    cover: { url: '/images/collection-broadloom-ballroom.webp', alt: 'Ballroom Carpet — Grand Hyatt Dubai' },
    completedAt: null,
    stages: [
      { sequence: 1, draftStatus: 'COMPLETE', publish: { message: 'Your Ballroom Carpet order has been confirmed and entered production scheduling.', status: 'COMPLETE', daysAgo: 34 }, media: [] },
      { sequence: 2, draftStatus: 'COMPLETE', publish: { message: 'Yarn colours were lab-dipped and approved against your ballroom’s custom palette.', status: 'COMPLETE', daysAgo: 26 }, media: [{ url: '/images/collection-knotted-dyeing.webp', caption: 'Lab-dipped yarn for the ballroom palette', isHero: true }] },
      { sequence: 3, draftStatus: 'COMPLETE', publish: { message: 'Our weavers completed the large-format broadloom weave for the main ballroom floor.', status: 'COMPLETE', daysAgo: 12 }, media: [{ url: '/images/collection-knotted-weaving.webp', caption: 'Broadloom weaving in progress', isHero: true }] },
      { sequence: 4, draftStatus: 'IN_PROGRESS', publish: { message: 'The ballroom carpet is undergoing finishing work and a full quality inspection.', status: 'IN_PROGRESS', daysAgo: 2 }, media: [{ url: '/images/collection-knotted-finishing.webp', caption: 'Finishing and edge-binding underway', isHero: true }] },
      { sequence: 5, draftStatus: 'PENDING', publish: null, media: [] },
      { sequence: 6, draftStatus: 'PENDING', publish: null, media: [] },
    ],
    currentStageSequence: 4,
  },
  {
    productName: 'Restaurant Carpet',
    cover: { url: '/images/solutions-hospitality-commercial.webp', alt: 'Restaurant Carpet — Grand Hyatt Dubai' },
    completedAt: daysAgoDate(1),
    stages: [
      { sequence: 1, draftStatus: 'COMPLETE', publish: { message: 'Your Restaurant Carpet order has been confirmed and entered production scheduling.', status: 'COMPLETE', daysAgo: 51 }, media: [] },
      { sequence: 2, draftStatus: 'COMPLETE', publish: { message: 'Yarn colours were lab-dipped and approved against your restaurant’s design palette.', status: 'COMPLETE', daysAgo: 45 }, media: [{ url: '/images/collection-tufted-dyeing.webp', caption: 'Lab-dipped yarn, approved against palette', isHero: true }] },
      { sequence: 3, draftStatus: 'COMPLETE', publish: { message: 'Artisans hand-tufted the custom pattern across the full restaurant floor plan.', status: 'COMPLETE', daysAgo: 30 }, media: [{ url: '/images/tufting-carpet.webp', caption: 'Hand-tufting the restaurant floor pattern', isHero: true }] },
      { sequence: 4, draftStatus: 'COMPLETE', publish: { message: 'The carpet passed a full finishing and quality inspection with no defects noted.', status: 'COMPLETE', daysAgo: 14 }, media: [{ url: '/images/collection-tufted-finishing.webp', caption: 'Final quality inspection', isHero: true }] },
      { sequence: 5, draftStatus: 'COMPLETE', publish: { message: 'Your restaurant carpet passed inspection and was prepared for export.', status: 'COMPLETE', daysAgo: 6 }, media: [] },
      { sequence: 6, draftStatus: 'COMPLETE', publish: { message: 'Your restaurant carpet has been dispatched and is on its way to Grand Hyatt Dubai.', status: 'COMPLETE', daysAgo: 1 }, media: [{ url: '/images/collection-tufted-hotel.webp', caption: 'Ready and dispatched', isHero: true }] },
    ],
    currentStageSequence: 6,
  },
]

async function main() {
  const template = await prisma.journeyTemplate.findUnique({
    where: { name: TEMPLATE_NAME },
    include: { stages: { orderBy: { sequence: 'asc' } } },
  })
  if (!template) throw new Error(`Journey template "${TEMPLATE_NAME}" not found — run "npx prisma db seed" first.`)

  const customer = await prisma.customer.upsert({
    where: { email: CUSTOMER.email },
    update: { name: CUSTOMER.name },
    create: CUSTOMER,
  })

  const existingOrder = await prisma.order.findUnique({ where: { orderNumber: ORDER_NUMBER } })
  if (existingOrder) {
    console.log(`Order ${ORDER_NUMBER} already exists — deleting so this script can rebuild it fresh.`)
    await prisma.order.delete({ where: { id: existingOrder.id } })
  }

  const order = await prisma.order.create({ data: { orderNumber: ORDER_NUMBER, customerId: customer.id } })

  for (const journeyPlan of JOURNEYS) {
    const journey = await prisma.journey.create({
      data: {
        orderId: order.id,
        journeyTemplateId: template.id,
        productName: journeyPlan.productName,
        productSlug: null,
        completedAt: journeyPlan.completedAt,
      },
    })

    await prisma.journeyMedia.create({
      data: { journeyId: journey.id, role: 'COVER', url: journeyPlan.cover.url, altText: journeyPlan.cover.alt, isPublished: true },
    })

    let currentStageId = null

    for (const plan of journeyPlan.stages) {
      const templateStage = template.stages.find((s) => s.sequence === plan.sequence)
      const isPublished = plan.publish !== null

      const stage = await prisma.journeyStage.create({
        data: {
          journeyId: journey.id,
          templateStageId: templateStage.id,
          sequence: plan.sequence,
          draftName: templateStage.name,
          draftMessage: plan.publish?.message ?? templateStage.description,
          draftStatus: plan.draftStatus,
          ...(isPublished
            ? {
                publishedName: templateStage.name,
                publishedMessage: plan.publish.message,
                publishedStatus: plan.publish.status,
                publishedAt: daysAgoDate(plan.publish.daysAgo),
                publishedBy: ACTOR,
              }
            : {}),
        },
      })

      await prisma.stageEvent.create({
        data: { stageId: stage.id, type: 'STAGE_STARTED', actor: ACTOR, occurredAt: daysAgoDate((plan.publish?.daysAgo ?? 0) + 1) },
      })
      if (isPublished) {
        await prisma.stageEvent.create({
          data: { stageId: stage.id, type: 'STAGE_PUBLISHED', toStatus: plan.publish.status, actor: ACTOR, occurredAt: daysAgoDate(plan.publish.daysAgo) },
        })
      }

      for (const [i, m] of plan.media.entries()) {
        await prisma.journeyMedia.create({
          data: { stageId: stage.id, role: 'GALLERY', url: m.url, caption: m.caption, isHero: m.isHero, isPublished: true, sortOrder: i },
        })
      }

      if (plan.sequence === journeyPlan.currentStageSequence) currentStageId = stage.id
    }

    if (journeyPlan.completedAt) {
      await prisma.stageEvent.create({
        data: {
          stageId: currentStageId,
          type: 'STAGE_COMPLETED',
          actor: ACTOR,
          occurredAt: journeyPlan.completedAt,
        },
      })
    }

    await prisma.journey.update({ where: { id: journey.id }, data: { currentStageId } })
    console.log(`  Journey "${journeyPlan.productName}" seeded (current stage sequence ${journeyPlan.currentStageSequence}${journeyPlan.completedAt ? ', COMPLETED' : ''}).`)
  }

  console.log(`Seeded ${ORDER_NUMBER} — customer ${CUSTOMER.name} (${CUSTOMER.email}), 3 journeys: ${JOURNEYS.map((j) => j.productName).join(', ')}.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
