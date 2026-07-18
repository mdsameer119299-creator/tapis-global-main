// One-off local seed script — creates a realistic showcase order for
// verifying the admin dashboard and customer portal end-to-end against a
// real database. NOT part of the seed pipeline (prisma/seed.ts is the
// idempotent admin-user/template seed that runs everywhere); this script
// is for local demo/screenshot purposes only. Safe to re-run — upserts by
// order number.
//
// Run with: DATABASE_URL=... node scripts/seed-demo-order.mjs

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CUSTOMER = { name: 'Hilton Dubai', email: 'procurement@hiltondubai-demo.local' }
const ORDER_NUMBER = 'HTL-2026-001'
const PRODUCT_NAME = 'Lobby Carpet'
const TEMPLATE_NAME = 'Standard Luxury Manufacturing Journey'
const ACTOR = 'admin@tapisglobal.local'

// sequence 1-6 match the seeded template's stage names exactly.
const STAGE_PLAN = [
  {
    sequence: 1,
    draftStatus: 'COMPLETE',
    publish: {
      message: 'Your Lobby Carpet order has been confirmed and entered production scheduling.',
      status: 'COMPLETE',
      daysAgo: 21,
    },
    media: [],
  },
  {
    sequence: 2,
    draftStatus: 'COMPLETE',
    publish: {
      message:
        'We translated your mood board and Pantone references into production maps, then lab-dipped yarn colours for approval before bulk production began.',
      status: 'COMPLETE',
      daysAgo: 13,
    },
    media: [{ url: '/images/collection-tufted-dyeing.webp', caption: 'Lab-dipped yarn, approved against Pantone reference', isHero: true }],
  },
  {
    sequence: 3,
    draftStatus: 'IN_PROGRESS',
    publish: {
      message: 'Our artisans are hand-guiding tufting across the stretched backing for your lobby’s custom medallion pattern.',
      status: 'IN_PROGRESS',
      daysAgo: 2,
    },
    media: [
      { url: '/images/tufting-carpet.webp', caption: 'Hand-tufting the medallion border, week two', isHero: true },
      { url: '/images/collection-tufted-factory.webp', caption: 'On the frame at our Bhadohi facility', isHero: false },
    ],
  },
  // Stages 4-6 stay entirely in draft — never published — so the customer
  // dashboard renders them muted/upcoming per the PR3b stage-filter contract.
  { sequence: 4, draftStatus: 'PENDING', publish: null, media: [] },
  { sequence: 5, draftStatus: 'PENDING', publish: null, media: [] },
  { sequence: 6, draftStatus: 'PENDING', publish: null, media: [] },
]

function daysAgoDate(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

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

  const order = await prisma.order.create({
    data: { orderNumber: ORDER_NUMBER, customerId: customer.id },
  })

  const journey = await prisma.journey.create({
    data: {
      orderId: order.id,
      journeyTemplateId: template.id,
      productName: PRODUCT_NAME,
      productSlug: null,
    },
  })

  await prisma.journeyMedia.create({
    data: {
      journeyId: journey.id,
      role: 'COVER',
      url: '/images/collection-tufted-hotel.webp',
      altText: 'Lobby Carpet — Hilton Dubai',
      isPublished: true,
    },
  })

  let currentStageId = null

  for (const plan of STAGE_PLAN) {
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
      data: {
        stageId: stage.id,
        type: 'STAGE_STARTED',
        actor: ACTOR,
        occurredAt: daysAgoDate((plan.publish?.daysAgo ?? 0) + 1),
      },
    })

    if (isPublished) {
      await prisma.stageEvent.create({
        data: {
          stageId: stage.id,
          type: 'STAGE_PUBLISHED',
          toStatus: plan.publish.status,
          actor: ACTOR,
          occurredAt: daysAgoDate(plan.publish.daysAgo),
        },
      })
    }

    for (const [i, m] of plan.media.entries()) {
      await prisma.journeyMedia.create({
        data: {
          stageId: stage.id,
          role: 'GALLERY',
          url: m.url,
          caption: m.caption,
          isHero: m.isHero,
          isPublished: true,
          sortOrder: i,
        },
      })
    }

    if (plan.sequence === 3) currentStageId = stage.id // the published, in-progress stage
  }

  await prisma.journey.update({ where: { id: journey.id }, data: { currentStageId } })

  await prisma.journeyMessage.create({
    data: {
      journeyId: journey.id,
      body: 'Your loom slot for the medallion border pattern has been confirmed for this week — we’ll share progress photos as tufting continues.',
      authorType: 'ADMIN',
      createdAt: daysAgoDate(2),
    },
  })

  await prisma.notification.create({
    data: {
      journeyId: journey.id,
      type: 'STAGE_PUBLISHED',
      channel: 'EMAIL',
      recipientEmail: CUSTOMER.email,
      stageId: currentStageId,
      stageName: 'Handcrafting in Progress',
      status: 'SENT',
      sentAt: daysAgoDate(2),
    },
  })

  console.log(`Seeded ${ORDER_NUMBER} — customer ${CUSTOMER.name} (${CUSTOMER.email}), journey "${PRODUCT_NAME}".`)
  console.log(`Stages: 1-2 published/COMPLETE, 3 published/IN_PROGRESS (current), 4-6 draft-only/upcoming.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
