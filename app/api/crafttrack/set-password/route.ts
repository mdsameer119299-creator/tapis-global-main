import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyCustomerPasswordSetupToken, signCustomerSession } from '@/lib/crafttrack/session'
import { setCustomerSessionCookie } from '@/lib/crafttrack/cookies'
import { hashPassword } from '@/lib/crafttrack/password'
import { setPasswordByTokenSchema } from '@/lib/crafttrack/validation/customer-password'

export const runtime = 'nodejs'

// Public route — the token itself (emailed by an admin, 24h expiry) is the
// entire authorization model, same pattern as order-lookup proving
// ownership via order number + email. No currentPassword check here: a
// token this narrow (just customerId, single purpose) can't be replayed
// for anything beyond "set this customer's password once."
export async function POST(request: Request) {
  const parsed = setPasswordByTokenSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 })
  }

  const payload = await verifyCustomerPasswordSetupToken(parsed.data.token)
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: 'This link has expired or is invalid. Ask us to send a new one.' },
      { status: 400 },
    )
  }

  const customer = await prisma.customer.findUnique({ where: { id: payload.customerId } })
  if (!customer) {
    return NextResponse.json(
      { ok: false, error: 'This link has expired or is invalid. Ask us to send a new one.' },
      { status: 400 },
    )
  }

  const passwordHash = await hashPassword(parsed.data.password)
  await prisma.customer.update({ where: { id: customer.id }, data: { passwordHash } })

  // Log them straight in — they just proved ownership of this email via
  // the link, no reason to make them re-enter it on /crafttrack/access.
  const sessionToken = await signCustomerSession({ type: 'customer', scope: 'account', customerId: customer.id })
  const response = NextResponse.json({ ok: true })
  setCustomerSessionCookie(response, sessionToken)
  return response
}
