// Creates the FIRST admin account, reading credentials from env so they're
// controlled by whoever deploys this (never invented/hardcoded here). Safe
// to re-run — upserts on email, so it won't create duplicates or clobber a
// password that's already been changed via the admin UI after first login.
//
// Also seeds the one v1 Journey Template ("Standard Luxury Manufacturing
// Journey") and its 6 stages — without this, the admin has no template to
// select when creating an order (see docs/CRAFTTRACK-PRODUCT-DESIGN.md §5).
// Also idempotent — upserts on template name, safe to re-run.
//
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/crafttrack/password'

const prisma = new PrismaClient()

const STANDARD_TEMPLATE_NAME = 'Standard Luxury Manufacturing Journey'

const STANDARD_TEMPLATE_STAGES = [
  { name: 'Order Confirmed', description: 'Your order has been confirmed and production is being scheduled.' },
  { name: 'Preparation Underway', description: 'Materials are being sourced and prepared for your piece.' },
  { name: 'Handcrafting in Progress', description: 'Skilled artisans are hand-crafting your piece, following your approved specification.' },
  { name: 'Finishing & Quality Inspection', description: 'Your piece is undergoing finishing work and a full quality inspection.' },
  { name: 'Ready for Dispatch', description: 'Your piece has passed inspection and is being prepared for export.' },
  { name: 'Dispatched', description: 'Your piece is on its way to you.' },
]

async function seedAdminUser() {
  const email = process.env.ADMIN_SEED_EMAIL
  const password = process.env.ADMIN_SEED_PASSWORD

  if (!email || !password) {
    throw new Error(
      'ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set (see docs/CRAFTTRACK-SETUP.md) before seeding.',
    )
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) {
    console.log(`Admin user ${email} already exists — skipping (change the password via the admin UI, not this script).`)
    return
  }

  const passwordHash = await hashPassword(password)
  await prisma.adminUser.create({
    data: { email, passwordHash, name: 'CraftTrack Admin' },
  })
  console.log(`Created first admin user: ${email}`)
}

async function seedStandardJourneyTemplate() {
  const existing = await prisma.journeyTemplate.findUnique({ where: { name: STANDARD_TEMPLATE_NAME } })
  if (existing) {
    console.log(`Journey template "${STANDARD_TEMPLATE_NAME}" already exists — skipping.`)
    return
  }

  await prisma.journeyTemplate.create({
    data: {
      name: STANDARD_TEMPLATE_NAME,
      description: 'The default six-stage production journey used for every order until a second template is needed.',
      stages: {
        create: STANDARD_TEMPLATE_STAGES.map((stage, index) => ({
          name: stage.name,
          description: stage.description,
          sequence: index + 1,
        })),
      },
    },
  })
  console.log(`Created journey template "${STANDARD_TEMPLATE_NAME}" with ${STANDARD_TEMPLATE_STAGES.length} stages.`)
}

async function main() {
  await seedAdminUser()
  await seedStandardJourneyTemplate()
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
