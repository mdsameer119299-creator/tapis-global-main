// Creates the FIRST admin account, reading credentials from env so they're
// controlled by whoever deploys this (never invented/hardcoded here). Safe
// to re-run — upserts on email, so it won't create duplicates or clobber a
// password that's already been changed via the admin UI after first login.
//
// Run with: npx prisma db seed

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/crafttrack/password'

const prisma = new PrismaClient()

async function main() {
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

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
