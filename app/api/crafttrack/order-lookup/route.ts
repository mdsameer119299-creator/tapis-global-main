import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signCustomerSession } from '@/lib/crafttrack/session'
import { setCustomerSessionCookie } from '@/lib/crafttrack/cookies'
import { orderLookupSchema } from '@/lib/crafttrack/validation/customer-auth'
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
  getClientIp,
} from '@/lib/crafttrack/login-rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const parsed = orderLookupSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter your order number and the email address on the order.' }, { status: 400 })
  }

  const { orderNumber, email } = parsed.data

  // Keyed by the pair, not email alone — rate-limiting by email alone
  // would let an attacker freely enumerate order numbers against one
  // known email. Also keyed by IP as a second, independent gate.
  const ipKey = `ip:${getClientIp(request)}`
  const pairKey = `pair:${orderNumber.toLowerCase()}:${email.toLowerCase()}`

  if (!checkLoginRateLimit(ipKey).allowed || !checkLoginRateLimit(pairKey).allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  let order
  try {
    order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { customer: true },
    })
  } catch (err) {
    console.error('[crafttrack] order lookup failed', err)
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  if (!order || order.customer.email.toLowerCase() !== email.toLowerCase()) {
    recordFailedLoginAttempt(ipKey)
    recordFailedLoginAttempt(pairKey)
    // Deliberately identical whether the order doesn't exist or the email
    // doesn't match it — never reveal which.
    return NextResponse.json({ ok: false, error: 'We couldn’t find an order matching those details.' }, { status: 401 })
  }

  resetLoginRateLimit(ipKey)
  resetLoginRateLimit(pairKey)

  const token = await signCustomerSession({ type: 'customer', scope: 'order', customerId: order.customerId, orderId: order.id })

  const response = NextResponse.json({ ok: true, orderNumber: order.orderNumber })
  setCustomerSessionCookie(response, token)
  return response
}
