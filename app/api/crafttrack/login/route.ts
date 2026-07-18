import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/crafttrack/password'
import { signCustomerSession } from '@/lib/crafttrack/session'
import { setCustomerSessionCookie } from '@/lib/crafttrack/cookies'
import { customerLoginSchema } from '@/lib/crafttrack/validation/customer-auth'
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit,
  getClientIp,
} from '@/lib/crafttrack/login-rate-limit'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const parsed = customerLoginSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email and password.' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const ipKey = `ip:${getClientIp(request)}`
  const emailKey = `email:${email.toLowerCase()}`

  if (!checkLoginRateLimit(ipKey).allowed || !checkLoginRateLimit(emailKey).allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  let customer
  try {
    customer = await prisma.customer.findUnique({ where: { email } })
  } catch (err) {
    console.error('[crafttrack] customer login lookup failed', err)
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  // No distinct branch for "account exists but has no password set" — that
  // would leak account existence and invite an attacker to specifically
  // target that customer's order-lookup path instead. Same generic
  // message for every failure mode: wrong email, wrong password, or no
  // password ever set up.
  const valid = customer?.passwordHash ? await verifyPassword(password, customer.passwordHash) : false

  if (!customer || !valid) {
    recordFailedLoginAttempt(ipKey)
    recordFailedLoginAttempt(emailKey)
    return NextResponse.json({ ok: false, error: 'Incorrect email or password.' }, { status: 401 })
  }

  resetLoginRateLimit(ipKey)
  resetLoginRateLimit(emailKey)

  const token = await signCustomerSession({ type: 'customer', scope: 'account', customerId: customer.id })

  const response = NextResponse.json({ ok: true })
  setCustomerSessionCookie(response, token)
  return response
}
