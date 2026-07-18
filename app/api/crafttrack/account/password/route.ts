import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireCustomerSession } from '@/lib/crafttrack/require-customer-session'
import { hashPassword, verifyPassword } from '@/lib/crafttrack/password'
import { setPasswordSchema } from '@/lib/crafttrack/validation/customer-password'
import { checkLoginRateLimit, recordFailedLoginAttempt, resetLoginRateLimit } from '@/lib/crafttrack/login-rate-limit'

export const runtime = 'nodejs'

// Reachable only from inside an authenticated session — proving order+email
// ownership (order scope) or already being logged in (account scope) is
// the entire authorization model. Cannot be used to create arbitrary
// accounts or brute-force passwordHash for a customer who's never proven
// ownership of anything.
export async function POST(request: Request) {
  const auth = await requireCustomerSession()
  if (!auth.ok) return auth.response

  const parsed = setPasswordSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const { customerId } = auth.session

  let customer
  try {
    customer = await prisma.customer.findUniqueOrThrow({ where: { id: customerId } })
  } catch (err) {
    console.error('[crafttrack] password-set lookup failed', err)
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  // A password is already set — this is a change, not first-time setup.
  // Require and verify the current password so a stolen/left-open session
  // can't silently take over the login credential permanently.
  if (customer.passwordHash) {
    const rateLimitKey = `customer-password:${customerId}`
    if (!checkLoginRateLimit(rateLimitKey).allowed) {
      return NextResponse.json({ ok: false, error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    const currentValid = parsed.data.currentPassword
      ? await verifyPassword(parsed.data.currentPassword, customer.passwordHash)
      : false

    if (!currentValid) {
      recordFailedLoginAttempt(rateLimitKey)
      return NextResponse.json({ ok: false, error: 'Current password is incorrect.' }, { status: 401 })
    }

    resetLoginRateLimit(rateLimitKey)
  }

  const passwordHash = await hashPassword(parsed.data.password)
  await prisma.customer.update({ where: { id: customerId }, data: { passwordHash } })

  return NextResponse.json({ ok: true })
}
